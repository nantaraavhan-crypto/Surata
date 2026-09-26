"use client";
import { useState } from "react";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";
import RelativeTime from "../components/RelativeTime";
import { SearchBar, FilterPills, CardSkeleton, EmptyState, HeroSection } from "@/components/ui";

interface LiveScholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  eligibility: string;
  category: string;
  applyUrl: string;
  source: string;
  scrapedAt: string;
}

export default function ScholarshipsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const { data, isLoading, lastUpdated } = useLiveUpdates({
    url: "/api/liveScholarships",
    interval: 60,
    fallbackData: [] as LiveScholarship[],
    transform: (d: unknown) => (d as { scholarships?: LiveScholarship[] }).scholarships || [],
  });

  const allScholarships = data;
  const categories = ["All", ...[...new Set(allScholarships.map((s) => s.category))].sort()];

  const filtered = allScholarships.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.title.toLowerCase().includes(q) ||
      item.provider.toLowerCase().includes(q);
    const matchCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <HeroSection
        title="Scholarships"
        description="Fellowships, grants and scholarships with eligibility and last dates"
        accentColor="purple"
      >
        <div className="max-w-3xl mx-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by scholarship name, provider..."
            accentColor="purple"
          />
        </div>
      </HeroSection>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <FilterPills
          options={categories}
          selected={categoryFilter}
          onSelect={setCategoryFilter}
          accentColor="purple"
        />

        <div className="flex items-center justify-between mb-4 mt-6">
          <p className="text-slate-500 text-sm">
            Showing {filtered.length} scholarship{filtered.length !== 1 ? "s" : ""}
          </p>
          {lastUpdated && (
            <span className="text-slate-500 text-xs">
              Updated <RelativeTime date={lastUpdated} />
            </span>
          )}
        </div>

        {isLoading && allScholarships.length === 0 && <CardSkeleton count={6} />}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            title="No scholarships found"
            description={search ? "Try a different search term" : "No scholarships match your filters"}
          />
        )}

        {filtered.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-purple-500/50 transition-all flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs font-bold">
                    {item.category}
                  </span>
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">
                    {item.source}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-purple-400 text-sm mb-2">{item.provider}</p>
                <div className="text-sm text-slate-500 space-y-1 mb-4 flex-1">
                  <p>Amount: {item.amount}</p>
                  <p>Deadline: {item.deadline}</p>
                  <p>Eligibility: {item.eligibility}</p>
                </div>
                <a
                  href={item.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 rounded-xl text-center transition text-sm"
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
