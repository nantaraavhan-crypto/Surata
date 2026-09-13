"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "coach" | "user";
  content: string;
  score?: number;
  tips?: string[];
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  starRating: { situation: number; task: number; action: number; result: number };
}

const QUESTION_BANK: Record<string, string[]> = {
  "behavioral": [
    "Tell me about yourself and why you're interested in this role.",
    "Describe a time you faced a significant challenge at work. How did you handle it?",
    "Tell me about a time you had to work with a difficult teammate.",
    "Describe a situation where you had to make a quick decision without all the information.",
    "Tell me about a time you failed. What did you learn?",
    "Describe a time you went above and beyond for a project.",
    "Tell me about a time you had to persuade someone to see things your way.",
    "How do you handle stress and tight deadlines?",
  ],
  "technical": [
    "Explain a complex technical concept to a non-technical person.",
    "Describe the most challenging bug you've debugged.",
    "How do you approach system design for a new application?",
    "Walk me through how you would optimize a slow database query.",
    "Explain the difference between REST and GraphQL.",
    "How do you ensure code quality in your team?",
    "Describe your approach to testing.",
    "How would you handle a production outage?",
  ],
  "leadership": [
    "Describe your leadership style.",
    "Tell me about a time you mentored someone.",
    "How do you handle conflicts within your team?",
    "Describe a time you had to deliver bad news to stakeholders.",
    "How do you prioritize tasks when everything seems urgent?",
    "Tell me about a time you had to lead through ambiguity.",
    "How do you ensure your team stays motivated?",
    "Describe a difficult decision you made and its outcome.",
  ],
  "product": [
    "How would you prioritize features for a new product?",
    "Describe a product you admire and why.",
    "How do you gather and incorporate user feedback?",
    "Tell me about a time you had to say no to a stakeholder.",
    "How do you measure product success?",
    "Describe your ideal product development process.",
    "How do you balance technical debt with new features?",
    "How would you handle conflicting requirements from different stakeholders?",
  ],
};

function analyzeAnswer(answer: string, question: string): Feedback {
  const lower = answer.toLowerCase();
  const words = answer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // STAR analysis
  const starTerms = {
    situation: ["situation", "context", "background", "scenario", "when", "at my", "in my", "previously", "once", "during"],
    task: ["task", "responsibility", "goal", "objective", "needed to", "had to", "was asked to", "my role", "was responsible"],
    action: ["action", "approach", "strategy", "implemented", "built", "created", "developed", "led", "managed", "designed", "decided", "chose", "took", "started", "began", "executed"],
    result: ["result", "outcome", "impact", "achieved", "accomplished", "delivered", "reduced", "increased", "improved", "saved", "generated", "grew", "launched", "successfully", "metric"],
  };

  const starRating = {
    situation: Math.min(100, (starTerms.situation.filter((t) => lower.includes(t)).length / 2) * 100),
    task: Math.min(100, (starTerms.task.filter((t) => lower.includes(t)).length / 2) * 100),
    action: Math.min(100, (starTerms.action.filter((t) => lower.includes(t)).length / 3) * 100),
    result: Math.min(100, (starTerms.result.filter((t) => lower.includes(t)).length / 3) * 100),
  };

  const strengths: string[] = [];
  const improvements: string[] = [];

  // STAR evaluation
  const starTotal = (starRating.situation + starRating.task + starRating.action + starRating.result) / 4;
  if (starRating.situation > 50) strengths.push("Good context-setting at the start");
  else improvements.push("Start by setting the situation — give context before diving in");
  if (starRating.task > 50) strengths.push("Clear task/goal definition");
  else improvements.push("Clearly state what your responsibility or goal was");
  if (starRating.action > 50) strengths.push("Strong action verbs and concrete steps described");
  else improvements.push("Focus more on YOUR specific actions — what did you personally do?");
  if (starRating.result > 50) strengths.push("Results and impact clearly mentioned");
  else improvements.push("End with measurable results — numbers, percentages, outcomes");

  // Length check
  if (wordCount < 30) {
    improvements.push("Answer is too short — aim for 100-200 words for depth");
  } else if (wordCount > 300) {
    improvements.push("Answer is quite long — try to be more concise (aim 100-200 words)");
  } else {
    strengths.push("Good answer length — concise but detailed");
  }

  // Quantification
  const hasNumbers = /\d+%|\d+x|\$\d|₹\d|\d+ (percent|times|people|team|months|weeks|days)/i.test(answer);
  if (hasNumbers) strengths.push("Great use of specific numbers and metrics");
  else improvements.push("Add specific numbers — 'Increased sales by 25%' is stronger than 'Increased sales'");

  // Power words
  const powerWords = ["achieved", "delivered", "improved", "reduced", "built", "launched", "led", "managed", "optimized", "automated", "designed", "implemented"];
  const foundPowerWords = powerWords.filter((w) => lower.includes(w));
  if (foundPowerWords.length >= 3) strengths.push("Strong use of action verbs");
  else if (foundPowerWords.length >= 1) strengths.push("Some action verbs used — try adding more like 'achieved', 'optimized', 'automated'");
  else improvements.push("Use more action verbs — 'Led', 'Built', 'Implemented', 'Optimized'");

  // Personal pronouns (I vs we)
  const iCount = (lower.match(/\bi\b/g) || []).length;
  const weCount = (lower.match(/\bwe\b/g) || []).length;
  if (iCount > 0 && weCount > 0) strengths.push("Good balance of personal credit (I) and teamwork (we)");
  else if (iCount === 0 && weCount > 0) improvements.push("Make sure to highlight YOUR personal contribution, not just the team's");
  else if (iCount > 3) improvements.push("Too many 'I' — balance with 'we' to show teamwork");

  // Specificity
  const specificTerms = ["specifically", "for example", "such as", "in particular", "specifically", "named", "called"];
  const hasSpecificity = specificTerms.some((t) => lower.includes(t));
  if (hasSpecificity) strengths.push("Good use of specific examples and details");

  // Calculate total score
  const score = Math.min(100, Math.round(
    starTotal * 0.3 +
    (wordCount >= 50 && wordCount <= 250 ? 25 : wordCount >= 30 ? 15 : 5) +
    (hasNumbers ? 15 : 0) +
    (foundPowerWords.length >= 2 ? 15 : foundPowerWords.length >= 1 ? 10 : 0) +
    (strengths.length * 3)
  ));

  return { score, strengths, improvements, starRating };
}

function getStarLabel(pct: number): string {
  if (pct >= 70) return "Strong";
  if (pct >= 40) return "Partial";
  return "Missing";
}

export default function InterviewCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = (cat: string) => {
    setCategory(cat);
    const questions = QUESTION_BANK[cat] || QUESTION_BANK.behavioral;
    const q = questions[0];
    setCurrentQuestion(q);
    setQuestionIndex(0);
    setMessages([{
      role: "coach",
      content: `Welcome to the Interview Coach! Let's practice **${cat}** questions.\n\nHere's your first question:\n\n**${q}**\n\nTake your time, type your answer, and I'll give you detailed feedback with a STAR method analysis.`,
    }]);
  };

  const submitAnswer = () => {
    if (!input.trim() || !category) return;

    const answer = input.trim();
    const userMsg: Message = { role: "user", content: answer };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const feedback = analyzeAnswer(answer, currentQuestion);
      const questions = QUESTION_BANK[category] || QUESTION_BANK.behavioral;
      const nextIndex = (questionIndex + 1) % questions.length;
      setQuestionIndex(nextIndex);
      const nextQ = questions[nextIndex];

      const starBar = (label: string, pct: number) => {
        const color = pct >= 70 ? "bg-green-400" : pct >= 40 ? "bg-yellow-400" : "bg-red-400";
        return `  ${label}: ${getStarLabel(pct)} ${"█".repeat(Math.round(pct / 10))}${"░".repeat(10 - Math.round(pct / 10))} ${pct}%`;
      };

      const coachMsg: Message = {
        role: "coach",
        content: [
          `## Score: ${feedback.score}/100`,
          "",
          "**STAR Analysis:**",
          starBar("Situation", feedback.starRating.situation),
          starBar("Task", feedback.starRating.task),
          starBar("Action", feedback.starRating.action),
          starBar("Result", feedback.starRating.result),
          "",
          feedback.strengths.length > 0 ? `**Strengths:**\n${feedback.strengths.map((s) => `  + ${s}`).join("\n")}` : "",
          feedback.improvements.length > 0 ? `**Improvements:**\n${feedback.improvements.map((i) => `  - ${i}`).join("\n")}` : "",
          "",
          "---",
          "",
          `**Next Question:**\n**${nextQ}**`,
        ].filter(Boolean).join("\n"),
        score: feedback.score,
        tips: feedback.improvements,
      };

      setCurrentQuestion(nextQ);
      setIsTyping(false);
      setMessages((prev) => [...prev, coachMsg]);
    }, 1200);
  };

  const resetSession = () => {
    setMessages([]);
    setCategory(null);
    setCurrentQuestion("");
    setQuestionIndex(0);
  };

  return (
    <div className="space-y-6">
      {!category ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Interview Coach</h2>
          <p className="text-slate-400 text-sm mb-6">Practice interviews with real-time STAR method feedback. Choose a category to start.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {([
              { id: "behavioral", label: "Behavioral", desc: "Tell me about a time...", icon: "🧠" },
              { id: "technical", label: "Technical", desc: "System design, debugging...", icon: "💻" },
              { id: "leadership", label: "Leadership", desc: "Managing teams & decisions...", icon: "👔" },
              { id: "product", label: "Product", desc: "Prioritization, strategy...", icon: "📦" },
            ]).map((cat) => (
              <button
                key={cat.id}
                onClick={() => startSession(cat.id)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-6 text-left transition group"
              >
                <span className="text-3xl block mb-2">{cat.icon}</span>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">{cat.label}</h3>
                <p className="text-slate-400 text-sm">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-800/50 px-6 py-4 flex items-center justify-between border-b border-slate-700">
            <div>
              <h3 className="text-white font-bold">Interview Practice</h3>
              <p className="text-slate-400 text-xs capitalize">{category} • Question {questionIndex + 1}</p>
            </div>
            <button onClick={resetSession} className="text-slate-400 hover:text-white text-sm font-semibold transition">
              End Session
            </button>
          </div>

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === "user"
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-800 text-slate-200"
                }`}>
                  {msg.role === "coach" ? (
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content.split("\n").map((line, j) => {
                        if (line.startsWith("## ")) return <h3 key={j} className="text-lg font-bold text-white mt-2 mb-1">{line.replace("## ", "")}</h3>;
                        if (line.startsWith("**") && line.endsWith("**")) return <p key={j} className="font-bold text-white mt-2">{line.replace(/\*\*/g, "")}</p>;
                        if (line.startsWith("**")) return <p key={j} className="font-bold text-white mt-2">{line.replace(/\*\*/g, "")}</p>;
                        if (line.startsWith("  +")) return <p key={j} className="text-green-400">{line}</p>;
                        if (line.startsWith("  -")) return <p key={j} className="text-yellow-400">{line}</p>;
                        if (line === "---") return <hr key={j} className="border-slate-700 my-2" />;
                        if (line.match(/^\s*Situation:/)) return <p key={j} className="text-cyan-400 font-mono text-xs">{line}</p>;
                        if (line.match(/^\s*Task:/)) return <p key={j} className="text-cyan-400 font-mono text-xs">{line}</p>;
                        if (line.match(/^\s*Action:/)) return <p key={j} className="text-cyan-400 font-mono text-xs">{line}</p>;
                        if (line.match(/^\s*Result:/)) return <p key={j} className="text-cyan-400 font-mono text-xs">{line}</p>;
                        return <span key={j}>{line}{"\n"}</span>;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl px-5 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-700 px-6 py-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
                placeholder="Type your answer... (Shift+Enter for new line)"
                rows={3}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"
              />
              <button
                onClick={submitAnswer}
                disabled={!input.trim() || isTyping}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold px-6 rounded-xl transition self-end text-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
