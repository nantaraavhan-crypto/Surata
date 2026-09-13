"use client";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { govtJobs as staticGovtJobs } from "./data/govtJobs";
import { privateJobs as staticPrivateJobs } from "./data/privateJobs";
import { examCalendar, admitCards, results } from "./data/exams";
import { hackathons } from "./data/college";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";
import { useCurrentTime } from "@/hooks/useCurrentTime";

interface UpdateItem {
  id: string;
  title: string;
  category: string;
  source: string;
  date: string;
  url: string;
  important: boolean;
  status: "live" | "available" | "declared";
}

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const now = useCurrentTime(60000);

  const govtLive = useLiveUpdates({
    url: "/api/jobs",
    interval: 60,
    fallbackData: staticGovtJobs,
    transform: (data: unknown) => {
      const d = data as { jobs?: Array<{ title: string; url: string; organization: string; category: string; posts?: string; lastDate?: string; examDate?: string; isNew?: boolean; scrapedAt: string }> };
      if (d.jobs && d.jobs.length > 0) {
        return d.jobs.map((j) => ({
          id: j.title.slice(0, 50),
          title: j.title,
          organization: j.organization,
          category: j.category,
          state: "All India",
          description: j.title,
          totalPosts: 0,
          salary: "Check notification",
          ageLimit: "Check notification",
          education: "Check notification",
          applicationFee: "Check notification",
          importantDates: { applyStart: "", lastDate: j.lastDate || "", examDate: j.examDate || "" },
          applyUrl: j.url,
          notificationUrl: j.url,
        }));
      }
      return staticGovtJobs;
    },
  });

  const privateLive = useLiveUpdates({
    url: "/api/privateJobs",
    interval: 60,
    fallbackData: staticPrivateJobs,
    transform: (data: unknown) => {
      const d = data as { jobs?: typeof staticPrivateJobs };
      return d.jobs && d.jobs.length > 0 ? d.jobs : staticPrivateJobs;
    },
  });

  const updatesLive = useLiveUpdates({
    url: "/api/updates",
    interval: 60,
    fallbackData: [] as UpdateItem[],
    transform: (data: unknown) => {
      const d = data as { updates?: UpdateItem[] };
      return d.updates || [];
    },
  });

  const govtJobsData = govtLive.data;
  const privateJobsData = privateLive.data;
  const trendingJobs = [...govtJobsData.slice(0, 3), ...privateJobsData.slice(0, 3)];
  const topUpdates = updatesLive.data.slice(0, 10);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    const govt = govtJobsData.filter((j) => j.title.toLowerCase().includes(q) || j.organization.toLowerCase().includes(q)).slice(0, 3);
    const priv = privateJobsData.filter((j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)).slice(0, 3);
    const upd = topUpdates.filter((u) => u.title.toLowerCase().includes(q)).slice(0, 3);
    return [
      ...govt.map((j) => ({ type: "govt" as const, title: j.title, href: "/government-exams" })),
      ...priv.map((j) => ({ type: "private" as const, title: j.title, href: "/private-jobs" })),
      ...upd.map((u) => ({ type: "update" as const, title: u.title, href: u.url })),
    ];
  }, [searchQuery, govtJobsData, privateJobsData, topUpdates]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes("upsc") || q.includes("ssc") || q.includes("ibps") || q.includes("railway") || q.includes("government") || q.includes("govt")) {
      router.push("/government-exams");
    } else if (q.includes("intern")) {
      router.push("/internships");
    } else if (q.includes("hackathon") || q.includes("competition")) {
      router.push("/college");
    } else if (q.includes("scholarship")) {
      router.push("/scholarships");
    } else {
      router.push(`/private-jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, router]);

  const quickLinks = [
    { title: "Government Jobs", href: "/government-jobs", icon: "🏛️" },
    { title: "Private Jobs", href: "/private-jobs", icon: "💼" },
    { title: "Internships", href: "/internships", icon: "🎓" },
    { title: "Scholarships", href: "/scholarships", icon: "🎯" },
    { title: "Hackathons", href: "/college", icon: "💻" },
    { title: "Exam Results", href: "/results", icon: "🏆" },
    { title: "Admit Cards", href: "/admit-cards", icon: "🎫" },
    { title: "IITs & IIMs", href: "/iits-iims", icon: "🎓" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            Live data from official government sites
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            <span className="text-white">Everything a student needs</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">in one place.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-base md:text-lg mb-10 leading-relaxed">
            Government jobs, private careers, internships, scholarships, hackathons, exam results — updated from official sources.
          </p>
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-1.5 flex gap-2 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="flex-1 flex items-center gap-3 px-4">
                <svg className="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search jobs, exams, companies, internships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 py-3.5 bg-transparent outline-none text-white text-sm placeholder:text-slate-500"
                />
              </div>
              <button onClick={handleSearch} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all text-sm shrink-0">Search</button>
            </div>
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                {searchResults.map((r, i) => (
                  <Link key={i} href={r.href} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition text-left border-b border-slate-700/50 last:border-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.type === "govt" ? "bg-cyan-500/20 text-cyan-400" : r.type === "private" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                      {r.type === "govt" ? "GOVT" : r.type === "private" ? "PRIVATE" : "UPDATE"}
                    </span>
                    <span className="text-white text-sm line-clamp-1">{r.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {["UPSC", "SSC", "Banking", "Railways", "Google", "Amazon", "Internships", "Hackathons"].map((tag) => (
              <button key={tag} onClick={() => setSearchQuery(tag)} className="bg-slate-800/60 text-slate-400 px-3 py-1 rounded-full text-xs hover:text-cyan-400 hover:bg-slate-800 cursor-pointer transition-all border border-slate-700/50">{tag}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar - only shows real data counts */}
      <section className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
          {[
            { label: "Govt Jobs", count: govtJobsData.length, href: "/government-exams", color: "text-cyan-400" },
            { label: "Private Jobs", count: privateJobsData.length, href: "/private-jobs", color: "text-blue-400" },
            { label: "Updates", count: topUpdates.length, href: "/news", color: "text-emerald-400" },
            { label: "Hackathons", count: hackathons.length, href: "/college", color: "text-purple-400" },
            { label: "Results", count: results.length, href: "/results", color: "text-amber-400" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 text-center hover:border-slate-700 hover:bg-slate-900 transition-all group">
              <span className={`text-xl font-bold ${stat.color} block mt-1`}>{stat.count || <span className="inline-block w-5 h-4 bg-slate-800 animate-pulse rounded" />}</span>
              <span className="text-slate-500 text-xs group-hover:text-slate-300 transition">{stat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Explore</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((item) => (
            <Link key={item.title} href={item.href} className="bg-slate-900/50 border border-slate-800/50 p-5 rounded-xl hover:border-slate-700 hover:bg-slate-900 transition-all group">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Updates - shows spinner while loading, keeps old data visible */}
      <section className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Latest Updates</h2>
            {updatesLive.isLoading && topUpdates.length > 0 && (
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                Updating...
              </p>
            )}
          </div>
          <Link href="/news" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">View All</Link>
        </div>
        {topUpdates.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {topUpdates.map((update, i) => (
              <a key={update.id} href={update.url} target="_blank" rel="noopener noreferrer" className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 hover:border-slate-700 hover:bg-slate-900/80 transition-all flex items-start gap-4 group">
                <span className="text-lg font-bold text-slate-700 min-w-[28px] text-right group-hover:text-cyan-400/50 transition">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-medium">{update.category}</span>
                    {update.important && <span className="bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-bold">NEW</span>}
                    {update.status === "declared" && <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">RESULT</span>}
                    {update.status === "available" && <span className="bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">ADMIT CARD</span>}
                  </div>
                  <h3 className="text-white font-medium text-sm leading-snug line-clamp-2">{update.title}</h3>
                  <p className="text-slate-500 text-xs mt-1.5">{update.source}</p>
                </div>
              </a>
            ))}
          </div>
        ) : updatesLive.isLoading ? (
          <div className="grid md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-slate-800 rounded w-1/4 mb-3" />
                <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-8">No updates available</p>
        )}
      </section>

      {/* Trending Jobs */}
      <section className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Trending Opportunities</h2>
            {(govtLive.isLoading || privateLive.isLoading) && trendingJobs.length > 0 && (
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                Updating...
              </p>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingJobs.map((job) => {
            const isGovt = "totalPosts" in job;
            return (
              <div key={job.id} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-all group">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isGovt ? "bg-cyan-500/15 text-cyan-400" : "bg-blue-500/15 text-blue-400"}`}>
                    {isGovt ? job.category : ("role" in job ? job.role : "")}
                  </span>
                  <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[10px]">
                    {isGovt ? ("state" in job ? job.state : "") : ("workMode" in job ? job.workMode : "")}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-1 line-clamp-2 text-sm">{job.title}</h3>
                <p className="text-cyan-400 text-xs mb-3">{isGovt ? job.organization : ("company" in job ? job.company : "")}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                  <span>{isGovt ? "" : ("salary" in job ? job.salary : "")}</span>
                  <Link href={isGovt ? "/government-exams" : "/private-jobs"} className="text-cyan-400 font-semibold group-hover:text-cyan-300 transition">Apply →</Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Exam Calendar */}
      <section className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Exam Calendar 2026</h2>
          <Link href="/government-exams" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">Full Calendar</Link>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold text-xs">Exam</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold text-xs">Organization</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold text-xs hidden sm:table-cell">Form Start</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold text-xs">Form End</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold text-xs">Exam Date</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold text-xs hidden md:table-cell">Category</th>
                </tr>
              </thead>
              <tbody>
                {examCalendar.map((exam) => {
                  const daysLeft = Math.max(0, Math.ceil((new Date(exam.formEnd).getTime() - now) / (1000 * 60 * 60 * 24)));
                  const isUrgent = daysLeft <= 7 && daysLeft > 0;
                  return (
                    <tr key={exam.id} className="border-b border-slate-800/30 hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-white font-medium text-sm">{exam.exam}</td>
                      <td className="py-3 px-4 text-cyan-400 text-sm">{exam.organization}</td>
                      <td className="py-3 px-4 text-slate-400 text-sm hidden sm:table-cell">{exam.formStart}</td>
                      <td className="py-3 px-4">
                        <span className={isUrgent ? "text-red-400 font-bold text-sm" : "text-slate-400 text-sm"}>
                          {exam.formEnd}
                          {isUrgent && <span className="ml-1 text-xs">({daysLeft}d)</span>}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-amber-400 font-medium text-sm">{exam.examDate}</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">{exam.category}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Admit Cards & Results */}
      <section className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Latest Admit Cards</h2>
              <Link href="/admit-cards" className="text-cyan-400 text-xs font-semibold hover:text-cyan-300 transition">View All →</Link>
            </div>
            <div className="space-y-2">
              {admitCards.map((card) => (
                <div key={card.id} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-all">
                  <div className="min-w-0">
                    <h3 className="text-white font-medium text-sm line-clamp-1">{card.title}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{card.organization} — {card.examDate}</p>
                  </div>
                  <span className={`shrink-0 ml-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${card.status === "available" ? "bg-emerald-500/15 text-emerald-400" : card.status === "declared" ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"}`}>
                    {card.status === "available" ? "Download" : card.status === "declared" ? "Released" : "Soon"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Latest Results</h2>
              <Link href="/results" className="text-cyan-400 text-xs font-semibold hover:text-cyan-300 transition">View All →</Link>
            </div>
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result.id} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition-all">
                  <div className="min-w-0">
                    <h3 className="text-white font-medium text-sm line-clamp-1">{result.title}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{result.organization} — {result.resultDate}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {result.meritList && <span className="bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded text-[10px] font-bold">Merit</span>}
                    <a href={result.resultLink} target="_blank" rel="noopener noreferrer" className="bg-cyan-500/15 text-cyan-400 px-2.5 py-1 rounded-full text-[10px] font-bold hover:bg-cyan-500/25 transition">Check</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hackathons */}
      <section className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Trending Hackathons</h2>
          <Link href="/college" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">View All</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {hackathons.slice(0, 3).map((h) => (
            <div key={h.id} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-purple-500/30 hover:bg-slate-900/80 transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded text-[10px] font-bold">{h.mode}</span>
                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">{h.teamSize}</span>
              </div>
              <h3 className="font-semibold text-white mb-1 line-clamp-2 text-sm">{h.title}</h3>
              <p className="text-cyan-400 text-xs mb-2">{h.organizer}</p>
              <p className="text-slate-500 text-xs mb-3">{h.startDate} to {h.endDate}</p>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold text-sm">{h.prize}</span>
                <a href={h.applyUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs font-semibold group-hover:text-cyan-300 transition">Apply →</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-2xl max-w-4xl mx-auto p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Start Your Career Journey</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">Discover opportunities, prepare for exams, and advance your career.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/government-jobs" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all text-sm">Explore Jobs</Link>
            <Link href="/ai-tools" className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm border border-slate-700">Try AI Tools</Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl max-w-2xl mx-auto p-8">
          <h2 className="text-xl font-bold text-white mb-3">Get in Touch</h2>
          <p className="text-cyan-400 mb-2">surata12q@gmail.com</p>
          <p className="text-slate-500 text-sm">For partnerships, collaborations, and opportunities.</p>
        </div>
      </section>
    </>
  );
}
