import { createCachedHandler } from "../utils";
import { scrapeAllOfficialLinks } from "@/lib/officialScraper";

export const GET = createCachedHandler({
  fetcher: scrapeAllOfficialLinks,
  cacheDurationMs: 30 * 60 * 1000,
});
