"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CardSkeleton, EmptyState } from "@/components/ui";

interface SearchResult {
  id: string;
  title: string;
  type: "govt-job" | "private-job" | "internship" | "scholarship" | "hackathon" | "result" | "admit-card" | "news";
  category: string;
  source: string;
  url: string;
  date: string;
}

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  "govt-job": "Government Job",
  "private-job": "Private Job",
  internship: "Internship",
  scholarship: "Scholarship",
  hackathon: "Hackathon",
  result: "Result",
  "admit-card": "Admit Card",
  news: "News",
};

const TYPE_COLORS: Record<SearchResult["type"], string> = {
  "govt-job": "bg-cyan-500/20 text-cyan-400",
  "private-job": "bg-yellow-400/20 text-yellow-400",
  internship: "bg-blue-500/20 text-blue-400",
  scholarship: "bg-purple-500/20 text-purple-400",
  hackathon: "bg-pink-500/20 text-pink-400",
  result: "bg-green-500/20 text-green-400",
  "admit-card": "bg-orange-500/20 text-orange-400",
  news: "bg-slate-500/20 text-slate-400",
};

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (query.length < 2) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}&limit=60`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Search failed"))))
      .then((json) => {
        if (cancelled) return;
        setResults(json.results || []);
        setTotal(json.total || 0);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-900 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-2">
            Results for <span className="text-cyan-400">&ldquo;{query}&rdquo;</span>
          </h1>
          <p className="text-slate-400 text-sm">
            {isLoading ? "Searching..." : `${total} match${total === 1 ? "" : "es"} found`}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {isLoading && results.length === 0 && <CardSkeleton count={6} />}

        {!isLoading && results.length === 0 && (
          <EmptyState
            title="No results found"
            description="Try a different keyword — for example a company name, exam name, or scholarship."
          />
        )}

        <div className="space-y-3">
          {results.map((result) => (
            <a
              key={`${result.type}-${result.id}`}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${TYPE_COLORS[result.type]}`}>
                  {TYPE_LABELS[result.type]}
                </span>
                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">
                  {result.category}
                </span>
              </div>
              <h3 className="text-white font-semibold leading-snug">{result.title}</h3>
              <p className="text-slate-500 text-xs mt-1">{result.source}</p>
            </a>
          ))}
        </div>

        {results.length > 0 && (
          <div className="flex justify-center gap-3 mt-8">
            <Link
              href="/government-jobs"
              className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:border-cyan-500/50 transition"
            >
              Browse Government Jobs
            </Link>
            <Link
              href="/private-jobs"
              className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:border-cyan-500/50 transition"
            >
              Browse Private Jobs
            </Link>
            <Link
              href="/internships"
              className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:border-cyan-500/50 transition"
            >
              Browse Internships
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<CardSkeleton count={6} />}>
      <SearchResults />
    </Suspense>
  );
}
