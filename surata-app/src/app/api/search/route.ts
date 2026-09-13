import { NextResponse } from "next/server";
import { MemoryCache } from "@/lib/utils/cache";

interface SearchResult {
  id: string;
  title: string;
  type: "govt-job" | "private-job" | "internship" | "scholarship" | "hackathon" | "result" | "admit-card" | "news";
  category: string;
  source: string;
  url: string;
  date: string;
}

const cache = new MemoryCache<SearchResult[]>(10 * 60 * 1000);

function matchesQuery(item: { title: string; category?: string; source?: string; organization?: string }, query: string): boolean {
  const q = query.toLowerCase();
  const searchable = [
    item.title,
    item.category,
    item.source,
    item.organization,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q.split(" ").every((word) => searchable.includes(word));
}

async function fetchAllData(): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const now = new Date().toISOString();

  const fetchers = [
    {
      url: "/api/jobs",
      transform: (data: unknown) => {
        const d = data as { jobs?: Array<{ title: string; url: string; organization: string; category: string; scrapedAt: string }> };
        return (d.jobs || []).map((j): SearchResult => ({
          id: j.title.slice(0, 60),
          title: j.title,
          type: "govt-job" as const,
          category: j.category,
          source: j.organization,
          url: j.url,
          date: j.scrapedAt,
        }));
      },
    },
    {
      url: "/api/livePrivateJobs",
      transform: (data: unknown) => {
        const d = data as { jobs?: Array<{ title: string; applyUrl: string; company: string; department: string; source: string; scrapedAt: string }> };
        return (d.jobs || []).map((j): SearchResult => ({
          id: j.title.slice(0, 60),
          title: j.title,
          type: "private-job" as const,
          category: j.department,
          source: j.company,
          url: j.applyUrl,
          date: j.scrapedAt,
        }));
      },
    },
    {
      url: "/api/liveInternships",
      transform: (data: unknown) => {
        const d = data as { internships?: Array<{ title: string; url: string; company: string; type: string; source: string; scrapedAt: string }> };
        return (d.internships || []).map((i): SearchResult => ({
          id: i.title.slice(0, 60),
          title: i.title,
          type: "internship" as const,
          category: i.type,
          source: i.company,
          url: i.url,
          date: i.scrapedAt,
        }));
      },
    },
    {
      url: "/api/liveScholarships",
      transform: (data: unknown) => {
        const d = data as { scholarships?: Array<{ title: string; url: string; provider: string; category: string; source: string; scrapedAt: string }> };
        return (d.scholarships || []).map((s): SearchResult => ({
          id: s.title.slice(0, 60),
          title: s.title,
          type: "scholarship" as const,
          category: s.category,
          source: s.provider,
          url: s.url,
          date: s.scrapedAt,
        }));
      },
    },
    {
      url: "/api/liveHackathons",
      transform: (data: unknown) => {
        const d = data as { hackathons?: Array<{ title: string; url: string; organizer: string; mode: string; source: string; scrapedAt: string }> };
        return (d.hackathons || []).map((h): SearchResult => ({
          id: h.title.slice(0, 60),
          title: h.title,
          type: "hackathon" as const,
          category: h.mode,
          source: h.organizer,
          url: h.url,
          date: h.scrapedAt,
        }));
      },
    },
    {
      url: "/api/live",
      transform: (data: unknown) => {
        const d = data as {
          results?: Array<{ title: string; url: string; organization: string; source: string; scrapedAt: string }>;
          admitCards?: Array<{ title: string; url: string; organization: string; source: string; scrapedAt: string }>;
        };
        const items: SearchResult[] = [];
        (d.results || []).forEach((r) => {
          items.push({
            id: r.title.slice(0, 60),
            title: r.title,
            type: "result",
            category: "Exam Result",
            source: r.organization,
            url: r.url,
            date: r.scrapedAt,
          });
        });
        (d.admitCards || []).forEach((a) => {
          items.push({
            id: a.title.slice(0, 60),
            title: a.title,
            type: "admit-card",
            category: "Admit Card",
            source: a.organization,
            url: a.url,
            date: a.scrapedAt,
          });
        });
        return items;
      },
    },
  ];

  const HOST = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const fetchResults = await Promise.allSettled(
    fetchers.map(async (f) => {
      try {
        const res = await fetch(`${HOST}${f.url}`, {
          signal: AbortSignal.timeout(20000),
          next: { revalidate: 300 },
        });
        if (!res.ok) return [];
        const json = await res.json();
        return f.transform(json);
      } catch {
        return [];
      }
    })
  );

  for (const result of fetchResults) {
    if (result.status === "fulfilled") {
      results.push(...result.value);
    }
  }

  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

  if (!query || query.length < 2) {
    return NextResponse.json({
      results: [],
      total: 0,
      query,
      suggestion: "Type at least 2 characters to search",
    });
  }

  try {
    if (cache.isStale()) {
      const allData = await fetchAllData();
      cache.set(allData);
    }
  } catch (e) {
    console.error("Search data fetch failed:", e);
    if (!cache.get()) {
      return NextResponse.json({ results: [], total: 0, query });
    }
  }

  const allData = cache.get() || [];
  let filtered = allData.filter((item) => matchesQuery(item, query));

  if (type !== "all") {
    filtered = filtered.filter((item) => item.type === type);
  }

  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const results = filtered.slice(0, limit);

  return NextResponse.json({
    results,
    total: filtered.length,
    query,
    type,
    lastUpdated: new Date().toISOString(),
  });
}
