import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SURATA | India's AI Opportunity Platform",
    template: "%s | SURATA",
  },
  description:
    "Discover government jobs, private careers, internships, scholarships, hackathons, exam results, and more — all powered by AI, updated in real-time.",
  keywords: [
    "government jobs",
    "private jobs",
    "internships",
    "scholarships",
    "hackathons",
    "exam results",
    "admit cards",
    "answer keys",
    "UPSC",
    "SSC",
    "IBPS",
    "IIT",
    "IIM",
    "career platform",
    "India",
  ],
  authors: [{ name: "SURATA" }],
  creator: "SURATA",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://surata.vercel.app",
    siteName: "SURATA",
    title: "SURATA | India's AI Opportunity Platform",
    description:
      "Government jobs, private careers, internships, scholarships, hackathons, exam results — all in one AI-powered platform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SURATA | India's AI Opportunity Platform",
    description:
      "Government jobs, private careers, internships, scholarships, hackathons, exam results — all in one AI-powered platform.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800/50 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Jobs</h3>
                <ul className="space-y-2">
                  <li><a href="/government-jobs" className="text-sm text-slate-400 hover:text-cyan-400 transition">Government Jobs</a></li>
                  <li><a href="/private-jobs" className="text-sm text-slate-400 hover:text-cyan-400 transition">Private Jobs</a></li>
                  <li><a href="/internships" className="text-sm text-slate-400 hover:text-cyan-400 transition">Internships</a></li>
                  <li><a href="/placements" className="text-sm text-slate-400 hover:text-cyan-400 transition">Placements</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Exams</h3>
                <ul className="space-y-2">
                  <li><a href="/results" className="text-sm text-slate-400 hover:text-cyan-400 transition">Results</a></li>
                  <li><a href="/admit-cards" className="text-sm text-slate-400 hover:text-cyan-400 transition">Admit Cards</a></li>
                  <li><a href="/answer-keys" className="text-sm text-slate-400 hover:text-cyan-400 transition">Answer Keys</a></li>
                  <li><a href="/government-exams" className="text-sm text-slate-400 hover:text-cyan-400 transition">Exam Calendar</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Students</h3>
                <ul className="space-y-2">
                  <li><a href="/scholarships" className="text-sm text-slate-400 hover:text-cyan-400 transition">Scholarships</a></li>
                  <li><a href="/college" className="text-sm text-slate-400 hover:text-cyan-400 transition">Hackathons</a></li>
                  <li><a href="/iits-iims" className="text-sm text-slate-400 hover:text-cyan-400 transition">IITs & IIMs</a></li>
                  <li><a href="/eligibility" className="text-sm text-slate-400 hover:text-cyan-400 transition">Eligibility Check</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Tools</h3>
                <ul className="space-y-2">
                  <li><a href="/ai-tools" className="text-sm text-slate-400 hover:text-cyan-400 transition">AI Career Tools</a></li>
                  <li><a href="/tracker" className="text-sm text-slate-400 hover:text-cyan-400 transition">Application Tracker</a></li>
                  <li><a href="/companies" className="text-sm text-slate-400 hover:text-cyan-400 transition">Company Profiles</a></li>
                  <li><a href="/about" className="text-sm text-slate-400 hover:text-cyan-400 transition">About</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-slate-950 font-bold text-xs">S</span>
                </div>
                <span className="text-sm font-bold text-white">SURATA</span>
              </div>
              <p className="text-xs text-slate-500 text-center">
                &copy; {new Date().getFullYear()} SURATA. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="mailto:surata12q@gmail.com" className="text-xs text-slate-500 hover:text-cyan-400 transition">Contact</a>
                <a href="/about" className="text-xs text-slate-500 hover:text-cyan-400 transition">About</a>
                <a href="/privacy" className="text-xs text-slate-500 hover:text-cyan-400 transition">Privacy</a>
                <a href="/terms" className="text-xs text-slate-500 hover:text-cyan-400 transition">Terms</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
