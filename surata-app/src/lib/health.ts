import { cachedData } from "@/app/api/utils";
import { scrapeAllGovtJobs } from "@/lib/scraper";
import { scrapeEverything } from "@/lib/liveScraper";
import { scrapeInternships } from "@/lib/internshipScraper";
import { scrapeScholarships } from "@/lib/scholarshipScraper";
import { scrapeHackathons } from "@/lib/hackathonScraper";
import { scrapeAllSarkariSections } from "@/lib/sarkariScraper";
import { scrapeComprehensiveJobs } from "@/lib/comprehensiveJobScraper";

export interface SectionStatus {
  key: string;
  label: string;
  /** Items currently served for this section. */
  count: number;
  /** Anything below this means the source stopped answering. */
  minimum: number;
  status: "ok" | "low" | "error";
  error?: string;
}

export interface HealthReport {
  status: "ok" | "degraded";
  checkedAt: string;
  /** Round-trip time for every section, so slow sources stay visible. */
  slowestMs: number;
  sections: SectionStatus[];
}

function listLength(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") {
    const arrays = Object.values(value).filter(Array.isArray) as unknown[][];
    if (arrays.length) return arrays.reduce((sum, a) => sum + a.length, 0);
  }
  return 0;
}

/**
 * Each entry holds the *same* scraper function the public API route passes to
 * `createCachedHandler`, so `cachedData` derives the identical cache key and
 * this reads what the site is already serving instead of scraping a second
 * time. Unless the source genuinely broke — in which case this is the first
 * thing to show it.
 */
const SECTIONS: {
  key: string;
  label: string;
  minimum: number;
  scrape: () => Promise<unknown>;
}[] = [
  { key: "jobs", label: "Government jobs", minimum: 15, scrape: scrapeAllGovtJobs },
  {
    key: "live",
    label: "Results, admit cards & answer keys",
    minimum: 40,
    scrape: scrapeEverything,
  },
  { key: "internships", label: "Internships", minimum: 50, scrape: scrapeInternships },
  { key: "scholarships", label: "Scholarships", minimum: 10, scrape: scrapeScholarships },
  {
    key: "hackathons",
    label: "Competitions & hackathons",
    minimum: 10,
    scrape: scrapeHackathons,
  },
  {
    key: "sarkari",
    label: "Exam notifications",
    minimum: 50,
    scrape: scrapeAllSarkariSections,
  },
  {
    key: "allJobs",
    label: "Aggregated job listings",
    minimum: 50,
    scrape: scrapeComprehensiveJobs,
  },
];

async function checkSection(
  section: (typeof SECTIONS)[number]
): Promise<{ status: SectionStatus; ms: number }> {
  const started = Date.now();

  try {
    const cached = cachedData(section.scrape);
    const count = listLength(await cached());

    return {
      status: {
        key: section.key,
        label: section.label,
        count,
        minimum: section.minimum,
        status: count >= section.minimum ? "ok" : "low",
      },
      ms: Date.now() - started,
    };
  } catch (error) {
    return {
      status: {
        key: section.key,
        label: section.label,
        count: 0,
        minimum: section.minimum,
        status: "error",
        error: error instanceof Error ? error.message.slice(0, 200) : "Unknown error",
      },
      ms: Date.now() - started,
    };
  }
}

/**
 * Runs every section in parallel and reports which stopped producing data.
 *
 * Without this the failure is silent: a site changing its markup makes a
 * section render empty, and nobody finds out until a user complains. That is
 * exactly how the app spent weeks showing zero internships and zero
 * competitions without anyone noticing.
 */
export async function runHealthCheck(): Promise<HealthReport> {
  const results = await Promise.all(SECTIONS.map(checkSection));
  const sections = results.map((r) => r.status);
  const failed = sections.filter((s) => s.status !== "ok");

  return {
    status: failed.length === 0 ? "ok" : "degraded",
    checkedAt: new Date().toISOString(),
    slowestMs: Math.max(...results.map((r) => r.ms), 0),
    sections,
  };
}

/**
 * Posts a readable summary to whatever webhook the operator configures.
 *
 * Nothing is sent when no webhook is set, so this stays silent until there is
 * something worth waking someone up for. Set `ALERT_WEBHOOK_URL` (Discord,
 * Slack, or any JSON endpoint) to be notified.
 */
export async function notifyDegraded(text: string): Promise<void> {
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Slack and Discord both accept `text`/`content`; other endpoints ignore
      // fields they do not recognise.
      body: JSON.stringify({ text, content: text }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // A failed alert must never break the check itself.
  }
}

/** Convenience wrapper that formats a report for `notifyDegraded`. */
export async function notifyIfDegraded(report: HealthReport): Promise<void> {
  if (report.status === "ok") return;

  const problems = report.sections
    .filter((s) => s.status !== "ok")
    .map((s) =>
      s.status === "error"
        ? `• ${s.label}: failed (${s.error})`
        : `• ${s.label}: ${s.count} items (expected ${s.minimum}+)`
    );

  await notifyDegraded(
    `Surata data check needs attention (${report.checkedAt})\n${problems.join("\n")}`
  );
}
