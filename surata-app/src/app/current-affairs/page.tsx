"use client";
import { useState } from "react";
import { currentAffairs } from "../data/exams";

export default function CurrentAffairsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", ...new Set(currentAffairs.map((ca) => ca.category))];

  const filtered = currentAffairs.filter((ca) => {
    const matchSearch = ca.title.toLowerCase().includes(search.toLowerCase()) || ca.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || ca.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-cyan-400 mb-2">📰 Daily Current Affairs</h1>
        <p className="text-slate-400 text-lg">Stay updated with the latest current affairs for exams and interviews.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search current affairs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 outline-none text-white"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white outline-none">
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((ca) => (
          <div key={ca.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold">{ca.category}</span>
              {ca.important && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-bold">IMPORTANT</span>}
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
