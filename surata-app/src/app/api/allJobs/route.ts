import { createCachedHandler } from "../utils";
import { scrapeComprehensiveJobs } from "@/lib/comprehensiveJobScraper";
export const maxDuration = 60;

export const GET = createCachedHandler({
  fetcher: scrapeComprehensiveJobs,
  cacheDurationMs: 60 * 1000,
});
