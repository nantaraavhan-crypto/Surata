import * as cheerio from "cheerio";
import { safeFetch, resolveUrl } from "./utils/fetcher";
import { dedupByTitle } from "./utils/dedup";
import type { GovtJob } from "@/types";

function extractOrg(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("upsc")) return "Union Public Service Commission";
  if (lower.includes("ssc")) return "Staff Selection Commission";
  if (lower.includes("ibps") || lower.includes("bank")) return "Institute of Banking Personnel Selection";
  if (lower.includes("rrb") || lower.includes("railway")) return "Railway Recruitment Board";
  if (lower.includes("upsssc")) return "UP Subordinate Services Selection Commission";
  if (lower.includes("uppsc")) return "UP Public Service Commission";
  if (lower.includes("bpsc")) return "Bihar Public Service Commission";
  if (lower.includes("rpsc") || lower.includes("rajasthan")) return "Rajasthan Public Service Commission";
  if (lower.includes("nta")) return "National Testing Agency";
  if (lower.includes("ntpc")) return "Railway Recruitment Board";
  if (lower.includes("sbi")) return "State Bank of India";
  if (lower.includes("defence") || lower.includes("army") || lower.includes("navy")) return "Ministry of Defence";
  return "Government of India";
}

function extractCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("police") || lower.includes("constable") || lower.includes("si ")) return "Police";
  if (lower.includes("bank") || lower.includes("po ") || lower.includes("clerk")) return "Banking";
  if (lower.includes("railway") || lower.includes("rrb") || lower.includes("ntpc")) return "Railways";
  if (lower.includes("upsc") || lower.includes("ias") || lower.includes("ifs")) return "Civil Services";
  if (lower.includes("ssc")) return "Staff Selection";
  if (lower.includes("medical") || lower.includes("neet") || lower.includes("nursing")) return "Medical";
  if (lower.includes("engineering") || lower.includes("gate") || lower.includes("je ")) return "Engineering";
  if (lower.includes("teaching") || lower.includes("tet") || lower.includes("pgt") || lower.includes("tgt") || lower.includes("teacher")) return "Teaching";
  if (lower.includes("defence") || lower.includes("army") || lower.includes("navy") || lower.includes("air force")) return "Defence";
  if (lower.includes("court") || lower.includes("law") || lower.includes("judicial")) return "Judiciary";
  if (lower.includes("forest") || lower.includes("wildlife")) return "Forest";
  return "Government Jobs";
}

interface GovScraperConfig {
  name: string;
  url: string;
  baseUrl: string;
  selector: string;
  keywordFilter?: (text: string) => boolean;
  organization?: string;
  category?: string;
  limit: number;
  /** Also read titles from the page's JSON-LD ItemList, not just anchors. */
  useJsonLd?: boolean;
}

/**
 * `ssc.nic.in` no longer resolves and `ibps.in` serves a certificate the
 * runtime rejects — both made every cold request wait out a 15s timeout,
 * which is where the multi-second page loads came from. FreeJobAlert
 * aggregates the same notifications and answers in well under a second.
 */
const GOV_SCRAPERS: GovScraperConfig[] = [
  {
    name: "freejobalert-latest",
    url: "https://www.freejobalert.com/latest-notifications/",
    baseUrl: "https://www.freejobalert.com",
    selector: 'a[href*="/articles/"]',
    keywordFilter: (t) =>
      /recruitment|online form|apply online|apply offline|notification|vacancy|posts|jobs/i.test(t),
    limit: 40,
    useJsonLd: true,
  },
  {
    name: "freejobalert-govt",
    url: "https://www.freejobalert.com/government-jobs/",
    baseUrl: "https://www.freejobalert.com",
    selector: 'a[href*="/articles/"]',
    keywordFilter: (t) => /recruitment|online form|apply|vacancy|posts/i.test(t),
    limit: 40,
    useJsonLd: true,
  },
  {
    name: "sarkariresult",
    url: "https://www.sarkariresult.com/",
    baseUrl: "https://www.sarkariresult.com",
    selector: "a",
    keywordFilter: (t) =>
      t.includes("form") || t.includes("recruitment") || t.includes("online form") || t.includes("apply online"),
    limit: 50,
  },
  {
    name: "upsc",
    url: "https://upsc.gov.in/examination-notifications-active",
    baseUrl: "https://upsc.gov.in",
    selector: "a",
    keywordFilter: (t) => /2026|2025|notification|vacancy/i.test(t),
    organization: "Union Public Service Commission",
    category: "Civil Services",
    limit: 25,
  },
  {
    name: "railway",
    url: "https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554",
    baseUrl: "https://indianrailways.gov.in",
    selector: "a",
    keywordFilter: (t) => /2026|2025|recruitment|notification/i.test(t),
    organization: "Railway Recruitment Board",
    category: "Railways",
    limit: 25,
  },
  {
    name: "rac",
    url: "https://rac.gov.in/",
    baseUrl: "https://rac.gov.in",
    selector: "a",
    keywordFilter: (t) => /2026|2025|recruitment|vacancy|notification/i.test(t),
    organization: "Recruitment and Assessment Centre",
    category: "Defence",
    limit: 15,
  },
];

async function scrapeGovSource(config: GovScraperConfig): Promise<GovtJob[]> {
  // Five seconds: the aggregator feeds answer in under a second, and the
  // direct government hosts are unreliable from this runtime — a full timeout
  // wait would be the only thing standing between a visitor and the page.
  const html = await safeFetch(config.url, { timeout: 5000 });
  if (!html) return [];

  const $ = cheerio.load(html);
  const results: GovtJob[] = [];
  const seen = new Set<string>();

  $(config.selector).each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    const href = $(el).attr("href") || "";
    if (text.length <= 15 || !href || text.length > 220) return;
    // Filters are handed lowercased text so a case-sensitive `includes("form")`
    // does not silently drop every title that reads "Online Form" rather than
    // "Online form" — that single mismatch was costing most of this feed.
    if (config.keywordFilter && !config.keywordFilter(text.toLowerCase())) return;

    const url = resolveUrl(href, config.baseUrl);
    if (seen.has(url)) return;
    seen.add(url);

    results.push({
      title: text,
      url,
      organization: config.organization || extractOrg(text),
      category: config.category || extractCategory(text),
      source: new URL(config.baseUrl).hostname,
      scrapedAt: new Date().toISOString(),
    });
  });

  // Some publishers render their listing into JSON-LD instead of anchors —
  // FreeJobAlert's job pages expose article links only as "Get Details", which
  // carries no title at all. The ItemList block has both name and URL.
  if (config.useJsonLd) {
    for (const item of extractItemList(html)) {
      const text = item.name.replace(/\s+/g, " ").trim();
      const href = item.url;
      if (text.length <= 15 || text.length > 220 || !href) continue;
      if (config.keywordFilter && !config.keywordFilter(text.toLowerCase())) continue;

      const url = resolveUrl(href, config.baseUrl);
      if (seen.has(url)) continue;
      seen.add(url);

      results.push({
        title: text,
        url,
        organization: config.organization || extractOrg(text),
        category: config.category || extractCategory(text),
        source: new URL(config.baseUrl).hostname,
        scrapedAt: new Date().toISOString(),
      });
    }
  }

  return results.slice(0, config.limit);
}

/** Reads `ItemList` entries out of JSON-LD, which Next/SEO blocks nest under `@graph`. */
function extractItemList(html: string): { name: string; url: string }[] {
  const out: { name: string; url: string }[] = [];
  const blocks = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1]);
      const nodes: unknown[] = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && Array.isArray((parsed as { "@graph"?: unknown[] })["@graph"])
          ? (parsed as { "@graph": unknown[] })["@graph"]
          : [parsed];

      for (const node of nodes) {
        const list = (node as { itemListElement?: { name?: string; url?: string }[] })
          ?.itemListElement;
        if (!Array.isArray(list)) continue;
        for (const entry of list) {
          if (entry?.name && entry?.url) out.push({ name: entry.name, url: entry.url });
        }
      }
    } catch {
      // A malformed block should not take down the whole source.
    }
  }

  return out;
}

export async function scrapeAllGovtJobs(): Promise<GovtJob[]> {
  const results = await Promise.allSettled(GOV_SCRAPERS.map(scrapeGovSource));

  let allResults: GovtJob[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") allResults.push(...r.value);
  }

  allResults = dedupByTitle(allResults, 70);

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const job of allResults) {
    job.isNew = new Date(job.scrapedAt).getTime() > oneDayAgo;
  }

  return allResults;
}
