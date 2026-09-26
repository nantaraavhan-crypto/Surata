import { createCachedHandler } from "../utils";
import { scrapePrivateJobs } from "@/lib/privateJobScraper";
export const maxDuration = 60;

export const GET = createCachedHandler({
  fetcher: scrapePrivateJobs,
  cacheDurationMs: 60 * 1000,
});
