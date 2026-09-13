"use client";
import { useEffect, useState } from "react";
import type { OfficialLink } from "@/lib/officialScraper";

export default function ResultsPage() {
  const [results, setResults] = useState<OfficialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/official");
      const data = await res.json();
      const raw: OfficialLink[] = data.results || [];
      const seen = new Set<string>();
      const deduped = raw.filter((item) => {
        const key = item.title
          .toLowerCase()
          .replace(/admit\s*card|answer\s*key|result|response\s*sheet|final\s*answer|merit\s*list|score\s*card|download|view|apply\s*online|notification|advertisement|exam\s*date|syllabus/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setResults(deduped);
      setLastUpdate(data.scrapedAt || new Date().toISOString());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const orgs = [...new Set(results.map((r) => r.organization))].sort();
  const filtered = results.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.organization.toLowerCase().includes(search.toLowerCase());
    const matchOrg = orgFilter === "all" || r.organization === orgFilter;
    return matchSearch && matchOrg;
  });

  function timeSince(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border-b border-emerald-900 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            <span className="text-emerald-400">Exam Results</span> — Official Links Only
          </h1>
          <p className="text-slate-400 text-sm mb-5">
            Direct links to official government result pages — not third-party redirects
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Search (SSC, UPSC, IBPS, RRB...)"
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={fetchData} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-sm transition">
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <button onClick={() => setOrgFilter("all")} className={`px-3 py-1 rounded-full text-xs font-bold transition ${orgFilter === "all" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
              All ({results.length})
            </button>
            {orgs.map((org) => (
              <button key={org} onClick={() => setOrgFilter(org)} className={`px-3 py-1 rounded-full text-xs font-bold transition ${orgFilter === org ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
                {org} ({results.filter((r) => r.organization === org).length})
              </button>
            ))}
          </div>

          {lastUpdate && <p className="text-xs text-slate-600 mt-3">Last updated: {new Date(lastUpdate).toLocaleString("en-IN")}</p>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading && results.length === 0 && (
          <div className="flex flex-col items-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-slate-400">Loading results...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📭</div>
            <h3 className="text-lg font-bold text-slate-300">No results found</h3>
            <p className="text-sm text-slate-500 mt-1">{search ? "Try different search" : "No exam results declared right now"}</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="py-3 px-4 text-slate-400 font-medium w-8">#</th>
                  <th className="py-3 px-4 text-slate-400 font-medium">Exam / Post Name</th>
                  <th className="py-3 px-4 text-slate-400 font-medium">Organization</th>
                  <th className="py-3 px-4 text-slate-400 font-medium">Official Link</th>
                  <th className="py-3 px-4 text-slate-400 font-medium text-right">Scraped</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 text-slate-600 text-xs">{i + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-900/60 text-emerald-400 shrink-0">RESULT</span>
                        <span className="text-white text-xs font-medium">{item.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">{item.organization}</span>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={item.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-white transition"
                      >
                        View Result
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-500">{timeSince(item.scrapedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
