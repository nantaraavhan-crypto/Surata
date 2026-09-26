import * as cheerio from "cheerio";
import { dedupByTitle } from "./utils/dedup";

export interface PSUUpdate {
  id: string;
  title: string;
  organization: string;
  category: string;
  url: string;
  date: string;
  source: string;
  scrapedAt: string;
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

async function safeFetch(url: string, referer?: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        ...(referer ? { Referer: referer } : {}),
      },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function detectCategory(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("result") || t.includes("merit")) return "result";
  if (t.includes("admit card") || t.includes("call letter")) return "admit-card";
  if (t.includes("recruit") || t.includes("vacancy") || t.includes("notification") || t.includes("apply"))
    return "recruitment";
  if (t.includes("admission") || t.includes("entrance")) return "admission";
  return "news";
}

function resolveUrl(href: string, base: string): string {
  if (href.startsWith("http")) return href;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalizedBase}${href.startsWith("/") ? "" : "/"}${href}`;
}

interface PSUConfig {
  name: string;
  url: string;
  baseUrl: string;
  linkSelector: string;
  referer?: string;
}

const PSU_SOURCES: PSUConfig[] = [
  {
    name: "DRDO",
    url: "https://www.drdo.gov.in/drdo/recruitment.html",
    baseUrl: "https://www.drdo.gov.in/drdo",
    linkSelector: "a[href]",
    referer: "https://www.drdo.gov.in/",
  },
  {
    name: "ISRO",
    url: "https://www.isro.gov.in/careers",
    baseUrl: "https://www.isro.gov.in",
    linkSelector: "a[href]",
    referer: "https://www.isro.gov.in/",
  },
  {
    name: "BARC",
    url: "https://www.barc.gov.in/careers/",
    baseUrl: "https://www.barc.gov.in",
    linkSelector: "a[href]",
    referer: "https://www.barc.gov.in/",
  },
  {
    name: "ONGC",
    url: "https://ongcindia.com/web/eng/home/careers",
    baseUrl: "https://ongcindia.com",
    linkSelector: "a[href]",
    referer: "https://ongcindia.com/",
  },
  {
    name: "NTPC",
    url: "https://www.ntpc.co.in/careers",
    baseUrl: "https://www.ntpc.co.in",
    linkSelector: "a[href]",
    referer: "https://www.ntpc.co.in/",
  },
  {
    name: "Coal India",
    url: "https://www.coalindia.in/recruitment",
    baseUrl: "https://www.coalindia.in",
    linkSelector: "a[href]",
    referer: "https://www.coalindia.in/",
  },
  {
    name: "BPCL",
    url: "https://www.bpcl.co.in/careers",
    baseUrl: "https://www.bpcl.co.in",
    linkSelector: "a[href]",
    referer: "https://www.bpcl.co.in/",
  },
  {
    name: "HPCL",
    url: "https://www.hindustanpetroleum.com/careers",
    baseUrl: "https://www.hindustanpetroleum.com",
    linkSelector: "a[href]",
    referer: "https://www.hindustanpetroleum.com/",
  },
  {
    name: "GAIL",
    url: "https://www.gailonline.com/careers",
    baseUrl: "https://www.gailonline.com",
    linkSelector: "a[href]",
    referer: "https://www.gailonline.com/",
  },
  {
    name: "BHEL",
    url: "https://www.bhel.com/careers",
    baseUrl: "https://www.bhel.com",
    linkSelector: "a[href]",
    referer: "https://www.bhel.com/",
  },
  {
    name: "SAIL",
    url: "https://www.sail.co.in/careers",
    baseUrl: "https://www.sail.co.in",
    linkSelector: "a[href]",
    referer: "https://www.sail.co.in/",
  },
  {
    name: "BEL",
    url: "https://bel-india.in/careers",
    baseUrl: "https://bel-india.in",
    linkSelector: "a[href]",
    referer: "https://bel-india.in/",
  },
  {
    name: "HAL",
    url: "https://www.hal-india.co.in/careers",
    baseUrl: "https://www.hal-india.co.in",
    linkSelector: "a[href]",
    referer: "https://www.hal-india.co.in/",
  },
  {
    name: "Election Commission",
    url: "https://www.eci.gov.in/careers",
    baseUrl: "https://www.eci.gov.in",
    linkSelector: "a[href]",
    referer: "https://www.eci.gov.in/",
  },
  {
    name: "NIC",
    url: "https://nic.in/careers",
    baseUrl: "https://nic.in",
    linkSelector: "a[href]",
    referer: "https://nic.in/",
  },
  {
    name: "Indian Oil",
    url: "https://iocl.com/careers",
    baseUrl: "https://iocl.com",
    linkSelector: "a[href]",
    referer: "https://iocl.com/",
  },
  {
    name: "Power Grid Corp",
    url: "https://www.powergrid.in/careers",
    baseUrl: "https://www.powergrid.in",
    linkSelector: "a[href]",
    referer: "https://www.powergrid.in/",
  },
  {
    name: "Rail India",
    url: "https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554,1740",
    baseUrl: "https://indianrailways.gov.in",
    linkSelector: "a[href]",
    referer: "https://indianrailways.gov.in/",
  },
];

const RELEVANT_KEYWORDS = [
  "recruitment", "vacancy", "notification", "apply", "result", "admit card",
  "exam", "selection", "interview", "merit", "appointment", "engagement",
  "walk in", "contract", "fellowship", "apprentice", "training",
];

function isRelevantLink(text: string): boolean {
  const lower = text.toLowerCase();
  return RELEVANT_KEYWORDS.some((kw) => lower.includes(kw));
}

async function scrapePSU(config: PSUConfig): Promise<PSUUpdate[]> {
  const html = await safeFetch(config.url, config.referer);
  if (!html) return [];

  const $ = cheerio.load(html);
  const items: PSUUpdate[] = [];
  const now = new Date().toISOString();

  $(config.linkSelector).each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href");

    if (!href || text.length < 10 || text.length > 300) return;
    if (!isRelevantLink(text)) return;

    const url = resolveUrl(href, config.url);
    if (!url.startsWith("http")) return;

    items.push({
      id: `${config.name}-${text.slice(0, 60)}-${now}`,
      title: text.replace(/\s+/g, " ").trim(),
      organization: config.name,
      category: detectCategory(text),
      url,
      date: new Date().toLocaleDateString("en-IN"),
      source: config.name.toLowerCase().replace(/\s+/g, "-"),
      scrapedAt: now,
    });
  });

  return items.slice(0, 20);
}

export async function scrapeAllPSUUpdates(): Promise<PSUUpdate[]> {
  const results = await Promise.allSettled(
    PSU_SOURCES.map((config) => scrapePSU(config))
  );

  const allItems: PSUUpdate[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  return dedupByTitle(allItems, 60);
}
