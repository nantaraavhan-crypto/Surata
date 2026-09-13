import * as cheerio from "cheerio";
import { safeFetch } from "./utils/fetcher";
import { dedupByTitle } from "./utils/dedup";
import type { LiveResult } from "@/types";

interface LiveScraperConfig {
  name: string;
  url: string;
  baseUrl: string;
  selector: string;
  keywordFilter: (text: string) => boolean;
  organization: string;
  category: string;
  status: LiveResult["status"];
}

function makeLiveItem(
  config: LiveScraperConfig,
  title: string,
  href: string
): LiveResult {
  return {
    title,
    url: href.startsWith("http") ? href : `${config.baseUrl}${href}`,
    organization: config.organization,
    category: config.category,
    status: config.status,
    source: new URL(config.baseUrl).hostname,
    scrapedAt: new Date().toISOString(),
  };
}

async function scrapeFromConfig(config: LiveScraperConfig): Promise<LiveResult[]> {
  const html = await safeFetch(config.url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const items: LiveResult[] = [];

  $(config.selector).each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length <= 10 || !href || !config.keywordFilter(text)) return;
    items.push(makeLiveItem(config, text, href));
  });

  return items.slice(0, 30);
}

const SSC_CONFIGS: LiveScraperConfig[] = [
  {
    name: "ssc-results",
    url: "https://ssc.nic.in/Portal/Results",
    baseUrl: "https://ssc.nic.in",
    selector: "table tr, .result-item, a",
    keywordFilter: (t) => t.toLowerCase().includes("result") || t.toLowerCase().includes("merit"),
    organization: "SSC",
    category: "Staff Selection",
    status: "declared",
  },
  {
    name: "ssc-admit-cards",
    url: "https://ssc.nic.in/Portal/AdmitCard",
    baseUrl: "https://ssc.nic.in",
    selector: "table tr, a",
    keywordFilter: (t) => t.toLowerCase().includes("admit card") || t.toLowerCase().includes("exam city"),
    organization: "SSC",
    category: "Staff Selection",
    status: "available",
  },
  {
    name: "ssc-answer-keys",
    url: "https://ssc.nic.in/Portal/AnswerKey",
    baseUrl: "https://ssc.nic.in",
    selector: "table tr, a",
    keywordFilter: (t) => t.toLowerCase().includes("answer"),
    organization: "SSC",
    category: "Staff Selection",
    status: "declared",
  },
];

const IBPS_CONFIGS: LiveScraperConfig[] = [
  {
    name: "ibps-results",
    url: "https://www.ibps.in/webcontent/results",
    baseUrl: "https://www.ibps.in",
    selector: "a",
    keywordFilter: (t) => t.toLowerCase().includes("result") || t.toLowerCase().includes("provisional allotment"),
    organization: "IBPS",
    category: "Banking",
    status: "declared",
  },
  {
    name: "ibps-admit-cards",
    url: "https://www.ibps.in/webcontent/admitcard",
    baseUrl: "https://www.ibps.in",
    selector: "a",
    keywordFilter: (t) => t.toLowerCase().includes("call letter") || t.toLowerCase().includes("admit card"),
    organization: "IBPS",
    category: "Banking",
    status: "available",
  },
];

const UPSC_CONFIGS: LiveScraperConfig[] = [
  {
    name: "upsc-results",
    url: "https://upsc.gov.in/results-active",
    baseUrl: "https://upsc.gov.in",
    selector: "a",
    keywordFilter: (t) =>
      t.toLowerCase().includes("result") || t.toLowerCase().includes("final") || t.toLowerCase().includes("recommend"),
    organization: "UPSC",
    category: "Civil Services",
    status: "declared",
  },
  {
    name: "upsc-admit-cards",
    url: "https://upsc.gov.in/admit-cards",
    baseUrl: "https://upsc.gov.in",
    selector: "a",
    keywordFilter: (t) => t.toLowerCase().includes("admit card") || t.toLowerCase().includes("e-summon"),
    organization: "UPSC",
    category: "Civil Services",
    status: "available",
  },
];

const RAILWAY_CONFIGS: LiveScraperConfig[] = [
  {
    name: "railway-results",
    url: "https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554",
    baseUrl: "https://indianrailways.gov.in",
    selector: "a",
    keywordFilter: (t) =>
      t.toLowerCase().includes("result") || t.toLowerCase().includes("score card") || t.toLowerCase().includes("cbt"),
    organization: "RRB",
    category: "Railways",
    status: "declared",
  },
  {
    name: "railway-admit-cards",
    url: "https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,558",
    baseUrl: "https://indianrailways.gov.in",
    selector: "a",
    keywordFilter: (t) =>
      t.toLowerCase().includes("admit card") || t.toLowerCase().includes("exam city") || t.toLowerCase().includes("e-call"),
    organization: "RRB",
    category: "Railways",
    status: "available",
  },
];

function categorizeSarkariLink(text: string): { category: string; status: LiveResult["status"] } | null {
  const t = text.toLowerCase();
  if (t.includes("result") || t.includes("merit")) return { category: "Result", status: "declared" };
  if (t.includes("admit card") || t.includes("exam city")) return { category: "Admit Card", status: "available" };
  if (t.includes("answer key") || t.includes("response sheet")) return { category: "Answer Key", status: "declared" };
  if (t.includes("online form") || t.includes("recruitment")) return { category: "Job", status: "live" };
  return null;
}

async function scrapeSarkariResultAll() {
  const html = await safeFetch("https://www.sarkariresult.com/");
  if (!html) return { results: [], admitCards: [], answerKeys: [], latestJobs: [] };

  const $ = cheerio.load(html);
  const buckets: Record<string, LiveResult[]> = {
    results: [],
    admitCards: [],
    answerKeys: [],
    latestJobs: [],
  };

  const bucketMap: Record<string, keyof typeof buckets> = {
    Result: "results",
    "Admit Card": "admitCards",
    "Answer Key": "answerKeys",
    Job: "latestJobs",
  };

  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 15 || !href) return;

    const categorization = categorizeSarkariLink(text);
    if (!categorization) return;

    const url = href.startsWith("http") ? href : `https://www.sarkariresult.com${href}`;
    const bucket = bucketMap[categorization.category];

    buckets[bucket].push({
      title: text,
      url,
      organization: "Government",
      category: categorization.category,
      status: categorization.status,
      source: "sarkariresult.com",
      scrapedAt: new Date().toISOString(),
    });
  });

  return {
    results: buckets.results.slice(0, 50),
    admitCards: buckets.admitCards.slice(0, 50),
    answerKeys: buckets.answerKeys.slice(0, 50),
    latestJobs: buckets.latestJobs.slice(0, 50),
  };
}

export async function scrapeEverything(): Promise<{
  results: LiveResult[];
  admitCards: LiveResult[];
  answerKeys: LiveResult[];
  latestJobs: LiveResult[];
  scrapedAt: string;
}> {
  const allConfigs = [...SSC_CONFIGS, ...IBPS_CONFIGS, ...UPSC_CONFIGS, ...RAILWAY_CONFIGS];

  const [orgResults, sarkari] = await Promise.allSettled([
    Promise.all(allConfigs.map(scrapeFromConfig)),
    scrapeSarkariResultAll(),
  ]);

  const allResults: LiveResult[] = [];
  const allAdmitCards: LiveResult[] = [];
  const allAnswerKeys: LiveResult[] = [];
  const allJobs: LiveResult[] = [];

  if (orgResults.status === "fulfilled") {
    for (const items of orgResults.value) {
      for (const item of items) {
        if (item.status === "declared") allResults.push(item);
        else if (item.status === "available") allAdmitCards.push(item);
      }
    }
  }

  if (sarkari.status === "fulfilled") {
    allResults.push(...sarkari.value.results);
    allAdmitCards.push(...sarkari.value.admitCards);
    allAnswerKeys.push(...sarkari.value.answerKeys);
    allJobs.push(...sarkari.value.latestJobs);
  }

  return {
    results: dedupByTitle(allResults),
    admitCards: dedupByTitle(allAdmitCards),
    answerKeys: dedupByTitle(allAnswerKeys),
    latestJobs: dedupByTitle(allJobs),
    scrapedAt: new Date().toISOString(),
  };
}
