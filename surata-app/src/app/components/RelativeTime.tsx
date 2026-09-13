"use client";
import { useCurrentTime } from "@/hooks/useCurrentTime";

interface RelativeTimeProps {
  date: Date;
  className?: string;
}

function formatAgo(now: number, then: number): string {
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function RelativeTime({ date, className }: RelativeTimeProps) {
  const now = useCurrentTime(10000);
  return <span className={className}>{formatAgo(now, date.getTime())}</span>;
}
