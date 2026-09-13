"use client";
import { useState } from "react";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";

interface IITIIMNews {
  id: string;
  title: string;
  institute: string;
  type: "recruitment" | "admission" | "result" | "news";
  url: string;
  date: string;
  source: string;
  scrapedAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  recruitment: "bg-green-500/20 text-green-400",
  admission: "bg-blue-500/20 text-blue-400",
  result: "bg-purple-500/20 text-purple-400",
  news: "bg-slate-700 text-slate-300",
};

export default function IITsIIMsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data, isLoading, lastUpdated, refresh } = useLiveUpdates({
    url: "/api/iits-iims",
    interval: 60,
    fallbackData: [] as IITIIMNews[],
    transform: (d: unknown) => (d as { news?: IITIIMNews[] }).news || [],
  });

  const allNews = data;

  const filtered = allNews.filter((item) => {
    const matchSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.institute.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || item.type === typeFilter;
    return matchSearch && matchType;
  });

  const counts = { recruitment: 0, admission: 0, result: 0, news: 0 };
  for (const item of allNews) counts[item.type]++;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 border-b border-orange-900 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            <span className="text-orange-400">IITs & IIMs</span> — Recruitment, Admissions & News
          </h1>
          <p className="text-slate-400 text-sm mb-5">
            Faculty positions, non-teaching recruitment, admissions, and results from all IITs and IIMs
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Search (IIT Bombay, IIM Ahmedabad, faculty, recruitment...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <button onClick={() => setTypeFilter("all")} className={`px-3 py-1 rounded-full text-xs font-bold transition ${typeFilter === "all" ? "bg-orange-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
              All ({allNews.length})
            </button>
            <button onClick={() => setTypeFilter("recruitment")} className={`px-3 py-1 rounded-full text-xs font-bold transition ${typeFilter === "recruitment" ? "bg-green-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
              Recruitment ({counts.recruitment})
            </button>
            <button onClick={() => setTypeFilter("admission")} className={`px-3 py-1 rounded-full text-xs font-bold transition ${typeFilter === "admission" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
              Admission ({counts.admission})
            </button>
            <button onClick={() => setTypeFilter("result")} className={`px-3 py-1 rounded-full text-xs font-bold transition ${typeFilter === "result" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
              Result ({counts.result})
            </button>
            <button onClick={() => setTypeFilter("news")} className={`px-3 py-1 rounded-full text-xs font-bold transition ${typeFilter === "news" ? "bg-slate-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
              News ({counts.news})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading && allNews.length === 0 && (
          <div className="flex flex-col items-center py-20">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-slate-400">Loading...</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">No results</div>
            <h3 className="text-lg font-bold text-slate-300">No IIT/IIM updates found</h3>
            <p className="text-sm text-slate-500 mt-1">{search ? "Try different search" : "No updates available right now"}</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-orange-500/50 transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${TYPE_COLORS[item.type]}`}>
                        {item.type.toUpperCase()}
                      </span>
                      <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs font-bold">
                        {item.institute}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>Source: {item.source}</span>
                    </div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 px-4 rounded-lg text-center transition text-sm min-w-[120px]"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
