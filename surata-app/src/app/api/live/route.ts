import { createCachedHandler } from "../utils";
import { scrapeEverything } from "@/lib/liveScraper";
export const maxDuration = 60;

export const GET = createCachedHandler({
  fetcher: scrapeEverything,
  cacheDurationMs: 60 * 1000,
});
