import { NextResponse } from "next/server";
import { scrapeEverything } from "@/lib/liveScraper";
import { scrapeAllOfficialUpdates, type OfficialUpdate } from "@/lib/officialGovtScraper";
import { scrapeAllPSUUpdates, type PSUUpdate } from "@/lib/psuScraper";
import { dedupByTitle } from "@/lib/utils/dedup";
import { MemoryCache } from "@/lib/utils/cache";
import { cachedDataWithFallback } from "@/app/api/utils";
export const maxDuration = 60;

interface UpdateItem {
  id: string;
  title: string;
  category: string;
  source: string;
  date: string;
  url: string;
  important: boolean;
  type: "recruitment" | "result" | "admit-card" | "notification" | "news";
}

function liveItemToUpdate(item: { title: string; url: string; category?: string; source: string; scrapedAt: string; status: string }, fallbackCategory: string): UpdateItem {
  const type = item.status === "declared" ? "result" : item.status === "available" ? "admit-card" : "recruitment";
  return {
    id: item.title.slice(0, 60) + item.scrapedAt,
    title: item.title,
    category: item.category || fallbackCategory,
    source: item.source,
    date: item.scrapedAt.split("T")[0],
    url: item.url,
    important: item.status === "declared",
    type,
  };
}

function officialItemToUpdate(item: OfficialUpdate): UpdateItem {
  return {
    id: item.title.slice(0, 60) + item.scrapedAt,
    title: item.title,
    category: item.category,
    source: item.source,
    date: item.date,
    url: item.url,
    important: item.type === "result" || item.type === "recruitment",
    type: item.type,
  };
}

function psuItemToUpdate(item: PSUUpdate): UpdateItem {
  const typeMap: Record<string, UpdateItem["type"]> = {
    result: "result",
    "admit-card": "admit-card",
    recruitment: "recruitment",
    admission: "notification",
    news: "news",
  };
  return {
    id: item.id,
    title: item.title,
    category: item.organization,
    source: item.source,
    date: item.date,
    url: item.url,
    important: item.category === "recruitment" || item.category === "result",
    type: typeMap[item.category] || "news",
  };
}

const cache = new MemoryCache<UpdateItem[]>(60 * 1000);
// Built once at module scope so every invocation reads the same shared
// Data Cache entry instead of re-scraping on a fresh instance.
const sharedUpdates = cachedDataWithFallback(fetchUpdates);

async function fetchUpdates(): Promise<UpdateItem[]> {
  const [liveData, officialSites, psuData] = await Promise.allSettled([
    scrapeEverything(),
    scrapeAllOfficialUpdates(),
    scrapeAllPSUUpdates(),
  ]);

  const allUpdates: UpdateItem[] = [];

  if (liveData.status === "fulfilled") {
    const d = liveData.value;
    allUpdates.push(...d.results.map((i) => liveItemToUpdate(i, "Staff Selection")));
    allUpdates.push(...d.admitCards.map((i) => liveItemToUpdate(i, "Staff Selection")));
    allUpdates.push(...d.answerKeys.map((i) => liveItemToUpdate(i, "Staff Selection")));
  }

  if (officialSites.status === "fulfilled") {
    allUpdates.push(...officialSites.value.map(officialItemToUpdate));
  }

  if (psuData.status === "fulfilled") {
    allUpdates.push(...psuData.value.map(psuItemToUpdate));
  }

  return dedupByTitle(allUpdates, 50);
}

export async function GET(request: Request) {
  let cached: UpdateItem[];
  try {
    cached = await cache.getWithRevalidate(sharedUpdates);
  } catch (e) {
    console.error("Updates scrape failed:", e);
    return NextResponse.json({ updates: [], lastUpdated: null });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  let updates = cached;
  if (search) {
    const q = search.toLowerCase();
    updates = updates.filter(
      (u) => u.title.toLowerCase().includes(q) || u.category.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    total: updates.length,
    lastUpdated: new Date().toISOString(),
    updates,
  });
}
