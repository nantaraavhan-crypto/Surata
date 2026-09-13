export interface ScrapedItem {
  title: string;
  url: string;
  source: string;
  scrapedAt: string;
}

export interface GovtJob {
  title: string;
  url: string;
  organization: string;
  category: string;
  source: string;
  posts?: string;
  lastDate?: string;
  examDate?: string;
  isNew?: boolean;
  scrapedAt: string;
}

export interface LiveResult {
  title: string;
  url: string;
  organization: string;
  date?: string;
  category?: string;
  status: "live" | "available" | "declared";
  source: string;
  scrapedAt: string;
}

export interface Internship {
  id: string;
  title: string;
  url: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  type: string;
  postedDate: string;
  applyUrl: string;
  source: string;
  scrapedAt: string;
}

export interface Scholarship {
  id: string;
  title: string;
  url: string;
  provider: string;
  amount: string;
  deadline: string;
  eligibility: string;
  category: string;
  applyUrl: string;
  source: string;
  scrapedAt: string;
}

export interface Hackathon {
  id: string;
  title: string;
  url: string;
  organizer: string;
  prize: string;
  deadline: string;
  date: string;
  mode: string;
  source: string;
  scrapedAt: string;
}

export interface ComprehensiveJob {
  id: string;
  title: string;
  url: string;
  organization: string;
  category: string;
  state: string;
  totalPosts: number;
  lastDate: string;
  applyUrl: string;
  source: string;
  scrapedAt: string;
}

export interface SarkariItem {
  title: string;
  url: string;
  source: string;
  date?: string;
  category?: string;
  isNew?: boolean;
  scrapedAt: string;
}

export interface PrivateJob {
  id: string;
  title: string;
  url: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  type: string;
  postedDate: string;
  applyUrl: string;
  source: string;
  scrapedAt: string;
}
