"use client";
import { useState } from "react";
import { news, type News } from "../data/news";

export default function NewsPage() {
  const [search, setSearch] = useState("");

  const filtered = news.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-8 py-12">
      <h1 className="text-4xl font-extrabold text-cyan-400 mb-2">News</h1>
      <p className="text-slate-400 mb-8 text-lg">
        Latest updates on internships, placements, exams, and career opportunities.
      </p>

      <input
        type="text"
        placeholder="Search news..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-2xl px-6 py-4 rounded-2xl bg-slate-900 border border-slate-700 outline-none text-lg mb-10"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-slate-500 mt-12 text-lg">No news found.</p>
      )}
    </div>
  );
}

function NewsCard({ item }: { item: News }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:scale-[1.02] transition flex flex-col block"
    >
      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold w-fit mb-4">
        {item.category}
      </span>
      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
      <p className="text-slate-400 text-sm mb-4 flex-1">{item.description}</p>
      <div className="text-sm text-slate-500 flex items-center justify-between">
        <span>📰 {item.source}</span>
        <span>📅 {item.date}</span>
      </div>
    </a>
  );
}
