import Navbar from "../components/Navbar";
import { placements } from "../data/placements";
export default function PlacementsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <div className="px-8 py-16">

        <h1 className="text-6xl font-extrabold text-cyan-400 text-center mb-6">
          Placement Opportunities
        </h1>

        <p className="text-center text-slate-400 text-xl mb-16">
          Latest fresher jobs, off-campus drives and hiring updates.
        </p>

        <div className="grid md:grid-cols-3 gap-8">

          {placements.map((job, index) => (
  <div
    key={index}
    className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
  >
    <h2 className="text-2xl font-bold mb-4">
      {job.title}
    </h2>

    <p className="text-slate-400">
      {job.description}
    </p>
  </div>
))}

        </div>

      </div>

    </main>
  );
}