import { createCachedHandler } from "../utils";
import { scrapeHackathons } from "@/lib/hackathonScraper";
export const maxDuration = 60;

export const GET = createCachedHandler({
  fetcher: scrapeHackathons,
  cacheDurationMs: 60 * 1000,
});
