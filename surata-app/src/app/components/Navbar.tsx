export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800 bg-slate-950 sticky top-0 z-50">

      {/* Logo */}

      <a
        href="/"
        className="text-3xl font-extrabold text-cyan-400"
      >
        SURATA
      </a>

      {/* Navigation Links */}

      <div className="hidden md:flex gap-8 text-lg text-white">

        <a
          href="/"
          className="hover:text-cyan-400 transition"
        >
          Home
        </a>

        <a
          href="/internships"
          className="hover:text-cyan-400 transition"
        >
          Internships
        </a>

        <a
          href="/government-exams"
          className="hover:text-cyan-400 transition"
        >
          Govt Exams
        </a>

        <a
          href="/placements"
          className="hover:text-cyan-400 transition"
        >
          Placements
        </a>

        <a
          href="/iit-news"
          className="hover:text-cyan-400 transition"
        >
          News
        </a>

      </div>

    </nav>
  );
}