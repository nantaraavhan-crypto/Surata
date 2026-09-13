"use client";
import { useState, useEffect, useCallback } from "react";

interface Deadline {
  id: string;
  title: string;
  date: string;
  url: string;
  category: string;
}

const STORAGE_KEY = "surata_deadlines";
const NOTIFICATION_KEY = "surata_notif_enabled";

function loadDeadlines(): Deadline[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveDeadlines(d: Deadline[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

function daysUntil(dateStr: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function useDeadlineAlerts() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    setDeadlines(loadDeadlines());
    setNotifEnabled(localStorage.getItem(NOTIFICATION_KEY) === "true");
  }, []);

  const addDeadline = useCallback((d: Deadline) => {
    setDeadlines((prev) => {
      if (prev.some((x) => x.id === d.id)) return prev;
      const next = [...prev, d];
      saveDeadlines(next);
      return next;
    });
  }, []);

  const removeDeadline = useCallback((id: string) => {
    setDeadlines((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveDeadlines(next);
      return next;
    });
  }, []);

  const isTracked = useCallback((id: string) => deadlines.some((d) => d.id === id), [deadlines]);

  const requestNotifPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    const perm = await Notification.requestPermission();
    const enabled = perm === "granted";
    setNotifEnabled(enabled);
    localStorage.setItem(NOTIFICATION_KEY, String(enabled));
    return enabled;
  }, []);

  useEffect(() => {
    if (!notifEnabled || !("Notification" in window)) return;
    const interval = setInterval(() => {
      deadlines.forEach((d) => {
        const days = daysUntil(d.date);
        if (days === 7 || days === 3 || days === 1) {
          new Notification(`⏰ ${d.title}`, {
            body: days === 1 ? "Deadline is TOMORROW!" : `${days} days left to apply`,
            icon: "/favicon.ico",
          });
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [deadlines, notifEnabled]);

  return { deadlines, addDeadline, removeDeadline, isTracked, notifEnabled, requestNotifPermission };
}

export function DeadlineBadge() {
  const { deadlines } = useDeadlineAlerts();
  const urgent = deadlines.filter((d) => {
    const days = daysUntil(d.date);
    return days >= 0 && days <= 7;
  });

  if (urgent.length === 0) return null;

  return (
    <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
      {urgent.length}
    </span>
  );
}

export function DeadlineWidget() {
  const { deadlines, removeDeadline, notifEnabled, requestNotifPermission } = useDeadlineAlerts();
  const [expanded, setExpanded] = useState(false);

  const upcoming = deadlines
    .filter((d) => daysUntil(d.date) >= 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date));

  const urgent = upcoming.filter((d) => daysUntil(d.date) <= 7);

  if (deadlines.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">⏰</span>
          <span className="text-sm font-bold text-white">Deadlines</span>
          {urgent.length > 0 && (
            <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-xs font-bold">{urgent.length} urgent</span>
          )}
        </div>
        <span className="text-slate-400 text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-slate-800 px-4 py-3 space-y-2 max-h-64 overflow-y-auto">
          {!notifEnabled && (
            <button
              onClick={requestNotifPermission}
              className="w-full text-left bg-yellow-500/10 text-yellow-400 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-yellow-500/20 transition"
            >
              Enable browser notifications for deadline alerts
            </button>
          )}
          {upcoming.length === 0 && (
            <p className="text-slate-500 text-xs text-center py-2">No upcoming deadlines</p>
          )}
          {upcoming.map((d) => {
            const days = daysUntil(d.date);
            return (
              <div key={d.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-white truncate block hover:text-blue-400 transition">
                    {d.title}
                  </a>
                  <p className="text-slate-500 text-xs">{d.category}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className={`text-xs font-bold ${days <= 1 ? "text-red-400" : days <= 3 ? "text-orange-400" : days <= 7 ? "text-yellow-400" : "text-slate-400"}`}>
                    {days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `${days}d`}
                  </span>
                  <button onClick={() => removeDeadline(d.id)} className="text-slate-600 hover:text-red-400 text-xs">✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
