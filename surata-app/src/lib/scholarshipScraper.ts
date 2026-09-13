import * as cheerio from "cheerio";
import { safeFetch, resolveUrl } from "./utils/fetcher";
import { dedupByTitle } from "./utils/dedup";
import type { Scholarship } from "@/types";

function detectCategory(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("sc ") || t.includes("st ") || t.includes("sc/st") || t.includes("schedule caste") || t.includes("schedule tribe"))
    return "SC/ST";
  if (t.includes("obc") || t.includes("other backward")) return "OBC";
  if (t.includes("minority") || t.includes("muslim") || t.includes("christian") || t.includes("sikh"))
    return "Minority";
  if (t.includes("ews") || t.includes("economically weaker")) return "EWS";
  if (t.includes("pwd") || t.includes("disabled") || t.includes("divyang")) return "PWD";
  if (t.includes("girl") || t.includes("women") || t.includes("female")) return "Women";
  if (t.includes("merit") || t.includes("topper")) return "Merit Based";
  if (t.includes("need") || t.includes("financial")) return "Need Based";
  if (t.includes("engineering") || t.includes("technical") || t.includes("btech"))
    return "Engineering";
  if (t.includes("medical") || t.includes("mbbs")) return "Medical";
  if (t.includes("phd") || t.includes("research") || t.includes("doctoral")) return "Research";
  if (t.includes("post grad") || t.includes("pg ") || t.includes("m.sc") || t.includes("msc"))
    return "Post Graduate";
  if (t.includes("under grad") || t.includes("ug ") || t.includes("bachelor"))
    return "Under Graduate";
  return "General";
}

async function scrapeScholarshipsGovIn(): Promise<Scholarship[]> {
  const html = await safeFetch("https://scholarships.gov.in/", {
    referer: "https://scholarships.gov.in/",
  });
  if (!html) return [];

  const $ = cheerio.load(html);
  const scholarships: Scholarship[] = [];

  $("a, tr, li").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 10) return;
    const t = text.toLowerCase();
    if (!t.includes("scholarship") && !t.includes("fellowship") && !t.includes("grant") && !t.includes("award"))
      return;

    const applyUrl = resolveUrl(href, "https://scholarships.gov.in");
    scholarships.push({
      id: `scholarships-gov-${Buffer.from(applyUrl).toString("base64").slice(0, 40)}`,
      title: text.slice(0, 200),
      url: applyUrl,
      provider: "Government of India",
      amount: "Check notification",
      deadline: "Check website",
      eligibility: "Check notification",
      category: detectCategory(text),
      applyUrl,
      source: "scholarships.gov.in",
      scrapedAt: new Date().toISOString(),
    });
  });

  return scholarships;
}

async function scrapeBuddy4Study(): Promise<Scholarship[]> {
  const html = await safeFetch("https://www.buddy4study.com/scholarships", {
    referer: "https://www.buddy4study.com/",
  });
  if (!html) return [];

  const $ = cheerio.load(html);
  const scholarships: Scholarship[] = [];

  $("div.scholarship-card, .scholarship-item, .card").each((_, el) => {
    const titleEl = $(el).find("h3 a, h4 a, .scholarship-name a, a.scholarship-title").first();
    const title = titleEl.text().trim();
    const href = titleEl.attr("href") || "";
    if (!title || title.length < 5) return;

    const provider = $(el).find(".provider, .offered-by, .scholarship-provider").first().text().trim();
    const amount = $(el).find(".amount, .scholarship-amount, .prize").first().text().trim();
    const deadline = $(el).find(".deadline, .last-date, .date").first().text().trim();
    const applyUrl = resolveUrl(href, "https://www.buddy4study.com");

    scholarships.push({
      id: `b4s-${Buffer.from(applyUrl).toString("base64").slice(0, 40)}`,
      title,
      url: applyUrl,
      provider: provider || "Various Organizations",
      amount: amount || "Check notification",
      deadline: deadline || "Check website",
      eligibility: "Check notification",
      category: detectCategory(title),
      applyUrl,
      source: "buddy4study.com",
      scrapedAt: new Date().toISOString(),
    });
  });

  return scholarships;
}

async function scrapeFreeJobAlertScholarships(): Promise<Scholarship[]> {
  const html = await safeFetch("https://www.freejobalert.com/scholarships/", {
    referer: "https://www.freejobalert.com/",
  });
  if (!html) return [];

  const $ = cheerio.load(html);
  const scholarships: Scholarship[] = [];

  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 10 || !href) return;
    const t = text.toLowerCase();
    if (!t.includes("scholarship") && !t.includes("fellowship") && !t.includes("grant")) return;

    const applyUrl = resolveUrl(href, "https://www.freejobalert.com");
    scholarships.push({
      id: `fja-sch-${Buffer.from(applyUrl).toString("base64").slice(0, 40)}`,
      title: text,
      url: applyUrl,
      provider: "Various",
      amount: "Check notification",
      deadline: "Check website",
      eligibility: "Check notification",
      category: detectCategory(text),
      applyUrl,
      source: "freejobalert.com",
      scrapedAt: new Date().toISOString(),
    });
  });

  return scholarships;
}

async function scrapeAICTEScholarships(): Promise<Scholarship[]> {
  const html = await safeFetch("https://www.aicte-india.org/schemes/scholarships", {
    referer: "https://www.aicte-india.org/",
  });
  if (!html) return [];

  const $ = cheerio.load(html);
  const scholarships: Scholarship[] = [];

  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 10 || !href) return;
    const t = text.toLowerCase();
    if (!t.includes("scholarship") && !t.includes("fee reimbursement") && !t.includes("pragati") && !t.includes("saksham"))
      return;

    const applyUrl = resolveUrl(href, "https://www.aicte-india.org");
    scholarships.push({
      id: `aicte-sch-${Buffer.from(applyUrl).toString("base64").slice(0, 40)}`,
      title: text,
      url: applyUrl,
      provider: "AICTE",
      amount: "Check notification",
      deadline: "Check website",
      eligibility: "Engineering/Technical students",
      category: "Engineering",
      applyUrl,
      source: "aicte-india.org",
      scrapedAt: new Date().toISOString(),
    });
  });

  return scholarships;
}

export async function scrapeScholarships(): Promise<{
  scholarships: Scholarship[];
  scrapedAt: string;
}> {
  const results = await Promise.allSettled([
    scrapeScholarshipsGovIn(),
    scrapeBuddy4Study(),
    scrapeFreeJobAlertScholarships(),
    scrapeAICTEScholarships(),
  ]);

  let all: Scholarship[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  all = dedupByTitle(all);

  return {
    scholarships: all,
    scrapedAt: new Date().toISOString(),
  };
}
