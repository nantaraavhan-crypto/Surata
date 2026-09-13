"use client";
import { useState } from "react";
import { privateJobs } from "../data/privateJobs";

interface Company {
  name: string;
  rating: number;
  reviews: number;
  hiring: boolean;
  salaryRange: string;
  founded: string;
  headquarters: string;
  employees: string;
  industry: string;
  description: string;
  interviewProcess: string[];
  pros: string[];
  cons: string[];
  openPositions: number;
}

const companies: Company[] = [
  {
    name: "Google",
    rating: 4.3,
    reviews: 25000,
    hiring: true,
    salaryRange: "₹18-50 LPA",
    founded: "1998",
    headquarters: "Mountain View, CA",
    employees: "180,000+",
    industry: "Technology",
    description: "Multinational tech company specializing in Internet-related services and products.",
    interviewProcess: ["Online Assessment", "Technical Phone Screen", "Onsite (4-5 rounds)"],
    pros: ["Great work culture", "Best perks", "Smart colleagues", "Innovation-driven"],
    cons: ["Work-life balance", "High bar for entry", "Bureaucracy in large teams"],
    openPositions: 150,
  },
  {
    name: "Amazon",
    rating: 4.1,
    reviews: 18000,
    hiring: true,
    salaryRange: "₹16-40 LPA",
    founded: "1994",
    headquarters: "Seattle, WA",
    employees: "1,500,000+",
    industry: "E-commerce / Cloud",
    description: "Global leader in e-commerce, cloud computing (AWS), and artificial intelligence.",
    interviewProcess: ["Online Assessment", "Phone Screen", "Onsite Loop (4-5 rounds)"],
    pros: ["Leadership principles", "Career growth", "AWS exposure", "Global impact"],
    cons: ["Fast-paced environment", "Work-life balance", "Performance pressure"],
    openPositions: 200,
  },
  {
    name: "Microsoft",
    rating: 4.4,
    reviews: 22000,
    hiring: true,
    salaryRange: "₹20-38 LPA",
    founded: "1975",
    headquarters: "Redmond, WA",
    employees: "220,000+",
    industry: "Technology",
    description: "Global technology corporation developing software, hardware, and cloud services.",
    interviewProcess: ["Online Assessment", "Technical Phone Screen", "Onsite (3-4 rounds)"],
    pros: ["Work-life balance", "Learning culture", "Diverse projects", "Great benefits"],
    cons: ["Slow decision making", "Stack ranking", "Large organization"],
    openPositions: 120,
  },
  {
    name: "Flipkart",
    rating: 4.0,
    reviews: 12000,
    hiring: true,
    salaryRange: "₹15-28 LPA",
    founded: "2007",
    headquarters: "Bangalore",
    employees: "10,000+",
    industry: "E-commerce",
    description: "India's leading e-commerce marketplace serving 500M+ registered users.",
    interviewProcess: ["Online Assessment", "Technical Interview", "HR Round"],
    pros: ["Startup culture", "Impact at scale", "Learning opportunities", "Good pay"],
    cons: ["Work pressure", "Rapid changes", "Long hours during sales"],
    openPositions: 80,
  },
  {
    name: "Razorpay",
    rating: 4.2,
    reviews: 4500,
    hiring: true,
    salaryRange: "₹14-25 LPA",
    founded: "2014",
    headquarters: "Bangalore",
    employees: "3,000+",
    industry: "Fintech",
    description: "India's leading full-stack financial solutions company.",
    interviewProcess: ["Coding Test", "Technical Interview", "Culture Fit"],
    pros: ["Fintech exposure", "Fast growth", "Innovation", "Great team"],
    cons: ["Startup hustle", "Work-life balance", "Scaling challenges"],
    openPositions: 45,
  },
  {
    name: "TCS",
    rating: 3.5,
    reviews: 45000,
    hiring: true,
    salaryRange: "₹7-12 LPA",
    founded: "1968",
    headquarters: "Mumbai",
    employees: "600,000+",
    industry: "IT Services",
    description: "India's largest IT services company with global presence.",
    interviewProcess: ["Online Assessment", "Technical Interview", "HR Round"],
    pros: ["Job security", "Global exposure", "Training programs", "Large projects"],
    cons: ["Low pay for freshers", "Bench period", "Limited innovation"],
    openPositions: 500,
  },
  {
    name: "Infosys",
    rating: 3.6,
    reviews: 38000,
    hiring: true,
    salaryRange: "₹8-14 LPA",
    founded: "1981",
    headquarters: "Bangalore",
    employees: "300,000+",
    industry: "IT Services",
    description: "Global leader in next-generation digital services and consulting.",
    interviewProcess: ["Online Assessment", "Technical Interview", "HR Round"],
    pros: ["Brand value", "Training (Mysore)", "Global projects", "Career growth"],
    cons: ["Low starting pay", "Bench period", "Limited autonomy"],
    openPositions: 350,
  },
  {
    name: "CRED",
    rating: 4.3,
    reviews: 2800,
    hiring: true,
    salaryRange: "₹18-32 LPA",
    founded: "2018",
    headquarters: "Bangalore",
    employees: "1,500+",
    industry: "Fintech",
    description: "Premium credit card management and fintech platform.",
    interviewProcess: ["Coding Challenge", "Technical Interview", "Culture Round"],
    pros: ["Premium brand", "Tech-first culture", "Great pay", "Innovation"],
    cons: ["High pressure", "Startup culture", "Long hours"],
    openPositions: 30,
  },
  {
    name: "Wipro",
    rating: 3.5,
    reviews: 35000,
    hiring: true,
    salaryRange: "₹6-12 LPA",
    founded: "1945",
    headquarters: "Bangalore",
    employees: "250,000+",
    industry: "IT Services",
    description: "Global information technology, consulting and business process services.",
    interviewProcess: ["Online Assessment", "Technical Interview", "HR Round"],
    pros: ["Job stability", "Global exposure", "Diverse projects"],
    cons: ["Low pay", "Bench period", "Limited innovation"],
    openPositions: 300,
  },
  {
    name: "Meesho",
    rating: 4.0,
    reviews: 3500,
    hiring: true,
    salaryRange: "₹15-28 LPA",
    founded: "2015",
    headquarters: "Bangalore",
    employees: "2,000+",
    industry: "E-commerce",
    description: "India's fastest-growing social commerce platform for 150M+ users.",
    interviewProcess: ["Online Assessment", "Technical Interview", "System Design", "HR"],
    pros: ["Impact at scale", "Growth-stage startup", "Great tech stack"],
    cons: ["Fast-paced", "Work-life balance", "Rapid changes"],
    openPositions: 40,
  },
];

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Company | null>(null);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <div className="px-4 md:px-8 py-12">
        <button onClick={() => setSelected(null)} className="text-cyan-400 text-sm mb-6 hover:underline">
          ← Back to all companies
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-2">{selected.name}</h1>
              <p className="text-slate-400">{selected.industry} • {selected.headquarters}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">★</span>
                <span className="text-2xl font-bold text-white">{selected.rating}</span>
                <span className="text-slate-500">({(selected.reviews / 1000).toFixed(1)}K)</span>
              </div>
              {selected.hiring && (
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold mt-2 inline-block">
                  ✅ Actively Hiring
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-400 mb-6">{selected.description}</p>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800 rounded-xl p-4">
              <span className="text-slate-500 text-xs block">Salary Range</span>
              <span className="text-white font-bold">{selected.salaryRange}</span>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <span className="text-slate-500 text-xs block">Founded</span>
              <span className="text-white font-bold">{selected.founded}</span>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <span className="text-slate-500 text-xs block">Employees</span>
              <span className="text-white font-bold">{selected.employees}</span>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <span className="text-slate-500 text-xs block">Open Positions</span>
              <span className="text-cyan-400 font-bold">{selected.openPositions}+</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">📋 Interview Process</h3>
              <div className="space-y-3">
                {selected.interviewProcess.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="bg-cyan-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="text-slate-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">⭐ Employee Reviews</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-green-400 text-sm font-semibold mb-2">Pros:</p>
                  {selected.pros.map((p, i) => (
                    <p key={i} className="text-slate-400 text-sm">✅ {p}</p>
                  ))}
                </div>
                <div>
                  <p className="text-red-400 text-sm font-semibold mb-2">Cons:</p>
                  {selected.cons.map((c, i) => (
                    <p key={i} className="text-slate-400 text-sm">❌ {c}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">💼 Open Positions at {selected.name}</h3>
            <div className="space-y-3">
              {privateJobs.filter((j) => j.company === selected.name).map((job) => (
                <div key={job.id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">{job.title}</h4>
                    <p className="text-slate-500 text-sm">{job.location} • {job.salary} • {job.workMode}</p>
                  </div>
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded-lg transition text-sm">
                    Apply →
                  </a>
                </div>
              ))}
              {privateJobs.filter((j) => j.company === selected.name).length === 0 && (
                <p className="text-slate-500 text-sm">No current openings. Check back later.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-cyan-400 mb-2">Companies</h1>
        <p className="text-slate-400 text-lg">Research companies, check ratings, and find open positions.</p>
      </div>

      <input
        type="text"
        placeholder="Search companies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-2xl px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 outline-none text-white mb-8"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company) => (
          <button
            key={company.name}
            onClick={() => setSelected(company)}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">{company.industry}</span>
              {company.hiring && (
                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold">Hiring</span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition">{company.name}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400">★ {company.rating}</span>
              <span className="text-slate-500 text-sm">({(company.reviews / 1000).toFixed(1)}K reviews)</span>
            </div>
            <p className="text-slate-500 text-sm mb-3">{company.salaryRange}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{company.employees} employees</span>
              <span className="text-cyan-400 font-semibold">{company.openPositions}+ openings</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
