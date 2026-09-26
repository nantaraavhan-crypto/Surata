import * as cheerio from "cheerio";
import { safeFetch, resolveUrl } from "./utils/fetcher";
import { dedupByCompositeKey } from "./utils/dedup";
import type { Internship } from "@/types";

function detectType(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("software") || t.includes("developer") || t.includes("engineering") || t.includes("sde")) return "Engineering";
  if (t.includes("data") || t.includes("ml") || t.includes("ai") || t.includes("analytics")) return "Data & AI";
  if (t.includes("marketing") || t.includes("growth") || t.includes("social media")) return "Marketing";
  if (t.includes("finance") || t.includes("accounting")) return "Finance";
  if (t.includes("design") || t.includes("ux") || t.includes("ui")) return "Design";
  if (t.includes("product")) return "Product";
  if (t.includes("business") || t.includes("sales")) return "Business";
  if (t.includes("content") || t.includes("writing")) return "Content";
  if (t.includes("hr") || t.includes("human resource")) return "HR";
  return "General";
}

/**
 * How many listing pages to pull per feed. Page 1 holds 50, the rest 40.
 *
 * Internshala ignores the category segment in the path while logged out —
 * `/internships/marketing/page-2` and `/internships/in-delhi/page-2` return
 * byte-identical results — so the old feed list was fetching the same five
 * documents six times over. Only pagination produces new listings: 20 pages
 * of `/internships` yields ~800 unique internships and 20 pages of
 * `/fresher-jobs` yields ~800 more.
 */
const PAGES = 15;

/**
 * Internshala renders every listing as a `div.individual_internship` with a
 * `job-title-href` anchor, a `company-name` paragraph and a `row-1-item` meta
 * row for location / stipend / duration. Older selectors in this file matched
 * nothing, which is why the feed was always empty.
 */
function parseInternshala(html: string, baseUrl: string): Internship[] {
  const $ = cheerio.load(html);
  const internships: Internship[] = [];

  $("div.individual_internship").each((_, el) => {
    const titleEl = $(el).find("a.job-title-href").first();
    const title = titleEl.text().trim();
    const href = titleEl.attr("href") || "";
    if (!title || title.length < 3 || !href) return;

    const company = $(el).find("p.company-name").first().text().trim();
    const location = $(el).find(".row-1-item.locations a, .row-1-item.locations span").first().text().trim();
    const stipend = $(el).find("span.stipend").first().text().trim();

    const rowItems = $(el).find(".row-1-item").toArray();
    let duration = "";
    for (const item of rowItems) {
      if ($(item).find("span.stipend").length) continue;
      const text = $(item).text().trim();
      if (/month|week|day|year/i.test(text)) {
        duration = text;
        break;
      }
    }

    const applyUrl = resolveUrl(href, baseUrl);

    internships.push({
      id: `is-${Buffer.from(applyUrl).toString("base64").slice(0, 40)}`,
      title,
      url: applyUrl,
      company: company || "Multiple Companies",
      location: location || "Work From Home",
      stipend: stipend || "Stipend Available",
      duration: duration || "Check posting",
      type: detectType(`${title} ${company}`),
      postedDate: "",
      applyUrl,
      source: "internships",
      scrapedAt: new Date().toISOString(),
    });
  });

  return internships;
}

/**
 * Internshala paginates with `/page-N` (query strings are ignored while
 * logged out, which is why the old category list produced the same 50 items
 * over and over).
 */
async function scrapeInternshala(
  path: string,
  pages = PAGES
): Promise<Internship[]> {
  const results: Internship[] = [];

  const htmls = await Promise.all(
    Array.from({ length: pages }, (_, i) =>
      safeFetch(
        i === 0 ? `https://internshala.com${path}` : `https://internshala.com${path}/page-${i + 1}`,
        { referer: "https://internshala.com/", timeout: 8000 }
      )
    )
  );

  for (const html of htmls) {
    if (!html) continue;
    results.push(...parseInternshala(html, "https://internshala.com"));
  }

  return results;
}

/** FreeJobAlert blocks its sub-sections but serves everything from the hub. */
async function scrapeFreeJobAlertInternships(): Promise<Internship[]> {
  const html = await safeFetch("https://www.freejobalert.com/latest-notifications/", {
    referer: "https://www.freejobalert.com/",
  });
  if (!html) return [];

  const $ = cheerio.load(html);
  const internships: Internship[] = [];

  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 10 || !href || !href.includes("/articles/")) return;
    const t = text.toLowerCase();
    if (!t.includes("intern") && !t.includes("trainee") && !t.includes("apprentice")) return;

    const applyUrl = resolveUrl(href, "https://www.freejobalert.com");
    internships.push({
      id: `fja-int-${Buffer.from(applyUrl).toString("base64").slice(0, 40)}`,
      title: text,
      url: applyUrl,
      company: "Government / PSU",
      location: "India",
      stipend: "As per rules",
      duration: "Check posting",
      type: detectType(text),
      postedDate: "",
      applyUrl,
      source: "government",
      scrapedAt: new Date().toISOString(),
    });
  });

  return internships;
}

const INTERNSHALA_FEEDS = ["/internships", "/fresher-jobs"];

export async function scrapeInternships(): Promise<{
  internships: Internship[];
  scrapedAt: string;
}> {
  const results = await Promise.allSettled([
    ...INTERNSHALA_FEEDS.map((path) => scrapeInternshala(path)),
    scrapeFreeJobAlertInternships(),
  ]);

  let all: Internship[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  all = dedupByCompositeKey(all, (item) => `${item.title}|${item.company}`);

  return {
    internships: all,
    scrapedAt: new Date().toISOString(),
  };
}
