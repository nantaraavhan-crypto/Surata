"use client";
import { useState } from "react";

interface MatchResult {
  total: number;
  matched: string[];
  missing: string[];
  bonus: string[];
  sections: { name: string; score: number; feedback: string }[];
}

const ROLE_KEYWORDS: Record<string, string[]> = {
  "software engineer": ["javascript", "python", "java", "react", "node.js", "sql", "git", "docker", "aws", "rest api", "typescript", "mongodb", "linux", "ci/cd", "agile"],
  "frontend developer": ["javascript", "react", "html", "css", "typescript", "next.js", "tailwind", "redux", "webpack", "figma", "responsive design", "accessibility", "performance optimization"],
  "backend developer": ["python", "java", "node.js", "sql", "mongodb", "rest api", "graphql", "docker", "aws", "redis", "microservices", "authentication", "linux"],
  "data scientist": ["python", "sql", "machine learning", "tensorflow", "pytorch", "pandas", "numpy", "statistics", "r", "jupyter", "scikit-learn", "deep learning", "nlp"],
  "product manager": ["sql", "analytics", "user research", "wireframing", "a/b testing", "roadmap", "stakeholder management", "jira", "figma", "market research", "kpis", "agile"],
  "devops engineer": ["linux", "docker", "kubernetes", "aws", "terraform", "ci/cd", "jenkins", "ansible", "monitoring", "python", "bash", "infrastructure"],
  "full stack developer": ["javascript", "react", "node.js", "sql", "mongodb", "html", "css", "git", "docker", "aws", "rest api", "typescript", "next.js", "express"],
  "ui/ux designer": ["figma", "sketch", "adobe xd", "user research", "wireframing", "prototyping", "design systems", "usability testing", "information architecture", "interaction design"],
  "machine learning engineer": ["python", "tensorflow", "pytorch", "scikit-learn", "machine learning", "deep learning", "sql", "docker", "aws", "mlops", "model deployment", "feature engineering"],
  "cloud architect": ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "linux", "networking", "security", "serverless", "microservices", "cost optimization"],
  "cybersecurity analyst": ["network security", "penetration testing", "siem", "firewalls", "linux", "python", "incident response", "vulnerability assessment", "compliance", "encryption"],
  "mobile developer": ["react native", "flutter", "swift", "kotlin", "java", "dart", "firebase", "rest api", "git", "app store", "ui/ux", "offline storage"],
};

function extractKeywords(text: string): string[] {
  const cleaned = text.toLowerCase()
    .replace(/[^a-z0-9\s\-\/\.+#]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return [...new Set(cleaned)];
}

function extractTechKeywords(text: string): string[] {
  const techTerms = [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin", "dart",
    "react", "angular", "vue", "next.js", "nuxt", "svelte", "node.js", "express", "fastapi", "django", "flask", "spring",
    "html", "css", "sass", "tailwind", "bootstrap", "material ui",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "dynamodb", "firebase",
    "aws", "azure", "gcp", "heroku", "vercel", "netlify",
    "docker", "kubernetes", "jenkins", "github actions", "ci/cd", "terraform", "ansible",
    "git", "github", "gitlab", "bitbucket",
    "figma", "sketch", "adobe xd", "photoshop",
    "jira", "confluence", "slack", "notion",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "machine learning", "deep learning", "nlp",
    "rest api", "graphql", "grpc", "websocket",
    "linux", "bash", "shell scripting",
    "agile", "scrum", "kanban",
    "authentication", "oauth", "jwt", "encryption",
    "microservices", "serverless", "event-driven",
    "redis", "rabbitmq", "kafka",
    "monitoring", "logging", "prometheus", "grafana",
    "penetration testing", "siem", "firewall",
    "blockchain", "web3", "solidity",
    "react native", "flutter", "swift", "kotlin",
    "objective-c",
    "regex", "xpath", "json", "xml", "yaml",
    "vscode", "intellij", "eclipse",
    "postman", "swagger",
    "load testing", "performance testing", "selenium", "cypress", "jest", "mocha",
    "webpack", "vite", "babel", "esbuild",
    "oauth", "saml", "ldap",
    "seo", "analytics", "google analytics",
  ];
  const lower = text.toLowerCase();
  return techTerms.filter((t) => lower.includes(t));
}

function analyzeMatch(jobDesc: string, resume: string): MatchResult {
  const jdKeywords = extractTechKeywords(jobDesc);
  const resumeKeywords = extractTechKeywords(resume);
  const allJdKeywords = [...new Set(jdKeywords.map((k) => k.toLowerCase()))];
  const allResumeKeywords = [...new Set(resumeKeywords.map((k) => k.toLowerCase()))];

  const matched = allJdKeywords.filter((k) => allResumeKeywords.includes(k));
  const missing = allJdKeywords.filter((k) => !allResumeKeywords.includes(k));
  const bonus = allResumeKeywords.filter((k) => !allJdKeywords.includes(k));

  // Additional analysis
  const sections: MatchResult["sections"] = [];

  // Keyword match
  const kwScore = allJdKeywords.length > 0 ? Math.round((matched.length / allJdKeywords.length) * 100) : 0;
  sections.push({
    name: "Keyword Match",
    score: kwScore,
    feedback: kwScore >= 80 ? "Excellent keyword match!" : kwScore >= 50 ? "Good match, but some gaps." : "Significant keyword gaps — add missing skills.",
  });

  // Experience analysis
  const jdExperience = jobDesc.toLowerCase().match(/(\d+)\+?\s*years?\s*(of)?\s*experience/);
  const resumeExperience = resume.toLowerCase().match(/(\d+)\+?\s*years?\s*(of)?\s*experience/);
  let expScore = 50;
  if (jdExperience && resumeExperience) {
    const required = parseInt(jdExperience[1]);
    const has = parseInt(resumeExperience[1]);
    expScore = has >= required ? 100 : Math.round((has / required) * 100);
  } else if (!jdExperience) {
    expScore = 70;
  }
  sections.push({
    name: "Experience Match",
    score: expScore,
    feedback: expScore >= 80 ? "Experience level meets requirements." : expScore >= 50 ? "Close to requirements — highlight relevant projects." : "Consider adding more relevant experience.",
  });

  // Education match
  const eduKeywords = ["bachelor", "b.tech", "b.e.", "master", "m.tech", "mba", "bca", "mca", "b.sc", "m.sc", "ph.d"];
  const jdEdu = eduKeywords.filter((k) => jobDesc.toLowerCase().includes(k));
  const resumeEdu = eduKeywords.filter((k) => resume.toLowerCase().includes(k));
  let eduScore = 70;
  if (jdEdu.length > 0) {
    const hasMatch = jdEdu.some((e) => resumeEdu.some((r) => r.includes(e) || e.includes(r)));
    eduScore = hasMatch ? 100 : 40;
  }
  sections.push({
    name: "Education",
    score: eduScore,
    feedback: eduScore >= 80 ? "Education requirements met." : "Consider adding relevant education details.",
  });

  // Skills depth
  const skillSections = ["skills", "technologies", "tools", "tech stack"];
  const hasSkillsSection = skillSections.some((s) => resume.toLowerCase().includes(s));
  const skillsScore = hasSkillsSection ? 80 : 40;
  sections.push({
    name: "Skills Section",
    score: skillsScore,
    feedback: hasSkillsSection ? "Skills section found." : "Add a dedicated Skills section to your resume.",
  });

  // Certifications & extras
  const certKeywords = ["certified", "certification", "aws certified", "google cloud", "azure", "pmp", "ci cd"];
  const hasCerts = certKeywords.some((c) => resume.toLowerCase().includes(c));
  const certScore = hasCerts ? 90 : 50;
  sections.push({
    name: "Certifications",
    score: certScore,
    feedback: hasCerts ? "Relevant certifications found." : "Consider adding relevant certifications.",
  });

  const total = Math.round(sections.reduce((a, s) => a + s.score, 0) / sections.length);

  return { total, matched, missing, bonus, sections };
}

export default function JobResumeMatch() {
  const [jobDesc, setJobDesc] = useState("");
  const [resume, setResume] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);

  const analyze = () => {
    if (!jobDesc.trim() || !resume.trim()) return;
    setResult(analyzeMatch(jobDesc, resume));
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = result ? circumference - (result.total / 100) * circumference : circumference;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Job-Resume Match</h2>
        <p className="text-slate-400 text-sm mb-6">Paste a job description and your resume to see your match score and missing keywords.</p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Job Description</label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={12}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Your Resume</label>
            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume content here..."
              rows={12}
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        <button
          onClick={analyze}
          disabled={!jobDesc.trim() || !resume.trim()}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-3 px-8 rounded-xl transition text-sm"
        >
          Analyze Match
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Score */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <svg width="120" height="120" className="-rotate-90">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle cx="60" cy="60" r="45" fill="none" strokeWidth="10" strokeLinecap="round"
                    className={result.total >= 70 ? "stroke-green-400" : result.total >= 40 ? "stroke-yellow-400" : "stroke-red-400"}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-extrabold ${result.total >= 70 ? "text-green-400" : result.total >= 40 ? "text-yellow-400" : "text-red-400"}`}>{result.total}%</span>
                  <span className="text-slate-500 text-xs">Match</span>
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="space-y-3">
                  {result.sections.map((s) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-300">{s.name}</span>
                        <span className={`text-xs font-bold ${s.score >= 70 ? "text-green-400" : s.score >= 40 ? "text-yellow-400" : "text-red-400"}`}>{s.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${s.score >= 70 ? "bg-green-400" : s.score >= 40 ? "bg-yellow-400" : "bg-red-400"}`}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{s.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Matched */}
            <div className="bg-slate-900 border border-green-500/30 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-green-400 mb-3">Matched ({result.matched.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.matched.map((k) => (
                  <span key={k} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">{k}</span>
                ))}
                {result.matched.length === 0 && <span className="text-slate-500 text-xs">No keywords matched</span>}
              </div>
            </div>

            {/* Missing */}
            <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-red-400 mb-3">Missing ({result.missing.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.missing.map((k) => (
                  <span key={k} className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">{k}</span>
                ))}
                {result.missing.length === 0 && <span className="text-green-400 text-xs">All keywords covered!</span>}
              </div>
            </div>

            {/* Bonus */}
            <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-blue-400 mb-3">Bonus Skills ({result.bonus.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.bonus.slice(0, 15).map((k) => (
                  <span key={k} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">{k}</span>
                ))}
                {result.bonus.length > 15 && <span className="text-slate-500 text-xs">+{result.bonus.length - 15} more</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
