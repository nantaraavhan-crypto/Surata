"use client";

interface FilterPillsProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  accentColor?: string;
}

export function FilterPills({
  options,
  selected,
  onSelect,
  accentColor = "cyan",
}: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            selected === option
              ? `bg-${accentColor}-600 text-white`
              : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
