import Navbar from "../components/Navbar";
import { scholarships } from "../data/scholarships";
export default function ScholarshipsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <div className="px-8 py-16">

        <h1 className="text-6xl font-extrabold text-cyan-400 text-center mb-6">
          Scholarships
        </h1>

        <p className="text-center text-slate-400 text-xl mb-16">
          Find scholarships, grants and financial aid opportunities.
        </p>

        <div className="grid md:grid-cols-3 gap-8">

         {scholarships.map((scholarship, index) => (
  <div
    key={index}
    className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
  >
    <h2 className="text-2xl font-bold mb-4">
      {scholarship.title}
    </h2>

    <p className="text-slate-400">
      {scholarship.description}
    </p>
  </div>
))}

        </div>

      </div>

    </main>
  );
}