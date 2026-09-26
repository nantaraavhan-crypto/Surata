import Link from "next/link";

const SUGGESTED = [
  { href: "/government-jobs", label: "Government Jobs" },
  { href: "/internships", label: "Internships" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/results", label: "Exam Results" },
];

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold tracking-widest text-cyan-400 mb-4">
          404
        </p>
        <h1 className="text-4xl font-bold mb-4">This page doesn&apos;t exist</h1>
        <p className="text-slate-400 leading-7 mb-10">
          The link may be outdated, or the page may have moved. One of these is
          probably what you were looking for.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {SUGGESTED.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
