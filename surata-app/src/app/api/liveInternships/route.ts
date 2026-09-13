import { createCachedHandler } from "../utils";
import { scrapeInternships } from "@/lib/internshipScraper";

export const GET = createCachedHandler({
  fetcher: scrapeInternships,
  cacheDurationMs: 15 * 60 * 1000,
});
