import { createCachedHandler } from "../utils";
import { scrapeInternships } from "@/lib/internshipScraper";
export const maxDuration = 60;

export const GET = createCachedHandler({
  fetcher: scrapeInternships,
  cacheDurationMs: 60 * 1000,
});
