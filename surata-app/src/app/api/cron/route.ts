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
    return {
      name,
      count,
      success: true,
      durationMs: Date.now() - start,
    };
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

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  console.log(`[CRON] Starting full scrape cycle at ${new Date().toISOString()}`);

  const scrapers = [
    runScraper("govt-jobs", scrapeAllGovtJobs),
    runScraper("live-results", scrapeEverything),
    runScraper("internships", scrapeInternships),
    runScraper("hackathons", scrapeHackathons),
    runScraper("scholarships", scrapeScholarships),
    runScraper("official-updates", scrapeAllOfficialUpdates),
    runScraper("sarkari-sections", scrapeAllSarkariSections),
    runScraper("comprehensive-jobs", scrapeComprehensiveJobs),
    runScraper("iit-iim-news", scrapeIITIIMNews),
  ];

  const results = await Promise.allSettled(scrapers);
  const scraperResults = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { name: "unknown", count: 0, success: false, error: "Promise rejected", durationMs: 0 }
  );

  const succeeded = scraperResults.filter((r) => r.success).length;
  const failed = scraperResults.filter((r) => !r.success);
  const totalItems = scraperResults.reduce((acc, r) => acc + r.count, 0);
  const totalDuration = Date.now() - startTime;

  console.log(`[CRON] Completed: ${succeeded}/${scraperResults.length} scrapers, ${totalItems} items, ${totalDuration}ms`);

  if (failed.length > 0) {
    console.error(
      "[CRON] Failed scrapers:",
      failed.map((f) => `${f.name}: ${f.error}`)
    );
  }

  return NextResponse.json({
    success: failed.length === 0,
    timestamp: new Date().toISOString(),
    summary: {
      totalScrapers: scraperResults.length,
      succeeded,
      failed: failed.length,
      totalItems,
      totalDurationMs: totalDuration,
    },
    scrapers: scraperResults,
  });
}
