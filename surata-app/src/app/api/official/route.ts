import { createCachedHandler } from "../utils";
import { scrapeAllOfficialLinks } from "@/lib/officialScraper";
export const maxDuration = 60;

export const GET = createCachedHandler({
  fetcher: scrapeAllOfficialLinks,
  cacheDurationMs: 60 * 1000,
});
