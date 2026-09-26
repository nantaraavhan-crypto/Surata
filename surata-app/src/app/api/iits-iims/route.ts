import { createCachedHandler } from "../utils";
import { scrapeIITIIMNews } from "@/lib/iitsIimsScraper";
export const maxDuration = 60;

export const GET = createCachedHandler({
  fetcher: scrapeIITIIMNews,
  cacheDurationMs: 60 * 1000,
});
