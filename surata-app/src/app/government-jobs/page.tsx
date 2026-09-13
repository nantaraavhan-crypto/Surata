"use client";
import { useState } from "react";
import Link from "next/link";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";

interface GovtJob {
  id: string;
  title: string;
  organization: string;
  category: string;
  state: string;
  totalPosts: number;
  lastDate: string;
  applyUrl: string;
  source: string;
}

const STATES = [
  "All India", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir",
];

const CATEGORIES = [
  "All", "Civil Services", "Staff Selection", "Banking", "Railways",
  "Police", "Defence", "Medical", "Engineering", "Teaching",
  "Judiciary", "IIT/IIM", "PSU", "NTA Exams", "Education",
  "State Government", "Government",
];

export default function GovernmentJobsPage() {
  const [state, setState] = useState("All India");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const govtLive = useLiveUpdates({
    url: "/api/allJobs",
    interval: 60,
    fallbackData: [] as GovtJob[],
    transform: (data: unknown) => {
      const d = data as { jobs?: GovtJob[] };
      return d.jobs || [];
    },
  });

  const allJobs = govtLive.data;

  const filtered = allJobs.filter((job) => {
    const matchSearch = !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.organization.toLowerCase().includes(search.toLowerCase());
    const matchState = state === "All India" || job.state === state;
    const matchCategory = category === "All" || job.category === category;
    return matchSearch && matchState && matchCategory;
  });

  const stateCounts: Record<string, number> = {};
  for (const s of STATES) {
    stateCounts[s] = allJobs.filter((j) => j.state === s).length;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-900 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            <span className="text-cyan-400">Government Jobs</span> — All States & Categories
          </h1>
          <p className="text-slate-400 text-sm mb-5">
            Complete listing from all official Indian government sources — one link per exam
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Link href="/admit-cards" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-bold transition">
              Admit Cards
            </Link>
            <Link href="/results" className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold transition">
              Results
            </Link>
            <Link href="/answer-keys" className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-bold transition">
              Answer Keys
            </Link>
            <Link href="/iits-iims" className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg text-sm font-bold transition">
              IITs & IIMs
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Search jobs (UPSC, SSC, RRB, Banking, IIT, IIM, DRDO...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* State Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-400 mb-3">Filter by State</h3>
          <div className="flex flex-wrap gap-2">
            {STATES.map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  state === s
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {s}
                {stateCounts[s] !== undefined && stateCounts[s] > 0 && (
                  <span className="ml-1 opacity-60">({stateCounts[s]})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-400 mb-3">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  category === c
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-500 text-sm">
            Showing {filtered.length} government jobs
            {state !== "All India" && ` in ${state}`}
            {category !== "All" && ` — ${category}`}
          </p>
          {(state !== "All India" || category !== "All" || search) && (
            <button
              onClick={() => { setState("All India"); setCategory("All"); setSearch(""); }}
              className="text-cyan-400 text-xs hover:text-cyan-300"
            >
              Clear filters
            </button>
          )}
        </div>

        {govtLive.isLoading && allJobs.length === 0 && (
          <div className="flex flex-col items-center py-20">
            <div className="text-5xl mb-3 animate-spin">Loading</div>
            <p className="text-lg text-slate-300">Scraping all government job sources...</p>
            <p className="text-xs text-slate-500 mt-1">This may take a minute — fetching from 10+ sources</p>
          </div>
        )}

        {!govtLive.isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">No results</div>
            <h3 className="text-lg font-bold text-slate-300">No jobs found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {search ? "Try different search" : "No government jobs match your filters"}
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((job) => (
              <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-xs font-bold">{job.category}</span>
                      {job.state !== "All India" && (
                        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">{job.state}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                    <p className="text-cyan-400 text-sm mb-2">{job.organization}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      {job.lastDate && <span>Last Date: {job.lastDate}</span>}
                      <span>Source: {job.source}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded-lg text-center transition text-sm"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
