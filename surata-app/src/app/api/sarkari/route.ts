import { NextResponse } from "next/server";
import { scrapeAllSarkariSections } from "@/lib/sarkariScraper";
import { MemoryCache } from "@/lib/utils/cache";
import { cachedData } from "@/app/api/utils";
export const maxDuration = 60;

type SarkariData = Awaited<ReturnType<typeof scrapeAllSarkariSections>>;
const cache = new MemoryCache<SarkariData>(60 * 1000);
// Built once at module scope so every invocation reads the same shared
// Data Cache entry instead of re-scraping on a fresh instance.
const sharedSarkari = cachedData(scrapeAllSarkariSections);

export async function GET(request: Request) {
  let data: SarkariData;
  try {
    data = await cache.getWithRevalidate(sharedSarkari);
  } catch (e) {
    console.error("Scrape failed:", e);
    return NextResponse.json({ error: "Scrape not available" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section") || "all";

  const response: Record<string, unknown> = { lastUpdated: data.scrapedAt };

  if (section === "all" || section === "results") response.results = data.results;
  if (section === "all" || section === "admit-cards") response.admitCards = data.admitCards;
  if (section === "all" || section === "answer-keys") response.answerKeys = data.answerKeys;
  if (section === "all" || section === "latest-jobs") response.latestJobs = data.latestJobs;
  if (section === "all" || section === "admissions") response.admissions = data.admissions;
  if (section === "all" || section === "syllabus") response.syllabus = data.syllabus;

  return NextResponse.json(response);
}
