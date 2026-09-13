import * as cheerio from "cheerio";
import { safeFetch } from "./utils/fetcher";
import { dedupByTitle } from "./utils/dedup";
import type { SarkariItem } from "@/types";

interface SarkariSectionConfig {
  keywords: string[];
  limit?: number;
}

const SECTIONS: Record<string, SarkariSectionConfig> = {
  results: {
    keywords: ["result", "merit list", "score card", "final result"],
  },
  admitCards: {
    keywords: ["admit card", "exam city", "call letter"],
  },
  answerKeys: {
    keywords: ["answer key", "answer sheet", "response sheet"],
  },
  latestJobs: {
    keywords: ["online form", "recruitment", "apply online", "bharti"],
  },
  admissions: {
    keywords: ["admission", "counselling", "registration"],
  },
  syllabus: {
    keywords: ["syllabus", "exam pattern"],
    limit: 50,
  },
};

function extractLinks($: cheerio.CheerioAPI, config: SarkariSectionConfig): SarkariItem[] {
  const items: SarkariItem[] = [];

  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 15 || !href) return;

    const lower = text.toLowerCase();
    const matches = config.keywords.some((kw) => lower.includes(kw));
    if (!matches) return;

    items.push({
      title: text,
      url: href.startsWith("http") ? href : `https://www.sarkariresult.com${href}`,
      source: "sarkariresult.com",
      scrapedAt: new Date().toISOString(),
    });
  });

  return items.slice(0, config.limit ?? 100);
}

async function scrapeSection(sectionName: string): Promise<SarkariItem[]> {
  const html = await safeFetch("https://www.sarkariresult.com/", { revalidate: 1800 });
  if (!html) return [];

  const $ = cheerio.load(html);
  return extractLinks($, SECTIONS[sectionName]);
}

export interface SarkariSections {
  results: SarkariItem[];
  admitCards: SarkariItem[];
  answerKeys: SarkariItem[];
  latestJobs: SarkariItem[];
  admissions: SarkariItem[];
  syllabus: SarkariItem[];
  scrapedAt: string;
}

export async function scrapeAllSarkariSections(): Promise<SarkariSections> {
  const sectionNames = Object.keys(SECTIONS);
  const results = await Promise.allSettled(sectionNames.map(scrapeSection));

  const data: Record<string, SarkariItem[]> = {};
  sectionNames.forEach((name, i) => {
    const result = results[i];
    data[name] = result.status === "fulfilled" ? dedupByTitle(result.value) : [];
  });

  return {
    results: data.results || [],
    admitCards: data.admitCards || [],
    answerKeys: data.answerKeys || [],
    latestJobs: data.latestJobs || [],
    admissions: data.admissions || [],
    syllabus: data.syllabus || [],
    scrapedAt: new Date().toISOString(),
  };
}
