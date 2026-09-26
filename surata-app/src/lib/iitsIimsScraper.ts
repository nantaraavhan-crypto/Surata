import * as cheerio from "cheerio";
import { safeFetch, resolveUrl } from "./utils/fetcher";
import { dedupByTitle } from "./utils/dedup";

export interface IITIIMNews {
  id: string;
  title: string;
  institute: string;
  type: "recruitment" | "admission" | "result" | "news";
  url: string;
  date: string;
  source: string;
  scrapedAt: string;
}

/**
 * Two aggregators, both verified to still return content.
 *
 * The freejobalert IIT/IIM recruitment paths are gone: those URLs now return
 * an empty body while the site root answers normally, so it is the path that
 * died rather than the host — and one entry was a duplicate of another.
 *
 * Every pattern below carries the `i` flag. Without it they matched nothing
 * at all, because titles arrive as "IIT Bombay Faculty Recruitment" while the
 * patterns were written in lower case. That one omission had quietly taken
 * this feed from ~90 items down to 1.
 */
const AGGREGATORS = [
  {
    name: "IIT",
    url: "https://www.facultyplus.com/category/iit/",
    referer: "https://www.facultyplus.com/",
    base: "https://www.facultyplus.com",
    keywords: /iit|iim|faculty|recruitment|professor|associate|assistant professor/i,
  },
  {
    name: "IIM",
    url: "https://www.facultyplus.com/category/iim/",
    referer: "https://www.facultyplus.com/",
    base: "https://www.facultyplus.com",
    keywords: /iit|iim|faculty|recruitment|professor/i,
  },
];

/** A handful of flagship campuses, fetched in parallel with a short timeout. */
const FLAGSHIP_SITES = [
  { name: "IIT Bombay", url: "https://www.iitb.ac.in/en/recruitment" },
  { name: "IIT Delhi", url: "https://home.iitd.ac.in/recruitment" },
  { name: "IIT Madras", url: "https://www.iitm.ac.in/recruitment" },
  { name: "IIT Kanpur", url: "https://www.iitk.ac.in/recruitment" },
  { name: "IIT Kharagpur", url: "https://www.iitkgp.ac.in/recruitment" },
  { name: "IIM Ahmedabad", url: "https://www.iima.ac.in/about-iima/quick-links/careers-iima" },
  { name: "IIM Bangalore", url: "https://www.iimb.ac.in/careers" },
  { name: "IIM Lucknow", url: "https://www.iiml.ac.in/careers" },
];

const RELEVANT = /recruit|faculty|vacanc|non-teaching|group b|group c|admission|entrance|application|registration|result|merit|shortlist|professor|assistant professor|associate professor|dean|director|project officer|jrf|srf|research fellow|phd|walk-in|interview/i;

function detectType(text: string): IITIIMNews["type"] {
  const t = text.toLowerCase();
  if (/recruit|faculty|vacanc|non-teaching|group b|group c|professor/.test(t)) return "recruitment";
  if (/admission|entrance|application|registration/.test(t)) return "admission";
  if (/result|merit|shortlist/.test(t)) return "result";
  return "news";
}

function guessInstitute(text: string, fallback: string): string {
  const m = text.match(/\b(IIM|IIT|IISc|NIT|IIIT)\b\s*([A-Z][a-z]+)?/);
  if (!m) return fallback;
  return m[2] ? `${m[1]} ${m[2]}` : m[1];
}

function extract(
  html: string,
  base: string,
  fallbackInstitute: string,
  keywords: RegExp
): IITIIMNews[] {
  const $ = cheerio.load(html);
  const items: IITIIMNews[] = [];
  const seen = new Set<string>();

  $("a").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    const href = $(el).attr("href") || "";
    // Navigation and footer links are long gone by the length filter, and the
    // keyword check keeps generic items like "Contact us" out of the feed.
    if (text.length < 12 || text.length > 200 || !href) return;
    if (!keywords.test(text)) return;
    if (!RELEVANT.test(text)) return;

    const url = resolveUrl(href, base);
    if (seen.has(url)) return;
    seen.add(url);

    items.push({
      id: `ii-${Buffer.from(url).toString("base64").slice(0, 34)}`,
      title: text,
      institute: guessInstitute(text, fallbackInstitute),
      type: detectType(text),
      url,
      date: "",
      source: new URL(base).hostname,
      scrapedAt: new Date().toISOString(),
    });
  });

  return items;
}

export async function scrapeIITIIMNews(): Promise<{
  news: IITIIMNews[];
  scrapedAt: string;
}> {
  // One parallel wave: no serial batches, so the slowest single host decides
  // the total instead of the sum of every timeout.
  const aggregatorWork = AGGREGATORS.map((a) =>
    safeFetch(a.url, { referer: a.referer, timeout: 5000 }).then((html) =>
      html ? extract(html, a.base, a.name, a.keywords) : []
    )
  );

  const siteWork = FLAGSHIP_SITES.map((site) =>
    safeFetch(site.url, { referer: site.url, timeout: 4000 }).then((html) =>
      html ? extract(html, site.url, site.name, RELEVANT) : []
    )
  );

  const settled = await Promise.allSettled([...aggregatorWork, ...siteWork]);

  let all: IITIIMNews[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  all = dedupByTitle(all, 90);

  return {
    news: all,
    scrapedAt: new Date().toISOString(),
  };
}
