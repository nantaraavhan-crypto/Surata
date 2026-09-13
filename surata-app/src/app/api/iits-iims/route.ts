import { createCachedHandler } from "../utils";
import { scrapeIITIIMNews } from "@/lib/iitsIimsScraper";

export const GET = createCachedHandler({
  fetcher: scrapeIITIIMNews,
  cacheDurationMs: 30 * 60 * 1000,
});
