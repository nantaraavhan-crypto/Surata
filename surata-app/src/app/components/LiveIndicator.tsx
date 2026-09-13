"use client";

interface LiveIndicatorProps {
  isLive: boolean;
  lastUpdated: Date | null;
}

function timeAgo(date: Date | null): string {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function LiveIndicator({ isLive, lastUpdated }: LiveIndicatorProps) {
  if (!isLive) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
      </span>
      <span className="text-green-400 font-semibold">Live</span>
      {lastUpdated && (
        <span className="text-slate-500 ml-1">{timeAgo(lastUpdated)}</span>
      )}
    </div>
  );
}
