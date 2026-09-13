import { createCachedHandler } from "../utils";
import { scrapeHackathons } from "@/lib/hackathonScraper";

export const GET = createCachedHandler({
  fetcher: scrapeHackathons,
  cacheDurationMs: 30 * 60 * 1000,
});
