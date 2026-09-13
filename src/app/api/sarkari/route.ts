import { NextResponse } from "next/server";
import { scrapeAllSarkariSections } from "@/lib/sarkariScraper";
import { MemoryCache } from "@/lib/utils/cache";

type SarkariData = Awaited<ReturnType<typeof scrapeAllSarkariSections>>;
const cache = new MemoryCache<SarkariData>(30 * 60 * 1000);

export async function GET(request: Request) {
  try {
    if (cache.isStale()) {
      const data = await scrapeAllSarkariSections();
      cache.set(data);
    }
  } catch (e) {
    console.error("Scrape failed:", e);
    if (!cache.get()) {
      return NextResponse.json({ error: "Scrape not available" }, { status: 503 });
    }
  }

  const data = cache.get();
  if (!data) {
    return NextResponse.json({ error: "No data available" }, { status: 503 });
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
