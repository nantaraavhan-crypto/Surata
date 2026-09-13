"use client";
import { useState, useMemo } from "react";
import { privateJobs, privateJobSkills, privateJobDepartments, privateJobLocations, type PrivateJob } from "../data/privateJobs";

export default function PrivateJobsPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [location, setLocation] = useState("All");
  const [salary, setSalary] = useState("All");
  const [workMode, setWorkMode] = useState("All");

  const filtered = useMemo(() => {
    return privateJobs.filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchDept = department === "All" || job.department === department;
      const matchLoc = location === "All" || job.location.includes(location);
      const matchMode = workMode === "All" || job.workMode === workMode;
      const matchSalary =
        salary === "All" ||
        (salary === "0-10" && parseInt(job.salary) <= 10) ||
        (salary === "10-20" && parseInt(job.salary) >= 10 && parseInt(job.salary) <= 20) ||
        (salary === "20+" && parseInt(job.salary) >= 20);
      return matchSearch && matchDept && matchLoc && matchMode && matchSalary;
    });
  }, [search, department, location, salary, workMode]);

  return (
    <div className="px-4 md:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-cyan-400 mb-2">Private Jobs</h1>
        <p className="text-slate-400 text-lg">
          Latest private sector jobs from top companies across India.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by title, company, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 outline-none text-white"
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
        >
          {privateJobDepartments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
        >
          {privateJobLocations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
        >
          <option value="All">Salary</option>
          <option value="0-10">0-10 LPA</option>
          <option value="10-20">10-20 LPA</option>
          <option value="20+">20+ LPA</option>
        </select>
        <select
          value={workMode}
          onChange={(e) => setWorkMode(e.target.value)}
          className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none"
        >
          <option value="All">Work Mode</option>
          <option value="Office">Office</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      {/* Results Count */}
      <p className="text-slate-500 text-sm mb-6">
        Showing {filtered.length} of {privateJobs.length} private jobs
      </p>

      {/* Job List */}
      <div className="space-y-4">
        {filtered.map((job) => (
          <PrivateJobCard key={job.id} job={job} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-slate-500 text-lg">No private jobs found matching your filters.</p>
        </div>
      )}
    </div>
  );
}

function PrivateJobCard({ job }: { job: PrivateJob }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
              {job.role}
            </span>
            <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs">
              {job.workMode}
            </span>
            <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs">
              {job.jobType}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-cyan-400 font-semibold">{job.company}</span>
            <span className="text-yellow-400 text-sm">★ {job.companyRating}</span>
            <span className="text-slate-500 text-sm">({(job.companyReviews / 1000).toFixed(1)}K reviews)</span>
          </div>
          <p className="text-slate-400 text-sm mb-4">{job.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 5).map((skill) => (
              <span key={skill} className="bg-slate-800 text-slate-300 px-3 py-1 rounded-lg text-xs">
                {skill}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="text-slate-500 text-xs py-1">+{job.skills.length - 5} more</span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span>📍 {job.location}</span>
            <span>💰 {job.salary}</span>
            <span>🎓 {job.education}</span>
            <span>⏱ {job.experience}</span>
          </div>

          <p className="text-slate-600 text-xs mt-3">Posted: {job.postedDate}</p>
        </div>

        <div className="flex flex-col gap-2 min-w-[160px]">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-6 rounded-xl text-center transition-all text-sm"
          >
            Apply Now →
          </a>
          <button className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl text-center transition-all text-sm">
            Save for Later
          </button>
        </div>
      </div>
    </div>
  );
}
