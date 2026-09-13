interface StatusBadgeProps {
  status: "live" | "available" | "declared" | "new" | "urgent";
  children: React.ReactNode;
}

const STATUS_STYLES = {
  live: "bg-green-500/20 text-green-400",
  available: "bg-blue-500/20 text-blue-400",
  declared: "bg-purple-500/20 text-purple-400",
  new: "bg-cyan-500/20 text-cyan-400",
  urgent: "bg-red-500/20 text-red-400",
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-bold ${STATUS_STYLES[status]}`}
    >
      {children}
    </span>
  );
}
