import * as cheerio from "cheerio";
import { safeFetch, resolveUrl } from "./utils/fetcher";
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
  limit?: number;
}

function makeLiveItem(
  config: LiveScraperConfig,
  title: string,
  href: string
): LiveResult {
  return {
    title,
    url: resolveUrl(href, config.baseUrl),
    organization: config.organization,
    category: config.category,
    status: config.status,
    source: new URL(config.baseUrl).hostname,
    scrapedAt: new Date().toISOString(),
  };
}

async function scrapeFromConfig(config: LiveScraperConfig): Promise<LiveResult[]> {
  const html = await safeFetch(config.url, { timeout: 5000 });
  if (!html) return [];

  const $ = cheerio.load(html);
  const items: LiveResult[] = [];
  const seen = new Set<string>();

  $(config.selector).each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    const href = $(el).attr("href") || "";
    if (text.length <= 12 || text.length > 200 || !href) return;
    if (!config.keywordFilter(text.toLowerCase())) return;

    const item = makeLiveItem(config, text, href);
    if (seen.has(item.url)) return;
    seen.add(item.url);
    items.push(item);
  });

  return items.slice(0, config.limit ?? 40);
}

/**
 * `ssc.nic.in` stopped resolving and `ibps.in` presents a certificate the
 * runtime rejects; each attempt burned the full timeout, which is why this
 * route took over ten seconds. FreeJobAlert carries the same notifications
 * with clean titles, so the sections below replace those hosts outright.
 */
const FJA = "https://www.freejobalert.com";
const FJA_BASE = "https://www.freejobalert.com";
const ARTICLE = 'a[href*="/articles/"]';

const RESULT_CONFIGS: LiveScraperConfig[] = [
  {
    name: "fja-results",
    url: `${FJA}/exam-results/`,
    baseUrl: FJA_BASE,
    selector: ARTICLE,
    keywordFilter: (t) => /result|merit list|score card|provisional|selected list/i.test(t),
    organization: "Government of India",
    category: "Result",
    status: "declared",
    limit: 50,
  },
  {
    name: "fja-upsc-results",
    url: `${FJA}/exam-results/`,
    baseUrl: FJA_BASE,
    selector: ARTICLE,
    keywordFilter: (t) => /upsc|ias|ifs|civil/i.test(t),
    organization: "UPSC",
    category: "Civil Services",
    status: "declared",
    limit: 20,
  },
  {
    name: "upsc-results",
    url: "https://upsc.gov.in/results-active",
    baseUrl: "https://upsc.gov.in",
    selector: "a",
    keywordFilter: (t) => /result|final|recommend/i.test(t),
    organization: "UPSC",
    category: "Civil Services",
    status: "declared",
    limit: 25,
  },
  {
    name: "railway-results",
    url: "https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554",
    baseUrl: "https://indianrailways.gov.in",
    selector: "a",
    keywordFilter: (t) => /result|score card|cbt|merit/i.test(t),
    organization: "RRB",
    category: "Railways",
    status: "declared",
    limit: 25,
  },
];

const ADMIT_CARD_CONFIGS: LiveScraperConfig[] = [
  {
    name: "fja-admit",
    url: `${FJA}/admit-card/`,
    baseUrl: FJA_BASE,
    selector: ARTICLE,
    keywordFilter: (t) => /admit card|exam city|call letter|e admit|hall ticket/i.test(t),
    organization: "Government of India",
    category: "Admit Card",
    status: "available",
    limit: 50,
  },
  {
    name: "upsc-admit",
    url: "https://upsc.gov.in/admit-cards",
    baseUrl: "https://upsc.gov.in",
    selector: "a",
    keywordFilter: (t) => /admit card|e-summon|e summon/i.test(t),
    organization: "UPSC",
    category: "Civil Services",
    status: "available",
    limit: 25,
  },
  {
    name: "railway-admit",
    url: "https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,558",
    baseUrl: "https://indianrailways.gov.in",
    selector: "a",
    keywordFilter: (t) => /admit card|exam city|e-call|e call/i.test(t),
    organization: "RRB",
    category: "Railways",
    status: "available",
    limit: 25,
  },
];

const ANSWER_KEY_CONFIGS: LiveScraperConfig[] = [
  {
    name: "fja-answer-key",
    url: `${FJA}/answer-key/`,
    baseUrl: FJA_BASE,
    selector: ARTICLE,
    keywordFilter: (t) => /answer key|response sheet|answer sheet|key answer/i.test(t),
    organization: "Government of India",
    category: "Answer Key",
    status: "declared",
    limit: 50,
  },
];

const JOB_CONFIGS: LiveScraperConfig[] = [
  {
    name: "fja-jobs",
    url: `${FJA}/government-jobs/`,
    baseUrl: FJA_BASE,
    selector: ARTICLE,
    keywordFilter: (t) => /recruitment|online form|apply|vacancy|posts/i.test(t),
    organization: "Government of India",
    category: "Job",
    status: "live",
    limit: 50,
  },
  {
    name: "fja-latest-jobs",
    url: `${FJA}/latest-notifications/`,
    baseUrl: FJA_BASE,
    selector: ARTICLE,
    keywordFilter: (t) => /recruitment|online form|apply online|apply offline|vacancy/i.test(t),
    organization: "Government of India",
    category: "Job",
    status: "live",
    limit: 50,
  },
];

function categorizeSarkariLink(
  text: string
): { category: string; status: LiveResult["status"] } | null {
  const t = text.toLowerCase();
  if (t.includes("result") || t.includes("merit")) return { category: "Result", status: "declared" };
  if (t.includes("admit card") || t.includes("exam city")) return { category: "Admit Card", status: "available" };
  if (t.includes("answer key") || t.includes("response sheet")) return { category: "Answer Key", status: "declared" };
  if (t.includes("online form") || t.includes("recruitment")) return { category: "Job", status: "live" };
  return null;
}

async function scrapeSarkariResultAll() {
  const html = await safeFetch("https://www.sarkariresult.com/", { timeout: 5000 });
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
    const text = $(el).text().replace(/\s+/g, " ").trim();
    const href = $(el).attr("href") || "";
    if (text.length < 15 || !href || text.length > 200) return;

    const categorization = categorizeSarkariLink(text);
    if (!categorization) return;

    const url = resolveUrl(href, "https://www.sarkariresult.com");
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

async function collect(configs: LiveScraperConfig[]): Promise<LiveResult[]> {
  const settled = await Promise.allSettled(configs.map(scrapeFromConfig));
  const all: LiveResult[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  return dedupByTitle(all, 80);
}

export async function scrapeEverything(): Promise<{
  results: LiveResult[];
  admitCards: LiveResult[];
  answerKeys: LiveResult[];
  latestJobs: LiveResult[];
  scrapedAt: string;
}> {
  const [results, admitCards, answerKeys, latestJobs, sarkari] =
    await Promise.all([
      collect(RESULT_CONFIGS),
      collect(ADMIT_CARD_CONFIGS),
      collect(ANSWER_KEY_CONFIGS),
      collect(JOB_CONFIGS),
      scrapeSarkariResultAll().catch(() => ({
        results: [],
        admitCards: [],
        answerKeys: [],
        latestJobs: [],
      })),
    ]);

  return {
    results: dedupByTitle([...results, ...sarkari.results], 80),
    admitCards: dedupByTitle([...admitCards, ...sarkari.admitCards], 80),
    answerKeys: dedupByTitle([...answerKeys, ...sarkari.answerKeys], 80),
    latestJobs: dedupByTitle([...latestJobs, ...sarkari.latestJobs], 80),
    scrapedAt: new Date().toISOString(),
  };
}
