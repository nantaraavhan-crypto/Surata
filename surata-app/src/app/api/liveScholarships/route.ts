import { createCachedHandler } from "../utils";
import { scrapeScholarships } from "@/lib/scholarshipScraper";
export const maxDuration = 60;

export const GET = createCachedHandler({
  fetcher: scrapeScholarships,
  cacheDurationMs: 60 * 1000,
});
