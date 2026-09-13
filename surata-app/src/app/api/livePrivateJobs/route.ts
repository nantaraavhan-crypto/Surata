import { createCachedHandler } from "../utils";
import { scrapePrivateJobs } from "@/lib/privateJobScraper";

export const GET = createCachedHandler({
  fetcher: scrapePrivateJobs,
  cacheDurationMs: 15 * 60 * 1000,
});
