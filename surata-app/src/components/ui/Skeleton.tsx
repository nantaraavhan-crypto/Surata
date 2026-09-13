interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-800 rounded ${className}`}
        />
      ))}
    </>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse"
        >
          <div className="h-4 bg-slate-800 rounded w-1/3 mb-3" />
          <div className="h-5 bg-slate-800 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-800 rounded w-1/2 mb-4" />
          <div className="h-10 bg-slate-800 rounded" />
        </div>
      ))}
    </div>
  );
}
