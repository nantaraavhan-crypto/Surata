"use client";
import { useState } from "react";
import { useLiveUpdates } from "@/hooks/useLiveUpdates";
import { competitions, fellowships, campusAmbassadors } from "../data/college";
import { placements } from "../data/placements";
import RelativeTime from "../components/RelativeTime";

interface LiveHackathon {
  id: string;
  title: string;
  organizer: string;
  prize: string;
  deadline: string;
  date: string;
  mode: string;
  url: string;
  source: string;
  scrapedAt: string;
}

type Tab = "internships" | "placements" | "hackathons" | "competitions" | "scholarships" | "fellowships" | "campus";

export default function CollegePage() {
  const [tab, setTab] = useState<Tab>("hackathons");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-900 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            <span className="text-cyan-400">College Students</span> — Internships, Hackathons & More
          </h1>
          <p className="text-slate-400 text-sm">Live hackathons, competitions, fellowships, placements & opportunities</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          {([
            { id: "hackathons", label: "Hackathons" },
            { id: "competitions", label: "Competitions" },
            { id: "placements", label: "Placements" },
            { id: "fellowships", label: "Fellowships" },
            { id: "campus", label: "Campus Ambassador" },
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

        {tab === "hackathons" && <HackathonsTab />}
        {tab === "competitions" && <CompetitionsTab />}
        {tab === "placements" && <PlacementsTab />}
        {tab === "fellowships" && <FellowshipsTab />}
        {tab === "campus" && <CampusTab />}
      </div>
    </div>
  );
}

function HackathonsTab() {
  const [search, setSearch] = useState("");

  const { data, isLoading, lastUpdated } = useLiveUpdates({
    url: "/api/liveHackathons",
    interval: 60,
    fallbackData: [] as LiveHackathon[],
    transform: (d: unknown) => (d as { hackathons?: LiveHackathon[] }).hackathons || [],
  });

  const allHackathons = data;

  const filtered = allHackathons.filter((h) =>
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    h.organizer.toLowerCase().includes(search.toLowerCase()) ||
    h.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Live Hackathons from Devfolio, MLH, HackerEarth & More</h2>
        {lastUpdated && (
          <span className="text-slate-500 text-xs">Updated <RelativeTime date={lastUpdated} /></span>
        )}
      </div>

      <input
        type="text"
        placeholder="Search hackathons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-2xl px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm mb-6 focus:border-purple-500 focus:outline-none"
      />

      {isLoading && allHackathons.length === 0 && (
        <div className="flex flex-col items-center py-20">
          <div className="text-5xl mb-3 animate-spin">Loading</div>
          <p className="text-lg text-slate-300">Scraping hackathon platforms...</p>
          <p className="text-xs text-slate-500 mt-1">Fetching from Devfolio, MLH, HackerEarth, Unstop, Devpost</p>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">No results</div>
          <h3 className="text-lg font-bold text-slate-300">No hackathons found</h3>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((h) => (
            <div key={h.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-purple-500/50 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs font-bold">{h.mode}</span>
                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{h.source}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{h.title}</h3>
              <p className="text-cyan-400 text-sm mb-2">{h.organizer}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-bold text-sm">Prize: {h.prize}</p>
                  <p className="text-slate-500 text-xs">{h.date}</p>
                </div>
                <a href={h.url} target="_blank" rel="noopener noreferrer" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-xl transition text-sm">
                  Apply
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompetitionsTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Competitions</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {competitions.map((c) => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <span className="bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded text-xs font-bold">{c.type}</span>
            <h3 className="text-lg font-bold text-white mt-3 mb-1">{c.title}</h3>
            <p className="text-cyan-400 text-sm mb-2">{c.organizer}</p>
            <p className="text-slate-500 text-xs mb-3">{c.description}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 font-bold text-sm">Prize: {c.prize}</p>
                <p className="text-slate-500 text-xs">Deadline: {c.deadline}</p>
              </div>
              <a href={c.applyUrl} target="_blank" rel="noopener noreferrer" className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded-xl transition text-sm">
                Apply
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlacementsTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Placement Drives</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {placements.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">{item.role}</span>
            <h3 className="text-lg font-bold text-white mt-3 mb-1">{item.title}</h3>
            <p className="text-cyan-400 text-sm mb-2">{item.company}</p>
            <p className="text-slate-500 text-xs mb-3">{item.location} - CTC: {item.ctc}</p>
            <a href={item.applyUrl} target="_blank" rel="noopener noreferrer" className="block bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-xl text-center transition text-sm">
              Apply Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function FellowshipsTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Fellowships</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {fellowships.map((f) => (
          <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold">{f.duration}</span>
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{f.stipend}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{f.title}</h3>
            <p className="text-cyan-400 text-sm mb-2">{f.organization}</p>
            <p className="text-slate-500 text-xs mb-3">{f.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs">Deadline: {f.deadline}</p>
              <a href={f.applyUrl} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-xl transition text-sm">
                Apply
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampusTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Campus Ambassador Programs</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {campusAmbassadors.map((ca) => (
          <div key={ca.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-bold">{ca.company}</span>
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{ca.duration}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{ca.program}</h3>
            <p className="text-slate-500 text-xs mb-3">{ca.description}</p>
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
              <p className="text-cyan-400 text-xs font-semibold mb-1">Perks:</p>
              <p className="text-slate-400 text-xs">{ca.perks}</p>
            </div>
            <a href={ca.applyUrl} target="_blank" rel="noopener noreferrer" className="block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-center transition text-sm">
              Apply Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
