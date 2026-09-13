import { NextResponse } from "next/server";
import { scrapeEverything } from "@/lib/liveScraper";
import { scrapeAllGovtJobs } from "@/lib/scraper";

async function runScraper(name: string, fn: () => Promise<unknown>) {
  const start = Date.now();
  try {
    const result = await fn();
    const count = Array.isArray(result) ? result.length : 0;
    return { name, count, success: true, durationMs: Date.now() - start };
  } catch (error) {
    return {
      name,
      count: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown",
      durationMs: Date.now() - start,
    };
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  console.log(`[CRON-FAST] Starting at ${new Date().toISOString()}`);

  const results = await Promise.allSettled([
    runScraper("live-results", scrapeEverything),
    runScraper("govt-jobs", scrapeAllGovtJobs),
  ]);

  const scraperResults = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { name: "unknown", count: 0, success: false, error: "Rejected", durationMs: 0 }
  );

  const totalItems = scraperResults.reduce((a, r) => a + r.count, 0);
  console.log(`[CRON-FAST] Done: ${scraperResults.filter((r) => r.success).length}/${scraperResults.length} scrapers, ${totalItems} items, ${Date.now() - start}ms`);

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    scrapers: scraperResults,
  });
}
