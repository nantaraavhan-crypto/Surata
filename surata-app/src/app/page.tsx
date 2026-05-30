
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}

      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800 sticky top-0 bg-slate-950 z-50">

        <h1 className="text-3xl font-extrabold text-cyan-400">
          SURATA
        </h1>

        <div className="hidden md:flex gap-8 text-lg">

        <a href="/" className="hover:text-cyan-400 transition">
  Home
</a>

<a href="/internships" className="hover:text-cyan-400 transition">
  Internships
</a>

<a href="/government-exams" className="hover:text-cyan-400 transition">
  Govt Exams
</a>

<a href="/placements" className="hover:text-cyan-400 transition">
  Placements
</a>

<a href="/news" className="hover:text-cyan-400 transition">
  News
</a>

        </div>

      </nav>

      {/* Hero Section */}

      <section className="px-8 py-24 text-center">

        <h1 className="text-6xl md:text-8xl font-extrabold text-cyan-400 leading-tight">

          INDIA'S AI OPPORTUNITY PLATFORM

        </h1>

        <p className="max-w-4xl mx-auto mt-10 text-slate-300 text-xl md:text-2xl leading-10">

          Get latest internships, government exam alerts,
          placement updates, IIT/IIM news, scholarships,
          AI summaries and career opportunities — all in one place.

        </p>

        <div className="mt-12 flex justify-center">

          <input
            type="text"
            placeholder="Search internships, exams, opportunities..."
            className="w-full md:w-[700px] px-6 py-5 rounded-2xl bg-slate-900 border border-slate-700 outline-none text-lg"
          />

        </div>

      </section>

      {/* Trending Section */}
<section className="px-8 py-10">

  <div className="grid md:grid-cols-4 gap-6 mb-16">

    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
      <h2 className="text-4xl font-extrabold text-cyan-400">500+</h2>
      <p className="text-slate-400 mt-2">Internships</p>
    </div>

    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
      <h2 className="text-4xl font-extrabold text-cyan-400">200+</h2>
      <p className="text-slate-400 mt-2">Placements</p>
    </div>

    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
      <h2 className="text-4xl font-extrabold text-cyan-400">100+</h2>
      <p className="text-slate-400 mt-2">Scholarships</p>
    </div>

    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
      <h2 className="text-4xl font-extrabold text-cyan-400">50+</h2>
      <p className="text-slate-400 mt-2">Daily Updates</p>
    </div>

  </div>

</section>
      <section className="px-8 py-10">

        <h2 className="text-4xl font-bold text-cyan-400 mb-10">
          Trending Opportunities
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:scale-105 transition">

            <span className="bg-cyan-500 text-black px-4 py-2 rounded-full text-sm font-bold">
              Internship
            </span>

            <h3 className="text-2xl font-bold mt-6">
              Google STEP Internship 2026
            </h3>

            <p className="text-slate-400 mt-5 leading-8">
              Applications open for engineering students.
              Stipend up to ₹1 lakh/month.
            </p>

<a
  href="/internships"
  className="inline-block mt-8 bg-cyan-500 hover:bg-cyan-600 transition px-6 py-3 rounded-xl font-semibold"
>
  Apply Now
</a>

          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:scale-105 transition">

            <span className="bg-green-500 text-black px-4 py-2 rounded-full text-sm font-bold">
              Government Exam
            </span>

            <h3 className="text-2xl font-bold mt-6">
              UPSC Notification Released
            </h3>

            <p className="text-slate-400 mt-5 leading-8">
              UPSC Civil Services official notification
              released with updated exam schedule.
            </p>

            <a
  href="/government-exams"
  className="inline-block mt-8 bg-cyan-500 hover:bg-cyan-600 transition px-6 py-3 rounded-xl font-semibold"
>
  Read More
</a>

          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:scale-105 transition">

            <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold">
              Placement
            </span>

            <h3 className="text-2xl font-bold mt-6">
              Goldman Sachs Hiring Freshers
            </h3>

            <p className="text-slate-400 mt-5 leading-8">
              New analyst and engineering roles open
              for 2026 graduates across India.
            </p>

            <a
  href="/placements"
  className="inline-block mt-8 bg-cyan-500 hover:bg-cyan-600 transition px-6 py-3 rounded-xl font-semibold"
>
  Explore
</a>

          </div>

        </div>

      </section>

      {/* Categories */}

      <section className="px-8 py-20">

        <h2 className="text-4xl font-bold text-cyan-400 mb-12">
          Explore Categories
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          <a
  href="/internships"
  className="bg-slate-900 p-8 rounded-2xl text-center border border-slate-800 hover:bg-slate-800 transition block"
>
  <h3 className="text-2xl font-bold">Internships</h3>
</a>

          <a
  href="/government-exams"
  className="bg-slate-900 p-8 rounded-2xl text-center border border-slate-800 hover:bg-slate-800 transition block"
>
  <h3 className="text-2xl font-bold">Govt Exams</h3>
</a>

          <a
  href="/placements"
  className="bg-slate-900 p-8 rounded-2xl text-center border border-slate-800 hover:bg-slate-800 transition block"
>
  <h3 className="text-2xl font-bold">Placements</h3>
</a>

         <a
  href="/scholarships"
  className="bg-slate-900 p-8 rounded-2xl text-center border border-slate-800 hover:bg-slate-800 transition block"
>
  <h3 className="text-2xl font-bold">Scholarships</h3>
</a>

        </div>

      </section>

      {/* Ad Space */}

      <section className="px-8 py-10">

        <div className="bg-slate-900 border border-dashed border-slate-700 rounded-3xl p-16 text-center">

          <h2 className="text-3xl font-bold text-slate-400">
            Advertisement Space
          </h2>

          <p className="text-slate-500 mt-4">
            Google AdSense and sponsored opportunities will appear here.
          </p>

        </div>

      </section>

      {/* Contact */}

      <section className="px-8 py-24 text-center">

        <h2 className="text-5xl font-bold text-cyan-400 mb-12">
          Contact SURATA
        </h2>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl mx-auto p-10">

          <p className="text-2xl mb-6">
            📧 surata12q@gmail.com
          </p>

          <p className="text-2xl mb-6">
            For partnerships and advertisements, contact via email.
          </p>

          <p className="text-slate-400 text-lg leading-8">
            For partnerships, advertisements,
            collaborations and opportunities,
            connect with SURATA.
          </p>

        </div>

      </section>

      {/* Footer */}

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500">

        © 2026 SURATA | India’s AI Opportunity Platform

      </footer>

    </main>
  );
}