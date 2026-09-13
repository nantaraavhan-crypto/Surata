"use client";
import { useState, useEffect, useCallback } from "react";

interface TrackedItem {
  id: string;
  title: string;
  organization: string;
  url: string;
  category: string;
  status: "saved" | "applied" | "preparing" | "exam-done" | "interview" | "selected" | "rejected" | "not-interested";
  notes: string;
  dateAdded: string;
  dateUpdated: string;
}

const STATUS_CONFIG = {
  saved: { label: "Saved", color: "bg-slate-500/20 text-slate-400", icon: "📌" },
  applied: { label: "Applied", color: "bg-blue-500/20 text-blue-400", icon: "✅" },
  preparing: { label: "Preparing", color: "bg-yellow-500/20 text-yellow-400", icon: "📚" },
  "exam-done": { label: "Exam Done", color: "bg-purple-500/20 text-purple-400", icon: "📝" },
  interview: { label: "Interview", color: "bg-orange-500/20 text-orange-400", icon: "🎤" },
  selected: { label: "Selected", color: "bg-green-500/20 text-green-400", icon: "🎉" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400", icon: "❌" },
  "not-interested": { label: "Not Interested", color: "bg-slate-500/20 text-slate-500", icon: "🚫" },
};

const STATUSES = Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[];

function loadTracker(): TrackedItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("surata_tracker") || "[]");
  } catch { return []; }
}

function saveTracker(items: TrackedItem[]) {
  localStorage.setItem("surata_tracker", JSON.stringify(items));
}

export default function TrackerPage() {
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", organization: "", url: "", category: "", status: "saved" as TrackedItem["status"] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => { setItems(loadTracker()); }, []);

  const updateItems = useCallback((newItems: TrackedItem[]) => {
    setItems(newItems);
    saveTracker(newItems);
  }, []);

  const addItem = () => {
    if (!newItem.title.trim()) return;
    const item: TrackedItem = {
      id: Date.now().toString(),
      title: newItem.title,
      organization: newItem.organization,
      url: newItem.url,
      category: newItem.category,
      status: newItem.status,
      notes: "",
      dateAdded: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    };
    updateItems([item, ...items]);
    setNewItem({ title: "", organization: "", url: "", category: "", status: "saved" });
    setShowAdd(false);
  };

  const updateStatus = (id: string, status: TrackedItem["status"]) => {
    updateItems(items.map((item) =>
      item.id === id ? { ...item, status, dateUpdated: new Date().toISOString() } : item
    ));
  };

  const updateNotes = (id: string, notes: string) => {
    updateItems(items.map((item) =>
      item.id === id ? { ...item, notes, dateUpdated: new Date().toISOString() } : item
    ));
    setEditingId(null);
  };

  const removeItem = (id: string) => {
    updateItems(items.filter((item) => item.id !== id));
  };

  const filtered = filter === "all" ? items : items.filter((item) => item.status === filter);

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = items.filter((i) => i.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-b border-blue-900 py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            <span className="text-blue-400">Application Tracker</span>
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            Track every job/internship you&apos;ve saved, applied to, or are preparing for. Never lose track.
          </p>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl transition"
          >
            + Add Opportunity
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Add Form */}
        {showAdd && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Add Opportunity to Track</h3>
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <input
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Job/Internship Title"
                className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                value={newItem.organization}
                onChange={(e) => setNewItem({ ...newItem, organization: e.target.value })}
                placeholder="Organization"
                className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                placeholder="Application URL (optional)"
                className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="Category (Govt, Private, Internship)"
                className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-2 block">Initial Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewItem({ ...newItem, status: s })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      newItem.status === s
                        ? STATUS_CONFIG[s].color
                        : "bg-slate-800 text-slate-500 hover:text-white"
                    }`}
                  >
                    {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addItem} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl transition text-sm">
                Add
              </button>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white text-sm font-semibold py-2 px-4 transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
              filter === "all" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All ({items.length})
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                filter === s ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label} ({statusCounts[s] || 0})
            </button>
          ))}
        </div>

        {/* Empty */}
        {items.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📋</div>
            <h3 className="text-lg font-bold text-slate-300">No tracked opportunities yet</h3>
            <p className="text-slate-500 text-sm mt-1">Click "Add Opportunity" to start tracking your applications</p>
          </div>
        )}

        {/* Items */}
        {filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${STATUS_CONFIG[item.status].color}`}>
                        {STATUS_CONFIG[item.status].icon} {STATUS_CONFIG[item.status].label}
                      </span>
                      {item.category && <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{item.category}</span>}
                    </div>
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    {item.organization && <p className="text-slate-400 text-xs">{item.organization}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs font-semibold">
                        Open Link
                      </a>
                    )}
                    {item.status !== "applied" && (
                      <button onClick={() => updateStatus(item.id, "applied")} className="bg-green-500/20 text-green-400 hover:bg-green-500/30 px-2.5 py-1 rounded text-xs font-bold transition">
                        ✅ Mark Applied
                      </button>
                    )}
                    <button onClick={() => removeItem(item.id)} className="text-slate-600 hover:text-red-400 text-xs transition">✕</button>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(item.id, s)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                        item.status === s
                          ? STATUS_CONFIG[s].color
                          : "bg-slate-800/50 text-slate-500 hover:text-white hover:bg-slate-700"
                      }`}
                    >
                      {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                {editingId === item.id ? (
                  <div className="flex gap-2">
                    <input
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add notes..."
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                      onKeyDown={(e) => { if (e.key === "Enter") updateNotes(item.id, editNotes); }}
                    />
                    <button onClick={() => updateNotes(item.id, editNotes)} className="bg-blue-500 text-white text-xs font-bold px-3 rounded-lg">
                      Save
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => { setEditingId(item.id); setEditNotes(item.notes); }}
                    className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition"
                  >
                    {item.notes ? `📝 ${item.notes}` : "+ Add notes"}
                  </div>
                )}

                <p className="text-slate-600 text-xs mt-2">Added {new Date(item.dateAdded).toLocaleDateString("en-IN")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
