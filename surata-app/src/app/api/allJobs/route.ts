import { createCachedHandler } from "../utils";
import { scrapeComprehensiveJobs } from "@/lib/comprehensiveJobScraper";

export const GET = createCachedHandler({
  fetcher: scrapeComprehensiveJobs,
  cacheDurationMs: 15 * 60 * 1000,
});
