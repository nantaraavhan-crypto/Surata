"use client";
import { useState } from "react";
import ResumeBuilder from "./ResumeBuilder";
import JobResumeMatch from "./JobResumeMatch";
import InterviewCoach from "./InterviewCoach";

type Tool = "resume" | "match" | "interview" | null;

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border-b border-purple-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-purple-500/20 text-purple-400 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            Powered by Smart Analysis
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
            <span className="text-purple-400">AI Career Tools</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Build your resume, match it against job descriptions, and practice interviews — all with real-time intelligent feedback.
          </p>

          {/* Tool Cards */}
          {!activeTool && (
            <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {/* Resume Builder */}
              <button
                onClick={() => setActiveTool("resume")}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 text-left hover:border-purple-500/50 transition-all group hover:bg-slate-800/50"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl mb-4">📄</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition">Resume Builder</h3>
                <p className="text-slate-400 text-sm mb-4">Build your resume section by section. Get instant ATS score with detailed breakdown and improvement tips.</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">ATS Scoring</span>
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">Live Preview</span>
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">7 Sections</span>
                </div>
                <span className="text-purple-400 text-sm font-semibold">Start Building →</span>
              </button>

              {/* Job-Resume Match */}
              <button
                onClick={() => setActiveTool("match")}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 text-left hover:border-cyan-500/50 transition-all group hover:bg-slate-800/50"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-2xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition">Job-Resume Match</h3>
                <p className="text-slate-400 text-sm mb-4">Paste a job description and your resume. Get match score, matched keywords, missing skills, and bonus skills.</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">Keyword Matching</span>
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">Gap Analysis</span>
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">Match %</span>
                </div>
                <span className="text-cyan-400 text-sm font-semibold">Check Match →</span>
              </button>

              {/* Interview Coach */}
              <button
                onClick={() => setActiveTool("interview")}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 text-left hover:border-green-500/50 transition-all group hover:bg-slate-800/50"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl mb-4">🎤</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition">Interview Coach</h3>
                <p className="text-slate-400 text-sm mb-4">Practice mock interviews with AI feedback. Get STAR method analysis, scoring, and real-time improvement tips.</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">STAR Analysis</span>
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">4 Categories</span>
                  <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">32 Questions</span>
                </div>
                <span className="text-green-400 text-sm font-semibold">Start Practice →</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Tool */}
      {activeTool && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <button
            onClick={() => setActiveTool(null)}
            className="text-slate-400 hover:text-white text-sm font-semibold mb-6 flex items-center gap-1 transition"
          >
            ← Back to all tools
          </button>
          {activeTool === "resume" && <ResumeBuilder />}
          {activeTool === "match" && <JobResumeMatch />}
          {activeTool === "interview" && <InterviewCoach />}
        </div>
      )}

      {/* Features */}
      {!activeTool && (
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Why These Tools?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-sm font-bold text-white mb-1">Instant Results</h3>
              <p className="text-slate-400 text-xs">No waiting — get feedback in milliseconds as you type</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-sm font-bold text-white mb-1">Data-Driven</h3>
              <p className="text-slate-400 text-xs">Real ATS scoring, STAR analysis, and keyword matching</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-sm font-bold text-white mb-1">Actionable Tips</h3>
              <p className="text-slate-400 text-xs">Specific improvements, not vague advice — fix issues right away</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
