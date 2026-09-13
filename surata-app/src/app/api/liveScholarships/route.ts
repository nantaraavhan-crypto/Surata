import { createCachedHandler } from "../utils";
import { scrapeScholarships } from "@/lib/scholarshipScraper";

export const GET = createCachedHandler({
  fetcher: scrapeScholarships,
  cacheDurationMs: 30 * 60 * 1000,
});
