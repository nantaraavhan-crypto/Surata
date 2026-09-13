"use client";
import { useState, useCallback } from "react";

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  education: { degree: string; school: string; year: string; gpa: string }[];
  experience: { title: string; company: string; duration: string; bullets: string }[];
  skills: string;
  projects: { name: string; description: string; tech: string }[];
  certifications: string;
}

interface ATSScore {
  total: number;
  sections: { name: string; score: number; max: number; tips: string[] }[];
}

const emptyResume: ResumeData = {
  name: "", email: "", phone: "", location: "", linkedin: "", github: "",
  summary: "",
  education: [{ degree: "", school: "", year: "", gpa: "" }],
  experience: [{ title: "", company: "", duration: "", bullets: "" }],
  skills: "",
  projects: [{ name: "", description: "", tech: "" }],
  certifications: "",
};

function analyzeATS(data: ResumeData): ATSScore {
  const sections: ATSScore["sections"] = [];

  // Contact info
  const contactTips: string[] = [];
  if (!data.email) contactTips.push("Add your email address");
  if (!data.phone) contactTips.push("Add your phone number");
  if (!data.location) contactTips.push("Add your location");
  if (!data.linkedin) contactTips.push("Add LinkedIn profile URL");
  const contactScore = [data.email, data.phone, data.location, data.linkedin].filter(Boolean).length;
  sections.push({ name: "Contact Information", score: contactScore, max: 4, tips: contactTips.length ? contactTips : ["Contact info looks complete"] });

  // Summary
  const summaryTips: string[] = [];
  let summaryScore = 0;
  if (data.summary.length > 0) summaryScore++;
  if (data.summary.length >= 50) summaryScore++;
  if (data.summary.length >= 100) summaryScore++;
  if (!data.summary) summaryTips.push("Add a professional summary (2-3 lines)");
  else {
    if (data.summary.length < 50) summaryTips.push("Summary is too short — aim for 2-3 sentences");
    if (!/\d/.test(data.summary)) summaryTips.push("Add numbers/metrics to your summary");
    const buzzWords = ["results", "passionate", "experienced", "skilled", "proven", "track record"];
    if (!buzzWords.some((w) => data.summary.toLowerCase().includes(w))) summaryTips.push("Include power words like 'results-driven', 'proven track record'");
  }
  sections.push({ name: "Professional Summary", score: summaryScore, max: 3, tips: summaryTips.length ? summaryTips : ["Summary looks strong"] });

  // Experience
  const expTips: string[] = [];
  let expScore = 0;
  const validExp = data.experience.filter((e) => e.title && e.company);
  if (validExp.length > 0) expScore++;
  if (validExp.length >= 2) expScore++;
  const allBullets = validExp.flatMap((e) => e.bullets.split("\n").filter((b) => b.trim()));
  if (allBullets.length >= 3) expScore++;
  if (allBullets.length >= 6) expScore++;
  const quantified = allBullets.filter((b) => /\d+%|\d+\+?|\$|\d+x|increased|reduced|improved|saved|generated/i.test(b));
  if (quantified.length >= 2) expScore++;
  if (validExp.length === 0) expTips.push("Add at least one work experience");
  if (allBullets.length < 3) expTips.push("Add more bullet points (aim 3-5 per role)");
  if (quantified.length < 2) expTips.push("Quantify achievements — 'Increased sales by 25%' not 'Responsible for sales'");
  const actionVerbs = ["led", "built", "developed", "implemented", "designed", "created", "launched", "managed", "reduced", "increased", "improved", "delivered", "optimized", "automated", "mentored"];
  const hasActionVerbs = allBullets.some((b) => actionVerbs.some((v) => b.toLowerCase().startsWith(v) || b.toLowerCase().includes(v)));
  if (!hasActionVerbs && allBullets.length > 0) expTips.push("Start bullet points with action verbs (Led, Built, Increased, Reduced)");
  sections.push({ name: "Work Experience", score: expScore, max: 5, tips: expTips.length ? expTips : ["Experience section looks great"] });

  // Skills
  const skillTips: string[] = [];
  let skillScore = 0;
  const skillsList = data.skills.split(",").map((s) => s.trim()).filter(Boolean);
  if (skillsList.length > 0) skillScore++;
  if (skillsList.length >= 5) skillScore++;
  if (skillsList.length >= 10) skillScore++;
  if (skillsList.length < 5) skillTips.push("Add more skills — aim for 8-15 relevant skills");
  if (!data.skills) skillTips.push("Add a skills section with your technical and soft skills");
  sections.push({ name: "Skills", score: skillScore, max: 3, tips: skillTips.length ? skillTips : ["Skills section looks good"] });

  // Projects
  const projTips: string[] = [];
  let projScore = 0;
  const validProj = data.projects.filter((p) => p.name && p.description);
  if (validProj.length > 0) projScore++;
  if (validProj.length >= 2) projScore++;
  if (validProj.some((p) => p.tech)) projScore++;
  if (validProj.length === 0) projTips.push("Add at least 1-2 personal projects");
  if (!validProj.some((p) => p.tech)) projTips.push("Add tech stack used for each project");
  sections.push({ name: "Projects", score: projScore, max: 3, tips: projTips.length ? projTips : ["Projects section looks strong"] });

  // Education
  const eduTips: string[] = [];
  let eduScore = 0;
  const validEdu = data.education.filter((e) => e.degree && e.school);
  if (validEdu.length > 0) eduScore++;
  if (validEdu.some((e) => e.gpa)) eduScore++;
  if (validEdu.length === 0) eduTips.push("Add your education details");
  if (validEdu.length > 0 && !validEdu.some((e) => e.gpa)) eduTips.push("Consider adding GPA if above 3.5/4.0 or 8.0/10");
  sections.push({ name: "Education", score: eduScore, max: 2, tips: eduTips.length ? eduTips : ["Education section looks good"] });

  // Format & keywords
  const formatTips: string[] = [];
  let formatScore = 0;
  const fullText = `${data.summary} ${data.skills} ${allBullets.join(" ")}`.toLowerCase();
  const techKeywords = ["javascript", "python", "react", "node", "sql", "aws", "docker", "git", "typescript", "java", "html", "css", "api", "rest", "graphql", "mongodb", "linux", "agile", "scrum"];
  const foundKeywords = techKeywords.filter((k) => fullText.includes(k));
  if (foundKeywords.length >= 3) formatScore++;
  if (foundKeywords.length >= 6) formatScore++;
  if (foundKeywords.length < 3) formatTips.push("Include more industry keywords (React, Python, AWS, SQL, etc.)");
  if (data.github) formatScore++;
  if (!data.github) formatTips.push("Add GitHub link — recruiters check it for code quality");
  sections.push({ name: "Keywords & Format", score: formatScore, max: 3, tips: formatTips.length ? formatTips : ["Keywords and format look strong"] });

  const total = sections.reduce((acc, s) => acc + s.score, 0);
  const max = sections.reduce((acc, s) => acc + s.max, 0);
  return { total: Math.round((total / max) * 100), sections };
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function getScoreRing(score: number) {
  if (score >= 80) return "stroke-green-400";
  if (score >= 60) return "stroke-yellow-400";
  if (score >= 40) return "stroke-orange-400";
  return "stroke-red-400";
}

export default function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [ats, setATS] = useState<ATSScore | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const update = useCallback((field: keyof ResumeData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateEdu = useCallback((i: number, field: string, value: string) => {
    setData((prev) => {
      const edu = [...prev.education];
      (edu[i] as Record<string, string>)[field] = value;
      return { ...prev, education: edu };
    });
  }, []);

  const addEdu = () => setData((prev) => ({ ...prev, education: [...prev.education, { degree: "", school: "", year: "", gpa: "" }] }));
  const removeEdu = (i: number) => setData((prev) => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));

  const updateExp = useCallback((i: number, field: string, value: string) => {
    setData((prev) => {
      const exp = [...prev.experience];
      (exp[i] as Record<string, string>)[field] = value;
      return { ...prev, experience: exp };
    });
  }, []);

  const addExp = () => setData((prev) => ({ ...prev, experience: [...prev.experience, { title: "", company: "", duration: "", bullets: "" }] }));
  const removeExp = (i: number) => setData((prev) => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));

  const updateProj = useCallback((i: number, field: string, value: string) => {
    setData((prev) => {
      const proj = [...prev.projects];
      (proj[i] as Record<string, string>)[field] = value;
      return { ...prev, projects: proj };
    });
  }, []);

  const addProj = () => setData((prev) => ({ ...prev, projects: [...prev.projects, { name: "", description: "", tech: "" }] }));
  const removeProj = (i: number) => setData((prev) => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }));

  const runAnalysis = () => {
    setATS(analyzeATS(data));
    setShowPreview(true);
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = ats ? circumference - (ats.total / 100) * circumference : circumference;

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Build Your Resume</h2>
        <p className="text-slate-400 text-sm mb-6">Fill in your details. Get instant ATS score and improvement tips.</p>

        {/* Basic Info */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {([
              ["name", "Full Name", "John Doe"],
              ["email", "Email", "john@example.com"],
              ["phone", "Phone", "+91 98765 43210"],
              ["location", "Location", "Bangalore, India"],
              ["linkedin", "LinkedIn URL", "linkedin.com/in/johndoe"],
              ["github", "GitHub URL", "github.com/johndoe"],
            ] as const).map(([field, label, placeholder]) => (
              <div key={field}>
                <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                <input
                  value={data[field]}
                  onChange={(e) => update(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">Professional Summary</h3>
          <textarea
            value={data.summary}
            onChange={(e) => update("summary", e.target.value)}
            placeholder="2-3 sentence summary of your experience and goals..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
          />
        </div>

        {/* Education */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Education</h3>
            <button onClick={addEdu} className="text-cyan-400 text-xs font-bold hover:text-cyan-300">+ Add</button>
          </div>
          {data.education.map((edu, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4 mb-3 space-y-2">
              <div className="grid md:grid-cols-2 gap-2">
                <input value={edu.degree} onChange={(e) => updateEdu(i, "degree", e.target.value)} placeholder="Degree (B.Tech CSE)" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none" />
                <input value={edu.school} onChange={(e) => updateEdu(i, "school", e.target.value)} placeholder="College / University" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                <input value={edu.year} onChange={(e) => updateEdu(i, "year", e.target.value)} placeholder="Year (2020-2024)" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none" />
                <input value={edu.gpa} onChange={(e) => updateEdu(i, "gpa", e.target.value)} placeholder="GPA / Percentage (optional)" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none" />
              </div>
              {data.education.length > 1 && <button onClick={() => removeEdu(i)} className="text-red-400 text-xs hover:text-red-300">Remove</button>}
            </div>
          ))}
        </div>

        {/* Experience */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Work Experience</h3>
            <button onClick={addExp} className="text-cyan-400 text-xs font-bold hover:text-cyan-300">+ Add</button>
          </div>
          {data.experience.map((exp, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4 mb-3 space-y-2">
              <div className="grid md:grid-cols-2 gap-2">
                <input value={exp.title} onChange={(e) => updateExp(i, "title", e.target.value)} placeholder="Job Title (Software Engineer)" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none" />
                <input value={exp.company} onChange={(e) => updateExp(i, "company", e.target.value)} placeholder="Company Name" className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none" />
              </div>
              <input value={exp.duration} onChange={(e) => updateExp(i, "duration", e.target.value)} placeholder="Duration (Jan 2023 - Present)" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none" />
              <textarea
                value={exp.bullets}
                onChange={(e) => updateExp(i, "bullets", e.target.value)}
                placeholder="Key achievements (one per line)&#10;- Increased API performance by 40%&#10;- Led team of 5 developers&#10;- Reduced deployment time by 60%"
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
              />
              {data.experience.length > 1 && <button onClick={() => removeExp(i)} className="text-red-400 text-xs hover:text-red-300">Remove</button>}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">Skills</h3>
          <input
            value={data.skills}
            onChange={(e) => update("skills", e.target.value)}
            placeholder="React, Node.js, Python, SQL, Docker, AWS, Git, TypeScript..."
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Projects */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Projects</h3>
            <button onClick={addProj} className="text-cyan-400 text-xs font-bold hover:text-cyan-300">+ Add</button>
          </div>
          {data.projects.map((proj, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4 mb-3 space-y-2">
              <input value={proj.name} onChange={(e) => updateProj(i, "name", e.target.value)} placeholder="Project Name" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none" />
              <textarea
                value={proj.description}
                onChange={(e) => updateProj(i, "description", e.target.value)}
                placeholder="What it does, your role, impact..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
              />
              <input value={proj.tech} onChange={(e) => updateProj(i, "tech", e.target.value)} placeholder="Tech stack (React, MongoDB, Express)" className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none" />
              {data.projects.length > 1 && <button onClick={() => removeProj(i)} className="text-red-400 text-xs hover:text-red-300">Remove</button>}
            </div>
          ))}
        </div>

        <button onClick={runAnalysis} className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-8 rounded-xl transition text-sm">
          Generate Resume & ATS Score
        </button>
      </div>

      {/* Results */}
      {showPreview && ats && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score Ring */}
              <div className="relative">
                <svg width="120" height="120" className="-rotate-90">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle cx="60" cy="60" r="45" fill="none" strokeWidth="10" strokeLinecap="round"
                    className={getScoreRing(ats.total)}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-extrabold ${getScoreColor(ats.total)}`}>{ats.total}</span>
                  <span className="text-slate-500 text-xs">ATS Score</span>
                </div>
              </div>

              {/* Section Breakdown */}
              <div className="flex-1 w-full">
                <h3 className="text-lg font-bold text-white mb-4">Score Breakdown</h3>
                <div className="space-y-3">
                  {ats.sections.map((s) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-300">{s.name}</span>
                        <span className="text-xs text-slate-500">{s.score}/{s.max}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            s.score / s.max >= 0.7 ? "bg-green-400" : s.score / s.max >= 0.4 ? "bg-yellow-400" : "bg-red-400"
                          }`}
                          style={{ width: `${(s.score / s.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-4">Improvement Tips</h3>
            <div className="space-y-4">
              {ats.sections.map((s) => (
                s.tips.length > 0 && (
                  <div key={s.name}>
                    <h4 className="text-sm font-bold text-cyan-400 mb-2">{s.name}</h4>
                    <ul className="space-y-1">
                      {s.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Resume Preview */}
          <div className="bg-white rounded-2xl p-8 text-black max-w-3xl">
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <h1 className="text-2xl font-bold">{data.name || "Your Name"}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600 mt-1">
                {data.email && <span>{data.email}</span>}
                {data.phone && <span>{data.phone}</span>}
                {data.location && <span>{data.location}</span>}
                {data.linkedin && <span className="text-blue-600">{data.linkedin}</span>}
                {data.github && <span className="text-blue-600">{data.github}</span>}
              </div>
            </div>

            {data.summary && (
              <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">Summary</h2>
                <p className="text-sm text-slate-700">{data.summary}</p>
              </div>
            )}

            {data.education.some((e) => e.degree) && (
              <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">Education</h2>
                {data.education.filter((e) => e.degree).map((edu, i) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
                    <div><span className="font-semibold">{edu.degree}</span> — {edu.school}</div>
                    <div className="text-slate-500">{edu.year}{edu.gpa ? ` | GPA: ${edu.gpa}` : ""}</div>
                  </div>
                ))}
              </div>
            )}

            {data.experience.some((e) => e.title) && (
              <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">Experience</h2>
                {data.experience.filter((e) => e.title).map((exp, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{exp.title} at {exp.company}</span>
                      <span className="text-slate-500">{exp.duration}</span>
                    </div>
                    {exp.bullets && (
                      <ul className="text-sm text-slate-700 mt-1 ml-4 list-disc">
                        {exp.bullets.split("\n").filter((b) => b.trim()).map((b, j) => (
                          <li key={j}>{b.replace(/^[-•*]\s*/, "")}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.projects.some((p) => p.name) && (
              <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">Projects</h2>
                {data.projects.filter((p) => p.name).map((proj, i) => (
                  <div key={i} className="mb-2 text-sm">
                    <span className="font-semibold">{proj.name}</span>
                    {proj.tech && <span className="text-slate-500"> — {proj.tech}</span>}
                    {proj.description && <p className="text-slate-700">{proj.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {data.skills && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">Skills</h2>
                <p className="text-sm text-slate-700">{data.skills}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
