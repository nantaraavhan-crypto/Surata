import { CardSkeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 border-b border-cyan-900 py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="h-10 bg-slate-800 rounded w-80 mx-auto mb-3 animate-pulse" />
          <div className="h-5 bg-slate-800 rounded w-96 mx-auto animate-pulse" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <CardSkeleton count={6} />
      </div>
    </div>
  );
}
