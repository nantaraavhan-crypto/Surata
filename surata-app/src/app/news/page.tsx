import Navbar from "../components/Navbar";
import { news } from "../data/news";
export default function NewsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <div className="px-8 py-16">

        <h1 className="text-6xl font-extrabold text-cyan-400 text-center mb-6">
          Latest News & Updates
        </h1>

        <p className="text-center text-slate-400 text-xl mb-16">
          IIT, IIM, placement, startup and education news from across India.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
{news.map((item, index) => (
  <div
    key={index}
    className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
  >
    <h2 className="text-2xl font-bold mb-4">
      {item.title}
    </h2>

    <p className="text-slate-400">
      {item.description}
    </p>
  </div>
))}

        </div>

      </div>

    </main>
  );
}