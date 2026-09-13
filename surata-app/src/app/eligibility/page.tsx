"use client";
import { useState, useMemo } from "react";
import { govtJobs, educationLevels, stateList, categoryList, type GovtJob } from "../data/govtJobsFull";

interface Profile {
  age: string;
  education: string[];
  state: string;
  category: string;
}

function daysUntil(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function isEligible(job: GovtJob, profile: Profile): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let eligible = true;

  // Age check
  const age = parseInt(profile.age);
  if (profile.age && (age < job.ageMin || age > job.ageMax)) {
    eligible = false;
    reasons.push(`Age ${age} not in range ${job.ageMin}-${job.ageMax}`);
  }

  // Education check
  if (profile.education.length > 0) {
    const hasMatch = profile.education.some((e) => job.education.includes(e));
    if (!hasMatch) {
      eligible = false;
      reasons.push(`Requires: ${job.education.join(" or ").toUpperCase()}`);
    }
  }

  // State check
  if (profile.state && profile.state !== "All India" && job.state !== "All India" && job.state !== profile.state) {
    eligible = false;
    reasons.push(`Only for ${job.state}`);
  }

  // Category check
  if (profile.category && !job.categories.includes(profile.category)) {
    // Don't block, just note
  }

  return { eligible, reasons };
}

export default function EligibilityCalculator() {
  const [profile, setProfile] = useState<Profile>({ age: "", education: [], state: "All India", category: "General" });
  const [showResults, setShowResults] = useState(false);

  const toggleEdu = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.includes(id) ? prev.education.filter((e) => e !== id) : [...prev.education, id],
    }));
  };

  const results = useMemo(() => {
    if (!showResults) return [];
    return govtJobs.map((job) => ({
      job,
      ...isEligible(job, profile),
    })).sort((a, b) => {
      if (a.eligible && !b.eligible) return -1;
      if (!a.eligible && b.eligible) return 1;
      return daysUntil(a.job.lastDate) - daysUntil(b.job.lastDate);
    });
  }, [showResults, profile]);

  const eligibleJobs = results.filter((r) => r.eligible);
  const upcomingDeadlines = eligibleJobs.filter((r) => daysUntil(r.job.lastDate) > 0).sort((a, b) => daysUntil(a.job.lastDate) - daysUntil(b.job.lastDate));
  const expiredJobs = eligibleJobs.filter((r) => daysUntil(r.job.lastDate) <= 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border-b border-emerald-900 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            <span className="text-emerald-400">Government Job Eligibility Calculator</span>
          </h1>
          <p className="text-slate-400 text-sm mb-2">
            Enter your profile — instantly see all government jobs you qualify for across India
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8">
          <h2 className="text-lg font-bold text-white mb-6">Your Profile</h2>

          {/* Age */}
          <div className="mb-6">
            <label className="text-xs text-slate-500 mb-2 block">Your Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))}
              placeholder="Enter your age (e.g., 22)"
              min={17}
              max={50}
              className="w-full max-w-xs px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Education */}
          <div className="mb-6">
            <label className="text-xs text-slate-500 mb-2 block">Education Level (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {educationLevels.map((edu) => (
                <button
                  key={edu.id}
                  onClick={() => toggleEdu(edu.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    profile.education.includes(edu.id)
                      ? "bg-emerald-500 text-black"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {edu.label}
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div className="mb-6">
            <label className="text-xs text-slate-500 mb-2 block">Your State</label>
            <select
              value={profile.state}
              onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
              className="w-full max-w-md px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
            >
              {stateList.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="text-xs text-slate-500 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {categoryList.map((c) => (
                <button
                  key={c}
                  onClick={() => setProfile((p) => ({ ...p, category: c }))}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    profile.category === c
                      ? "bg-emerald-500 text-black"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowResults(true)}
            disabled={!profile.age || profile.education.length === 0}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-3 px-8 rounded-xl transition"
          >
            Find Eligible Jobs ({govtJobs.length} total)
          </button>
        </div>

        {/* Results */}
        {showResults && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
                <p className="text-3xl font-extrabold text-emerald-400">{eligibleJobs.length}</p>
                <p className="text-slate-400 text-xs mt-1">Jobs You Qualify For</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
                <p className="text-3xl font-extrabold text-yellow-400">
                  {upcomingDeadlines.filter((r) => daysUntil(r.job.lastDate) <= 30 && daysUntil(r.job.lastDate) > 0).length}
                </p>
                <p className="text-slate-400 text-xs mt-1">Closing in 30 Days</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
                <p className="text-3xl font-extrabold text-red-400">
                  {upcomingDeadlines.filter((r) => daysUntil(r.job.lastDate) <= 7 && daysUntil(r.job.lastDate) > 0).length}
                </p>
                <p className="text-slate-400 text-xs mt-1">Closing This Week</p>
              </div>
            </div>

            {/* Urgent Deadlines */}
            {upcomingDeadlines.filter((r) => daysUntil(r.job.lastDate) <= 30 && daysUntil(r.job.lastDate) > 0).length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-bold text-red-400 mb-4">Urgent — Closing Soon</h2>
                <div className="space-y-3">
                  {upcomingDeadlines.filter((r) => daysUntil(r.job.lastDate) <= 30 && daysUntil(r.job.lastDate) > 0).map(({ job }) => {
                    const days = daysUntil(job.lastDate);
                    return (
                      <a key={job.id} href={job.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-red-500/50 transition"
                      >
                        <div>
                          <h3 className="text-sm font-bold text-white">{job.title}</h3>
                          <p className="text-slate-400 text-xs">{job.organization} • {job.category}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold ${days <= 3 ? "text-red-400" : days <= 7 ? "text-orange-400" : "text-yellow-400"}`}>
                            {days}d left
                          </span>
                          <p className="text-slate-500 text-xs">{job.salary}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Eligible Jobs */}
            {upcomingDeadlines.length === 0 && (
              <div className="text-center py-12 mb-8">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-bold text-slate-300">No current eligible jobs found</h3>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your profile or check back later for new openings</p>
              </div>
            )}
            <h2 className="text-xl font-bold text-white mb-4">
              Current Eligible Jobs ({upcomingDeadlines.length})
            </h2>
            <div className="space-y-3">
              {results.filter((r) => r.eligible && daysUntil(r.job.lastDate) > 0).map(({ job }) => {
                const days = daysUntil(job.lastDate);
                return (
                  <a key={job.id} href={job.url} target="_blank" rel="noopener noreferrer"
                    className="block bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold">{job.category}</span>
                          <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{job.state}</span>
                          {days <= 7 && (
                            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-bold">CLOSING SOON</span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">{job.title}</h3>
                        <p className="text-slate-400 text-xs mb-2">{job.organization}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>Age: {job.ageMin}-{job.ageMax}</span>
                          <span>Education: {job.education.join(" / ").toUpperCase()}</span>
                          <span>Salary: {job.salary}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`text-sm font-bold ${days <= 7 ? "text-red-400" : days <= 30 ? "text-yellow-400" : "text-emerald-400"}`}>
                          {days}d left
                        </span>
                        <p className="text-slate-500 text-xs mt-1">Last Date: {new Date(job.lastDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Not Eligible */}
            {results.filter((r) => !r.eligible).length > 0 && (
              <details className="mt-8">
                <summary className="text-slate-500 text-sm cursor-pointer hover:text-slate-300 transition">
                  Show {results.filter((r) => !r.eligible).length} jobs you don&apos;t qualify for
                </summary>
                <div className="space-y-3 mt-4">
                  {results.filter((r) => !r.eligible).map(({ job, reasons }) => (
                    <div key={job.id} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 opacity-50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-xs">{job.category}</span>
                        <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-xs">{job.state}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-400 mb-1">{job.title}</h3>
                      <p className="text-slate-500 text-xs">Not eligible: {reasons.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Expired Jobs */}
            {expiredJobs.length > 0 && (
              <details className="mt-6">
                <summary className="text-slate-500 text-sm cursor-pointer hover:text-slate-300 transition">
                  Show {expiredJobs.length} expired/closed jobs
                </summary>
                <div className="space-y-3 mt-4">
                  {expiredJobs.map(({ job }) => (
                    <div key={job.id} className="bg-slate-900/30 border border-slate-800/30 rounded-xl p-5 opacity-40">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-xs">{job.category}</span>
                        <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-xs">{job.state}</span>
                        <span className="bg-slate-700 text-slate-500 px-2 py-0.5 rounded text-xs">Closed</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-500 mb-1">{job.title}</h3>
                      <p className="text-slate-600 text-xs">Deadline passed: {new Date(job.lastDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </div>
    </div>
  );
}
