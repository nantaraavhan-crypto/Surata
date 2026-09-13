export interface CurrentAffair {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  source: string;
  important: boolean;
}

export const currentAffairs: CurrentAffair[] = [
  {
    id: "ca-1",
    title: "Union Budget 2026-27 Highlights: Key Announcements for Students",
    category: "Economy",
    description: "Finance Minister announces new education schemes, scholarship increases, and startup funding for youth.",
    date: "2026-07-05",
    source: "PIB",
    important: true,
  },
  {
    id: "ca-2",
    title: "UPSC Releases Calendar 2026-27: All Exam Dates Announced",
    category: "Exams",
    description: "UPSC has released the examination calendar for 2026-27 with dates for CSE, IFS, Engineering Services and more.",
    date: "2026-07-04",
    source: "UPSC",
    important: true,
  },
  {
    id: "ca-3",
    title: "IIT Bombay Placement Season: Record ₹2.5 Crore Package Offered",
    category: "Placements",
    description: "IIT Bombay's placement season sees highest ever international package with 1500+ offers in first week.",
    date: "2026-07-04",
    source: "Economic Times",
    important: false,
  },
  {
    id: "ca-4",
    title: "NEET UG 2026: NTA Announces Exam Center List",
    category: "Medical",
    description: "NTA releases list of exam centers for NEET UG 2026 across 543 cities in India and abroad.",
    date: "2026-07-03",
    source: "NTA",
    important: false,
  },
  {
    id: "ca-5",
    title: "Google Announces 5000 Engineering Roles in India for 2026",
    category: "Tech Jobs",
    description: "Google plans major expansion in India with focus on AI, Cloud, and Android development teams.",
    date: "2026-07-03",
    source: "Times of India",
    important: true,
  },
  {
    id: "ca-6",
    title: "New Education Policy: UGC Updates Multidisciplinary Guidelines",
    category: "Education",
    description: "UGC releases updated guidelines for multidisciplinary education under NEP 2020 implementation.",
    date: "2026-07-02",
    source: "UGC",
    important: false,
  },
  {
    id: "ca-7",
    title: "SSC CGL 2026 Notification Expected This Week",
    category: "Exams",
    description: "Staff Selection Commission likely to release CGL 2026 notification with 8500+ vacancies.",
    date: "2026-07-02",
    source: "SSC",
    important: true,
  },
  {
    id: "ca-8",
    title: "Startup India: ₹50,000 Crore Fund for Student Startups",
    category: "Startup",
    description: "Government announces massive fund to support student-led startups and innovation hubs across universities.",
    date: "2026-07-01",
    source: "LiveMint",
    important: false,
  },
  {
    id: "ca-9",
    title: "GATE 2026 Registration Opens: Apply by October 15",
    category: "Engineering",
    description: "IIT Kanpur opens GATE 2026 registration for M.Tech admissions and PSU recruitment.",
    date: "2026-07-01",
    source: "IIT Kanpur",
    important: true,
  },
  {
    id: "ca-10",
    title: "AI Jobs in India to Grow 40% in 2026: NASSCOM Report",
    category: "Career",
    description: "NASSCOM report shows AI/ML roles are fastest growing job category with 40% YoY growth.",
    date: "2026-06-30",
    source: "Business Standard",
    important: false,
  },
];

export interface ExamCalendar {
  id: string;
  exam: string;
  organization: string;
  formStart: string;
  formEnd: string;
  examDate: string;
  resultDate: string;
  category: string;
}

export const examCalendar: ExamCalendar[] = [
  { id: "ec-1", exam: "UPSC CSE Prelims 2026", organization: "UPSC", formStart: "2026-02-12", formEnd: "2026-03-04", examDate: "2026-06-01", resultDate: "2026-07-15", category: "Civil Services" },
  { id: "ec-2", exam: "SSC CGL 2026", organization: "SSC", formStart: "2026-03-15", formEnd: "2026-04-14", examDate: "2026-07-10", resultDate: "2026-10-01", category: "Staff Selection" },
  { id: "ec-3", exam: "IBPS PO XVI", organization: "IBPS", formStart: "2026-04-20", formEnd: "2026-05-20", examDate: "2026-08-15", resultDate: "2026-11-01", category: "Banking" },
  { id: "ec-4", exam: "RRB NTPC Graduate", organization: "RRB", formStart: "2026-03-01", formEnd: "2026-04-01", examDate: "2026-07-20", resultDate: "2026-10-15", category: "Railways" },
  { id: "ec-5", exam: "GATE 2026", organization: "IIT Kanpur", formStart: "2025-09-01", formEnd: "2025-10-15", examDate: "2026-02-08", resultDate: "2026-03-20", category: "Engineering" },
  { id: "ec-6", exam: "CAT 2026", organization: "IIM Lucknow", formStart: "2026-07-30", formEnd: "2026-09-15", examDate: "2026-11-24", resultDate: "2027-01-10", category: "MBA" },
  { id: "ec-7", exam: "NEET UG 2026", organization: "NTA", formStart: "2026-02-01", formEnd: "2026-03-15", examDate: "2026-05-05", resultDate: "2026-06-20", category: "Medical" },
  { id: "ec-8", exam: "CLAT 2026", organization: "Consortium of NLUs", formStart: "2025-12-01", formEnd: "2026-03-31", examDate: "2026-05-18", resultDate: "2026-06-15", category: "Law" },
  { id: "ec-9", exam: "CUET UG 2026", organization: "NTA", formStart: "2026-02-20", formEnd: "2026-03-30", examDate: "2026-05-15", resultDate: "2026-06-30", category: "University" },
  { id: "ec-10", exam: "UPSC CSE Mains 2026", organization: "UPSC", formStart: "2026-07-01", formEnd: "2026-07-31", examDate: "2026-09-18", resultDate: "2027-01-15", category: "Civil Services" },
];

export interface AdmitCard {
  id: string;
  title: string;
  organization: string;
  examDate: string;
  downloadLink: string;
  status: "available" | "expected" | "declared";
}

export const admitCards: AdmitCard[] = [
  { id: "ac-1", title: "UPSC CSE Prelims 2026", organization: "UPSC", examDate: "2026-06-01", downloadLink: "https://upsconline.nic.in/", status: "declared" },
  { id: "ac-2", title: "SSC CGL 2025 Tier-II", organization: "SSC", examDate: "2026-07-10", downloadLink: "https://ssc.nic.in/", status: "available" },
  { id: "ac-3", title: "IBPS Clerk XII", organization: "IBPS", examDate: "2026-08-15", downloadLink: "https://www.ibps.in/", status: "expected" },
  { id: "ac-4", title: "RRB NTPC CBT-II", organization: "RRB", examDate: "2026-07-20", downloadLink: "https://indianrailways.gov.in/", status: "available" },
  { id: "ac-5", title: "UPTET 2026", organization: "UPBEB", examDate: "2026-07-25", downloadLink: "https://updeled.gov.in/", status: "expected" },
  { id: "ac-6", title: "DSSSB TGT/PGT", organization: "DSSSB", examDate: "2026-08-01", downloadLink: "https://dsssb.delhi.gov.in/", status: "expected" },
];

export interface Result {
  id: string;
  title: string;
  organization: string;
  resultDate: string;
  resultLink: string;
  category: string;
  meritList?: boolean;
}

export const results: Result[] = [
  { id: "res-1", title: "UPSC CSE 2025 Final Result", organization: "UPSC", resultDate: "2026-04-20", resultLink: "https://upsc.gov.in/", category: "Civil Services", meritList: true },
  { id: "res-2", title: "SSC CGL 2025 Tier-I Result", organization: "SSC", resultDate: "2026-06-15", resultLink: "https://ssc.nic.in/", category: "Staff Selection" },
  { id: "res-3", title: "IBPS PO XV Result", organization: "IBPS", resultDate: "2026-05-10", resultLink: "https://www.ibps.in/", category: "Banking", meritList: true },
  { id: "res-4", title: "RRB Group D CEN 08/2024 Result", organization: "RRB", resultDate: "2026-06-25", resultLink: "https://indianrailways.gov.in/", category: "Railways" },
  { id: "res-5", title: "NEET UG 2025 Result", organization: "NTA", resultDate: "2026-06-10", resultLink: "https://neet.nta.ac.in/", category: "Medical", meritList: true },
  { id: "res-6", title: "GATE 2026 Result", organization: "IIT Kanpur", resultDate: "2026-03-20", resultLink: "https://gate.iitk.ac.in/", category: "Engineering" },
];

export interface PreviousPaper {
  id: string;
  exam: string;
  year: string;
  paper: string;
  downloadLink: string;
}

export const previousPapers: PreviousPaper[] = [
  { id: "pp-1", exam: "UPSC CSE Prelims", year: "2025", paper: "General Studies Paper I", downloadLink: "#" },
  { id: "pp-2", exam: "UPSC CSE Prelims", year: "2024", paper: "General Studies Paper I", downloadLink: "#" },
  { id: "pp-3", exam: "SSC CGL", year: "2025", paper: "Tier-I All Shifts", downloadLink: "#" },
  { id: "pp-4", exam: "IBPS PO", year: "2025", paper: "Prelims Question Paper", downloadLink: "#" },
  { id: "pp-5", exam: "GATE CSE", year: "2025", paper: "Computer Science", downloadLink: "#" },
  { id: "pp-6", exam: "CAT", year: "2025", paper: "Slot 1, 2, 3 (All Sections)", downloadLink: "#" },
  { id: "pp-7", exam: "NEET UG", year: "2025", paper: "Physics, Chemistry, Biology", downloadLink: "#" },
  { id: "pp-8", exam: "CLAT", year: "2025", paper: "UG Entrance Paper", downloadLink: "#" },
];

export interface Syllabus {
  id: string;
  exam: string;
  subjects: string[];
  downloadLink: string;
}

export const syllabus: Syllabus[] = [
  { id: "sy-1", exam: "UPSC CSE", subjects: ["Prelims: GS I, CSAT", "Mains: GS I-IV, Optional, Essay"], downloadLink: "#" },
  { id: "sy-2", exam: "SSC CGL", subjects: ["Tier-I: QA, English, GK, Reasoning", "Tier-II: Math, English, GK, Computer"], downloadLink: "#" },
  { id: "sy-3", exam: "IBPS PO", subjects: ["Prelims: English, QA, Reasoning", "Mains: All + Descriptive"], downloadLink: "#" },
  { id: "sy-4", exam: "GATE", subjects: ["Core Subject", "Mathematics", "Aptitude", "General Aptitude"], downloadLink: "#" },
  { id: "sy-5", exam: "CAT", subjects: ["VARC", "DILR", "Quantitative Aptitude"], downloadLink: "#" },
  { id: "sy-6", exam: "NEET UG", subjects: ["Physics", "Chemistry", "Biology (Botany + Zoology)"], downloadLink: "#" },
];

export interface Cutoff {
  id: string;
  exam: string;
  year: string;
  category: string;
  cutoff: string;
  marks?: string;
}

export const cutoffs: Cutoff[] = [
  { id: "co-1", exam: "UPSC CSE Prelims", year: "2025", category: "General", cutoff: "98", marks: "200" },
  { id: "co-2", exam: "UPSC CSE Prelims", year: "2025", category: "OBC", cutoff: "95", marks: "200" },
  { id: "co-3", exam: "UPSC CSE Prelims", year: "2025", category: "SC", cutoff: "88", marks: "200" },
  { id: "co-4", exam: "UPSC CSE Prelims", year: "2025", category: "ST", cutoff: "85", marks: "200" },
  { id: "co-5", exam: "SSC CGL Tier-I", year: "2025", category: "General", cutoff: "145", marks: "200" },
  { id: "co-6", exam: "SSC CGL Tier-I", year: "2025", category: "OBC", cutoff: "135", marks: "200" },
  { id: "co-7", exam: "IBPS PO Prelims", year: "2025", category: "General", cutoff: "62.5", marks: "100" },
  { id: "co-8", exam: "IBPS PO Prelims", year: "2025", category: "OBC", cutoff: "58.75", marks: "100" },
  { id: "co-9", exam: "NEET UG", year: "2025", category: "General", cutoff: "720-137", marks: "720" },
  { id: "co-10", exam: "GATE CSE", year: "2025", category: "General", cutoff: "33", marks: "100" },
];
