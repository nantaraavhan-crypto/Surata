import { NextResponse } from "next/server";
import { scrapeAllGovtJobs } from "@/lib/scraper";
import { scrapeEverything } from "@/lib/liveScraper";
import { scrapeInternships } from "@/lib/internshipScraper";
import { scrapeHackathons } from "@/lib/hackathonScraper";
import { scrapeScholarships } from "@/lib/scholarshipScraper";
import { scrapeAllOfficialUpdates } from "@/lib/officialGovtScraper";
import { scrapeAllSarkariSections } from "@/lib/sarkariScraper";
import { scrapeComprehensiveJobs } from "@/lib/comprehensiveJobScraper";
import { scrapeIITIIMNews } from "@/lib/iitsIimsScraper";
import { notifyDegraded } from "@/lib/health";
import { cachedData } from "@/app/api/utils";

interface ScraperResult {
  name: string;
  count: number;
  success: boolean;
  error?: string;
  durationMs: number;
}

async function runScraper(
  name: string,
  fn: () => Promise<unknown>
): Promise<ScraperResult> {
  const start = Date.now();
  try {
    const result = await fn();
    const count = Array.isArray(result)
      ? result.length
      : typeof result === "object" && result !== null
        ? Object.values(result).reduce(
            (acc: number, v) => acc + (Array.isArray(v) ? v.length : 0),
            0
          )
        : 0;
    return { name, count, success: true, durationMs: Date.now() - start };
  } catch (error) {
    return {
      name,
      count: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      durationMs: Date.now() - start,
    };
  }
}

const SCRAPERS = [
  ["govt-jobs", scrapeAllGovtJobs, 15],
  ["live-results", scrapeEverything, 40],
  ["internships", scrapeInternships, 50],
  ["hackathons", scrapeHackathons, 10],
  ["scholarships", scrapeScholarships, 10],
  ["official-updates", scrapeAllOfficialUpdates, 10],
  ["sarkari-sections", scrapeAllSarkariSections, 50],
  ["comprehensive-jobs", scrapeComprehensiveJobs, 50],
  ["iit-iim-news", scrapeIITIIMNews, 5],
] as const;

export async function runCron(label: string) {
  const startTime = Date.now();
  console.log(`[CRON:${label}] Starting scrape cycle at ${new Date().toISOString()}`);

  // Cron reads through the shared Data Cache rather than scraping directly.
  // It runs hours apart, so the snapshot is always expired and this is a real
  // scrape — but writing the result back means the *next* visitor reads an
  // already-warm snapshot instead of paying for it themselves.
  const results = await Promise.allSettled(
    // `cachedData<unknown>` because SCRAPERS is a heterogeneous tuple and
    // inference would otherwise pin T to the first entry's return type. Cron
    // only ever counts items, so the precise type buys nothing here.
    SCRAPERS.map(([name, fn]) => runScraper(name, cachedData<unknown>(fn)))
  );

  const scraperResults = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { name: "unknown", count: 0, success: false, error: "Promise rejected", durationMs: 0 }
  );

  const succeeded = scraperResults.filter((r) => r.success).length;
  const failed = scraperResults.filter((r) => !r.success);
  const totalItems = scraperResults.reduce((acc, r) => acc + r.count, 0);
  const totalDuration = Date.now() - startTime;

  console.log(
    `[CRON:${label}] Completed: ${succeeded}/${scraperResults.length} scrapers, ${totalItems} items, ${totalDuration}ms`
  );

  if (failed.length > 0) {
    console.error(
      `[CRON:${label}] Failed:`,
      failed.map((f) => `${f.name}: ${f.error}`)
    );
  }

  // A scraper that succeeds while returning almost nothing is the failure
  // that actually hurts: the page renders fine and shows an empty section.
  // That is how the app went months showing zero internships without anyone
  // noticing, so treat a near-empty result as a failure worth alerting on.
  const low = SCRAPERS.map(([name, , minimum]) => ({
    name,
    minimum,
    count: scraperResults.find((r) => r.name === name)?.count ?? 0,
  })).filter((s) => s.count < s.minimum);

  if (low.length > 0) {
    const text =
      `[CRON:${label}] Surata data check needs attention ` +
      `(${new Date().toISOString()})\n` +
      low
        .map((s) => `• ${s.name}: ${s.count} items (expected ${s.minimum}+)`)
        .join("\n");
    console.error(text);
    await notifyDegraded(text);
  }

  return NextResponse.json({
    success: failed.length === 0 && low.length === 0,
    label,
    timestamp: new Date().toISOString(),
    summary: {
      totalScrapers: scraperResults.length,
      succeeded,
      failed: failed.length,
      lowCount: low.length,
      totalItems,
      totalDurationMs: totalDuration,
    },
    scrapers: scraperResults,
  });
}
