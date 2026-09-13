import { createCachedHandler } from "../utils";
import { scrapeEverything } from "@/lib/liveScraper";

export const GET = createCachedHandler({
  fetcher: scrapeEverything,
  cacheDurationMs: 15 * 60 * 1000,
});
