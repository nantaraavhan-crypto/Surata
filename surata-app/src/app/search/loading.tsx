import { CardSkeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-900 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="h-9 bg-slate-800 rounded w-80 mb-3 animate-pulse" />
          <div className="h-4 bg-slate-800 rounded w-40 animate-pulse" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <CardSkeleton count={6} />
      </div>
    </div>
  );
}
