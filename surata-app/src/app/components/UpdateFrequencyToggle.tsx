"use client";
import { useState, useEffect } from "react";
import type { UpdateInterval } from "@/hooks/useLiveUpdates";

const OPTIONS: { label: string; value: UpdateInterval; desc: string }[] = [
  { label: "Live (1m)", value: 60, desc: "Updates every minute" },
  { label: "5 min", value: 300, desc: "Updates every 5 minutes" },
  { label: "15 min", value: 900, desc: "Updates every 15 minutes" },
  { label: "Off", value: 0, desc: "Manual refresh only" },
];

interface UpdateFrequencyToggleProps {
  currentInterval: UpdateInterval;
  onChange: (interval: UpdateInterval) => void;
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
}

function timeAgo(now: number, date: number): string {
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function freshnessColor(now: number, date: number, interval: UpdateInterval): string {
  if (interval === 0) return "text-slate-500";
  const seconds = (now - date) / 1000;
  if (seconds < 120) return "text-green-400";
  if (seconds < 600) return "text-yellow-400";
  return "text-red-400";
}

export default function UpdateFrequencyToggle({
  currentInterval,
  onChange,
  lastUpdated,
  isLoading,
  onRefresh,
}: UpdateFrequencyToggleProps) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);

  const current = OPTIONS.find((o) => o.value === currentInterval) || OPTIONS[0];
  const color = lastUpdated ? freshnessColor(now, lastUpdated.getTime(), currentInterval) : "text-slate-500";
  const ago = lastUpdated ? timeAgo(now, lastUpdated.getTime()) : "never";

  return (
    <div className="relative flex items-center gap-3">
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        title="Refresh now"
      >
        <span className={`inline-block w-2 h-2 rounded-full ${isLoading ? "bg-cyan-400 animate-pulse" : currentInterval > 0 ? "bg-green-400" : "bg-slate-600"}`} />
        <span className={color}>Updated {ago}</span>
        <svg className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {current.label}
          <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden min-w-[180px]">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.setItem("surata-update-frequency", String(opt.value));
                    }
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-slate-700 ${
                    currentInterval === opt.value
                      ? "text-cyan-400 bg-slate-700/50"
                      : "text-slate-300"
                  }`}
                >
                  <span className="font-semibold">{opt.label}</span>
                  <span className="block text-xs text-slate-500 mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
