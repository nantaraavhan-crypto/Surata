import { createCachedHandler } from "../utils";
import { scrapeAllGovtJobs } from "@/lib/scraper";
import type { GovtJob } from "@/types";
export const maxDuration = 60;

export const GET = createCachedHandler({
  fetcher: scrapeAllGovtJobs,
  cacheDurationMs: 60 * 1000,
  filterFn: (jobs, searchParams) => {
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "All";

    let filtered = jobs;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (j) => j.title.toLowerCase().includes(q) || j.organization.toLowerCase().includes(q)
      );
    }
    if (category !== "All") {
      filtered = filtered.filter((j) => j.category === category);
    }
    return filtered;
  },
  transformFn: (jobs, searchParams) => ({
    total: jobs.length,
    lastUpdated: new Date().toISOString(),
    jobs,
  }),
});
