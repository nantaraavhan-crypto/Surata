import { governmentExams } from "../data/governmentExams";
export default function GovernmentExamsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-8 py-16">

      {/* Heading */}

      <div className="text-center mb-20">

        <h1 className="text-6xl font-extrabold text-cyan-400 mb-6">
          Government Exam Updates
        </h1>

        <p className="text-slate-400 text-xl max-w-4xl mx-auto leading-9">

          Get latest notifications, admit cards,
          exam dates, syllabus updates and results
          for UPSC, SSC, Banking, Railways, JEE,
          NEET and other government exams.

        </p>

      </div>

      {/* Search Bar */}

      <div className="flex justify-center mb-16">

        <input
          type="text"
          placeholder="Search government exams..."
          className="w-full md:w-[700px] px-6 py-5 rounded-2xl bg-slate-900 border border-slate-700 outline-none text-lg"
        />

      </div>

      {/* Exam Cards */}

      <div className="grid md:grid-cols-3 gap-8">

        
{governmentExams.map((exam, index) => (
  <div
    key={index}
    className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
  >
    <h2 className="text-2xl font-bold mb-4">
      {exam.title}
    </h2>

    <p className="text-slate-400">
      {exam.description}
    </p>
  </div>
))}

      </div>

      {/* Trending Exams */}

      <section className="mt-24">

        <h2 className="text-4xl font-bold text-cyan-400 mb-10">
          Trending Exams
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center hover:bg-slate-800 transition">
            <h3 className="text-2xl font-bold">
              UPSC
            </h3>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center hover:bg-slate-800 transition">
            <h3 className="text-2xl font-bold">
              SSC
            </h3>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center hover:bg-slate-800 transition">
            <h3 className="text-2xl font-bold">
              Banking
            </h3>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center hover:bg-slate-800 transition">
            <h3 className="text-2xl font-bold">
              Railways
            </h3>
          </div>

        </div>

      </section>

      {/* Advertisement */}

      <section className="mt-24">

        <div className="bg-slate-900 border border-dashed border-slate-700 rounded-3xl p-16 text-center">

          <h2 className="text-3xl font-bold text-slate-400">
            Advertisement Space
          </h2>

          <p className="text-slate-500 mt-4">
            Coaching promotions and Google Ads will appear here.
          </p>

        </div>

      </section>

    </main>
  );
}