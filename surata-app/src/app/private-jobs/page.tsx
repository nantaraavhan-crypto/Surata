"use client";
import { useState, useMemo } from "react";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";
import RelativeTime from "../components/RelativeTime";

interface LivePrivateJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  department: string;
  workMode: string;
  jobType: string;
  postedDate: string;
  applyUrl: string;
  source: string;
  scrapedAt: string;
}

const DEPARTMENTS = ["All", "Engineering", "Data Science & AI", "Product", "Design", "Marketing", "Sales", "Finance", "HR", "Consulting", "Operations", "Internship", "Other"];
const WORK_MODES = ["All", "Office", "Hybrid", "Remote"];

export default function PrivateJobsPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [location, setLocation] = useState("All");
  const [workMode, setWorkMode] = useState("All");

  const { data, isLoading, lastUpdated, refresh } = useLiveUpdates({
    url: "/api/livePrivateJobs",
    interval: 60,
    fallbackData: [] as LivePrivateJob[],
    transform: (d: unknown) => (d as { jobs?: LivePrivateJob[] }).jobs || [],
  });

  const allJobs = data;

  const locations = useMemo(() => ["All", ...[...new Set(allJobs.map((j) => j.location))].sort()], [allJobs]);

  const filtered = useMemo(() => {
    return allJobs.filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase());
      const matchDept = department === "All" || job.department === department;
      const matchLoc = location === "All" || job.location === location;
      const matchMode = workMode === "All" || job.workMode === workMode;
      return matchSearch && matchDept && matchLoc && matchMode;
    });
  }, [allJobs, search, department, location, workMode]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-900 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            <span className="text-cyan-400">Private Jobs</span> — Updated Every Day
          </h1>
          <p className="text-slate-400 text-sm mb-5">
            Latest private sector openings with salary, location and apply links
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Search by title, company, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none">
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
          </select>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none">
            {locations.map((l) => <option key={l} value={l}>{l === "All" ? "All Locations" : l}</option>)}
          </select>
          <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm outline-none">
            {WORK_MODES.map((m) => <option key={m} value={m}>{m === "All" ? "All Work Modes" : m}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-500 text-sm">Showing {filtered.length} private jobs</p>
          {lastUpdated && (
            <span className="text-slate-500 text-xs">Updated <RelativeTime date={lastUpdated} /></span>
          )}
        </div>

        {isLoading && allJobs.length === 0 && (
          <div className="flex flex-col items-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-slate-400">Loading...</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">No results</div>
            <h3 className="text-lg font-bold text-slate-300">No private jobs found</h3>
            <p className="text-sm text-slate-500 mt-1">{search ? "Try different search" : "No jobs match your filters"}</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((job) => (
              <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded text-xs font-bold">{job.department}</span>
                      <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{job.workMode}</span>
                      <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{job.jobType}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                    <p className="text-cyan-400 text-sm mb-2">{job.company}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>Location: {job.location}</span>
                      <span>Salary: {job.salary}</span>
                      <span>Experience: {job.experience}</span>
                      <span>Source: {job.source}</span>
                    </div>
                  </div>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded-lg text-center transition text-sm min-w-[120px]"
                  >
                    Apply Now
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
