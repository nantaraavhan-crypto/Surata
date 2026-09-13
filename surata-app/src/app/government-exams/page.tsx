"use client";
import { useState } from "react";
import Link from "next/link";
import { currentAffairs, examCalendar, admitCards, results, previousPapers, syllabus, cutoffs } from "../data/exams";
import { govtJobs as staticGovtJobs, govtJobCategories } from "../data/govtJobs";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import RelativeTime from "../components/RelativeTime";

type Tab = "current-affairs" | "calendar" | "admit-cards" | "results" | "papers" | "syllabus" | "cut-offs" | "jobs" | "link-govt-jobs";

export default function GovernmentExamsPage() {
  const [tab, setTab] = useState<Tab>("current-affairs");
  const now = useCurrentTime(60000);

  return (
    <div className="px-4 md:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-cyan-400 mb-2">Government Exams</h1>
          <p className="text-slate-400 text-lg">Everything you need for government exam preparation.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
        {([
          { id: "current-affairs", label: "📰 Current Affairs" },
          { id: "calendar", label: "📅 Exam Calendar" },
          { id: "admit-cards", label: "🎫 Admit Cards" },
          { id: "results", label: "🏆 Results" },
          { id: "papers", label: "📝 Previous Papers" },
          { id: "syllabus", label: "📚 Syllabus" },
          { id: "cut-offs", label: "📊 Cut-offs" },
          { id: "jobs", label: "🏛️ Govt Jobs" },
          { id: "link-govt-jobs", label: "📋 All State Govt Jobs →" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              tab === t.id
                ? "bg-cyan-500 text-black"
                : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "current-affairs" && <CurrentAffairsTab />}
      {tab === "calendar" && <CalendarTab now={now} />}
      {tab === "admit-cards" && <AdmitCardsTab />}
      {tab === "results" && <ResultsTab />}
      {tab === "papers" && <PapersTab />}
      {tab === "syllabus" && <SyllabusTab />}
      {tab === "cut-offs" && <CutoffsTab />}
      {tab === "jobs" && <JobsTab />}
      {tab === "link-govt-jobs" && <LinkGovtJobsTab />}
    </div>
  );
}

function CurrentAffairsTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">📰 Daily Current Affairs</h2>
      <div className="space-y-4">
        {currentAffairs.map((ca) => (
          <div key={ca.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold">{ca.category}</span>
              {ca.important && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-bold animate-pulse">IMPORTANT</span>}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{ca.title}</h3>
            <p className="text-slate-400 text-sm mb-3">{ca.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>📅 {ca.date}</span>
              <span>📰 {ca.source}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarTab({ now }: { now: number }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">📅 Exam Calendar 2026-27</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Exam</th>
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Organization</th>
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Form Start</th>
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Form End</th>
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Exam Date</th>
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Result</th>
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Category</th>
            </tr>
          </thead>
          <tbody>
            {examCalendar.map((exam) => {
              const daysLeft = Math.max(0, Math.ceil((new Date(exam.formEnd).getTime() - now) / (1000 * 60 * 60 * 24)));
              const isUrgent = daysLeft <= 14 && daysLeft > 0;
              return (
                <tr key={exam.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 text-white font-semibold">{exam.exam}</td>
                  <td className="py-3 px-4 text-cyan-400">{exam.organization}</td>
                  <td className="py-3 px-4 text-slate-400">{exam.formStart}</td>
                  <td className="py-3 px-4">
                    <span className={isUrgent ? "text-red-400 font-bold" : "text-slate-400"}>
                      {exam.formEnd}
                      {isUrgent && <span className="ml-1 text-xs">({daysLeft}d left)</span>}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-yellow-400 font-semibold">{exam.examDate}</td>
                  <td className="py-3 px-4 text-green-400">{exam.resultDate}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{exam.category}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdmitCardsTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">🎫 Latest Admit Cards</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {admitCards.map((card) => (
          <div key={card.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                card.status === "available" ? "bg-green-500/20 text-green-400" :
                card.status === "declared" ? "bg-blue-500/20 text-blue-400" :
                "bg-yellow-500/20 text-yellow-400"
              }`}>
                {card.status === "available" ? "✅ Available Now" : card.status === "declared" ? "✅ Released" : "⏳ Expected Soon"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
            <p className="text-slate-500 text-sm mb-1">{card.organization}</p>
            <p className="text-cyan-400 text-sm mb-4">Exam Date: {card.examDate}</p>
            {card.status === "available" && (
              <a href={card.downloadLink} target="_blank" rel="noopener noreferrer" className="block bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl text-center transition">
                Download Admit Card →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">🏆 Latest Results</h2>
      <div className="space-y-4">
        {results.map((result) => (
          <div key={result.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {result.meritList && <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs font-bold">Merit List Out</span>}
                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{result.category}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{result.title}</h3>
              <p className="text-slate-500 text-sm">{result.organization} • Declared: {result.resultDate}</p>
            </div>
            <a href={result.resultLink} target="_blank" rel="noopener noreferrer" className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-6 rounded-xl text-center transition text-sm">
              Check Result →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function PapersTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">📝 Previous Year Papers</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {previousPapers.map((paper) => (
          <div key={paper.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs font-bold">{paper.year}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{paper.exam}</h3>
            <p className="text-slate-500 text-sm mb-4">{paper.paper}</p>
            <a href={paper.downloadLink} className="block bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl text-center transition text-sm">
              📥 Download PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function SyllabusTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">📚 Exam Syllabus</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {syllabus.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <h3 className="text-lg font-bold text-white mb-3">{s.exam}</h3>
            <div className="space-y-2 mb-4">
              {s.subjects.map((subject, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span className="text-slate-400 text-sm">{subject}</span>
                </div>
              ))}
            </div>
            <a href={s.downloadLink} className="block bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl text-center transition text-sm">
              📥 Download Full Syllabus
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function CutoffsTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">📊 Previous Year Cut-offs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Exam</th>
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Year</th>
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Category</th>
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Cut-off</th>
              <th className="text-left py-3 px-4 text-slate-500 font-semibold">Total Marks</th>
            </tr>
          </thead>
          <tbody>
            {cutoffs.map((co) => (
              <tr key={co.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition">
                <td className="py-3 px-4 text-white font-semibold">{co.exam}</td>
                <td className="py-3 px-4 text-slate-400">{co.year}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    co.category === "General" ? "bg-blue-500/20 text-blue-400" :
                    co.category === "OBC" ? "bg-green-500/20 text-green-400" :
                    co.category === "SC" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-purple-500/20 text-purple-400"
                  }`}>{co.category}</span>
                </td>
                <td className="py-3 px-4 text-cyan-400 font-bold">{co.cutoff}</td>
                <td className="py-3 px-4 text-slate-400">{co.marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JobsTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

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

  const allJobs = govtLive.data;
  const filtered = allJobs.filter((job) => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) || job.organization.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || job.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">🏛️ Government Jobs</h2>
        <div className="flex items-center gap-3">
          {govtLive.isLoading && <span className="text-cyan-400 text-xs animate-pulse">Refreshing...</span>}
          {govtLive.isStale && <span className="text-yellow-400 text-xs">Data may be outdated</span>}
          {govtLive.lastUpdated && (
            <span className="text-slate-500 text-xs">
              Updated <RelativeTime date={govtLive.lastUpdated} />
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input type="text" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none text-white" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none">
          {govtJobCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <p className="text-slate-500 text-sm mb-4">Showing {filtered.length} government jobs</p>
      <div className="space-y-4">
        {filtered.map((job) => (
          <div key={job.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-xs font-bold">{job.category}</span>
              <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">{job.state}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
            <p className="text-cyan-400 text-sm mb-2">{job.organization}</p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>📋 {job.totalPosts.toLocaleString()} posts</span>
              <span>💰 {job.salary}</span>
              <span>📅 Exam: {job.importantDates.examDate}</span>
            </div>
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded-lg transition text-sm">
              Apply Online →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkGovtJobsTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">🏛️ All Government Jobs by State</h2>
      <p className="text-slate-400 text-sm mb-6">
        Browse government jobs across all Indian states — one link per exam, no duplicates.
      </p>
      <Link
        href="/government-jobs"
        className="inline-block bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-8 rounded-xl transition text-lg"
      >
        Open Full Government Jobs Portal →
      </Link>
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Link href="/admit-cards" className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition block">
          <span className="text-2xl block mb-2">🎫</span>
          <h3 className="text-lg font-bold text-white">Admit Cards</h3>
          <p className="text-slate-500 text-sm mt-1">Download admit cards for all exams</p>
        </Link>
        <Link href="/results" className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition block">
          <span className="text-2xl block mb-2">🏆</span>
          <h3 className="text-lg font-bold text-white">Results</h3>
          <p className="text-slate-500 text-sm mt-1">Check exam results and merit lists</p>
        </Link>
        <Link href="/answer-keys" className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition block">
          <span className="text-2xl block mb-2">📝</span>
          <h3 className="text-lg font-bold text-white">Answer Keys</h3>
          <p className="text-slate-500 text-sm mt-1">View official answer keys</p>
        </Link>
      </div>
    </div>
  );
}
