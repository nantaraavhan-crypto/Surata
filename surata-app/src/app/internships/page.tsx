"use client";
import { useState } from "react";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";
import RelativeTime from "../components/RelativeTime";
import { SearchBar, FilterPills, CardSkeleton, EmptyState, HeroSection } from "@/components/ui";

interface LiveInternship {
  id: string;
  title: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  type: string;
  postedDate: string;
  applyUrl: string;
  source: string;
  scrapedAt: string;
}

export default function InternshipsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const { data, isLoading, lastUpdated } = useLiveUpdates({
    url: "/api/liveInternships",
    interval: 60,
    fallbackData: [] as LiveInternship[],
    transform: (d: unknown) => (d as { internships?: LiveInternship[] }).internships || [],
  });

  const allInternships = data;
  const types = ["All", ...[...new Set(allInternships.map((i) => i.type))].sort()];

  const filtered = allInternships.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.title.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);
    const matchType = typeFilter === "All" || item.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <HeroSection
        title="Internships"
        description="Paid and unpaid internships across India — apply before the deadline"
        accentColor="cyan"
      >
        <div className="max-w-3xl mx-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by company, role, or location..."
          />
        </div>
      </HeroSection>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <FilterPills
          options={types}
          selected={typeFilter}
          onSelect={setTypeFilter}
          accentColor="cyan"
        />

        <div className="flex items-center justify-between mb-4 mt-6">
          <p className="text-slate-500 text-sm">
            Showing {filtered.length} internship{filtered.length !== 1 ? "s" : ""}
          </p>
          {lastUpdated && (
            <span className="text-slate-500 text-xs">
              Updated <RelativeTime date={lastUpdated} />
            </span>
          )}
        </div>

        {isLoading && allInternships.length === 0 && <CardSkeleton count={6} />}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            title="No internships found"
            description={search ? "Try a different search term" : "No internships match your filters"}
          />
        )}

        {filtered.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-xs font-bold">
                    {item.type}
                  </span>
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">
                    {item.source}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-cyan-400 text-sm mb-3">{item.company}</p>
                <div className="text-sm text-slate-500 space-y-1 mb-4 flex-1">
                  <p>Location: {item.location}</p>
                  <p>Stipend: {item.stipend}</p>
                  <p>Duration: {item.duration}</p>
                </div>
                <a
                  href={item.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 rounded-xl text-center transition text-sm"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
