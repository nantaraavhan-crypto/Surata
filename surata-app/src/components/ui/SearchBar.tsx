"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accentColor?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  accentColor = "cyan",
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-${accentColor}-500 focus:outline-none transition-colors`}
      />
    </div>
  );
}
