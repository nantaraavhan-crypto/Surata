import * as cheerio from "cheerio";
import { safeFetch } from "./utils/fetcher";
import { dedupByTitle } from "./utils/dedup";
import type { GovtJob } from "@/types";

function extractOrg(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("upsc")) return "Union Public Service Commission";
  if (lower.includes("ssc")) return "Staff Selection Commission";
  if (lower.includes("ibps")) return "Institute of Banking Personnel Selection";
  if (lower.includes("rrb") || lower.includes("railway")) return "Railway Recruitment Board";
  if (lower.includes("upsssc")) return "UP Subordinate Services Selection Commission";
  if (lower.includes("uppsc")) return "UP Public Service Commission";
  if (lower.includes("bpsc")) return "Bihar Public Service Commission";
  if (lower.includes("rpsc")) return "Rajasthan Public Service Commission";
  if (lower.includes("nta")) return "National Testing Agency";
  if (lower.includes("ntpc")) return "Railway Recruitment Board";
  return "Government of India";
}

function extractCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("police") || lower.includes("constable") || lower.includes("si "))
    return "Police";
  if (lower.includes("bank") || lower.includes("po ") || lower.includes("clerk"))
    return "Banking";
  if (lower.includes("railway") || lower.includes("rrb") || lower.includes("ntpc"))
    return "Railways";
  if (lower.includes("upsc") || lower.includes("ias") || lower.includes("ifs"))
    return "Civil Services";
  if (lower.includes("ssc")) return "Staff Selection";
  if (lower.includes("medical") || lower.includes("neet")) return "Medical";
  if (lower.includes("engineering") || lower.includes("gate")) return "Engineering";
  if (lower.includes("teaching") || lower.includes("tet") || lower.includes("pgt") || lower.includes("tgt"))
    return "Teaching";
  if (lower.includes("defence") || lower.includes("army") || lower.includes("navy") || lower.includes("air force"))
    return "Defence";
  return "Government Jobs";
}

interface GovScraperConfig {
  name: string;
  url: string;
  baseUrl: string;
  selector?: string;
  keywordFilter?: (text: string) => boolean;
  organization: string;
  category: string;
  limit?: number;
}

const GOV_SCRAPERS: GovScraperConfig[] = [
  {
    name: "sarkariresult",
    url: "https://www.sarkariresult.com/",
    baseUrl: "https://www.sarkariresult.com",
    keywordFilter: (t) =>
      t.includes("form") || t.includes("recruitment") || t.includes("online form") || t.includes("apply online"),
    organization: "Government of India",
    category: "Government Jobs",
    limit: 50,
  },
  {
    name: "ssc",
    url: "https://ssc.nic.in/",
    baseUrl: "https://ssc.nic.in",
    selector: "table tr, .notification, a",
    keywordFilter: (t) => t.includes("2026") || t.includes("2025"),
    organization: "Staff Selection Commission",
    category: "Staff Selection",
    limit: 30,
  },
  {
    name: "ibps",
    url: "https://www.ibps.in/",
    baseUrl: "https://www.ibps.in",
    keywordFilter: (t) =>
      t.includes("po") || t.includes("clerk") || t.includes("specialist") || t.includes("recruitment"),
    organization: "Institute of Banking Personnel Selection",
    category: "Banking",
    limit: 20,
  },
  {
    name: "upsc",
    url: "https://upsc.gov.in/examination-notifications-active",
    baseUrl: "https://upsc.gov.in",
    keywordFilter: (t) => t.includes("2026") || t.includes("2025"),
    organization: "Union Public Service Commission",
    category: "Civil Services",
    limit: 20,
  },
  {
    name: "railway",
    url: "https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554",
    baseUrl: "https://indianrailways.gov.in",
    keywordFilter: (t) => t.includes("2026") || t.includes("2025"),
    organization: "Railway Recruitment Board",
    category: "Railways",
    limit: 30,
  },
];

async function scrapeGovSource(config: GovScraperConfig): Promise<GovtJob[]> {
  const html = await safeFetch(config.url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const results: GovtJob[] = [];
  const selector = config.selector || "a";

  $(selector).each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length <= 15) return;
    if (config.keywordFilter && !config.keywordFilter(text)) return;

    results.push({
      title: text,
      url: href.startsWith("http") ? href : `${config.baseUrl}${href}`,
      organization: config.name === "sarkariresult" ? extractOrg(text) : config.organization,
      category: config.name === "sarkariresult" ? extractCategory(text) : config.category,
      source: new URL(config.baseUrl).hostname,
      scrapedAt: new Date().toISOString(),
    });
  });

  return results.slice(0, config.limit ?? 30);
}

export async function scrapeAllGovtJobs(): Promise<GovtJob[]> {
  const results = await Promise.allSettled(GOV_SCRAPERS.map(scrapeGovSource));

  let allResults: GovtJob[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") allResults.push(...r.value);
  }

  allResults = dedupByTitle(allResults, 50);

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const job of allResults) {
    job.isNew = new Date(job.scrapedAt).getTime() > oneDayAgo;
  }

  return allResults;
}
