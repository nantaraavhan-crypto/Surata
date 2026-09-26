import * as cheerio from "cheerio";
import { safeFetch, resolveUrl } from "./utils/fetcher";
import { dedupByTitle } from "./utils/dedup";
import type { Scholarship } from "@/types";

const APPLY_URL = "https://scholarships.gov.in/ApplicationForm/";

function detectCategory(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("sc/st") || t.includes("sc ") || t.includes("st ") || t.includes("schedule caste") || t.includes("schedule tribe")) return "SC/ST";
  if (t.includes("obc") || t.includes("backward")) return "OBC";
  if (t.includes("minority") || t.includes("muslim") || t.includes("christian") || t.includes("sikh")) return "Minority";
  if (t.includes("ews") || t.includes("economically weaker")) return "EWS";
  if (t.includes("pwd") || t.includes("disabled") || t.includes("specially abled") || t.includes("divyang")) return "PWD";
  if (t.includes("girl") || t.includes("women") || t.includes("female")) return "Women";
  if (t.includes("merit")) return "Merit Based";
  if (t.includes("welfare") || t.includes("need") || t.includes("financial")) return "Need Based";
  if (t.includes("engineering") || t.includes("technical") || t.includes("btech") || t.includes("polytechnic") || t.includes("diploma")) return "Engineering";
  if (t.includes("medical") || t.includes("mbbs")) return "Medical";
  if (t.includes("phd") || t.includes("research") || t.includes("post graduate") || t.includes("postgraduate")) return "Research";
  if (t.includes("pre matric") || t.includes("pre-matric") || t.includes("class 1")) return "School";
  if (t.includes("post matric") || t.includes("post-matric") || t.includes("graduation") || t.includes("college")) return "Under Graduate";
  return "General";
}

function extractDate(spans: string[], kind: "open" | "close"): string {
  for (const span of spans) {
    const isStudentWindow = /student application/i.test(span);
    const match = span.match(/(\d{2}-\d{2}-\d{4})/);
    if (!match) continue;
    if (kind === "close" && isStudentWindow) return match[1];
    if (kind === "close" && !isStudentWindow) continue;
    if (kind === "open") return match[1];
  }
  if (kind === "close") {
    for (const span of spans) {
      const match = span.match(/(\d{2}-\d{2}-\d{4})/);
      if (match) return match[1];
    }
  }
  return "";
}

function toISO(ddmmyyyy: string): string {
  const m = ddmmyyyy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}

/**
 * The National Scholarship Portal groups every live scheme into a ministry
 * accordion on `/All-Scholarships`. Each scheme row carries its own opening
 * date, student application deadline and verification windows — real data the
 * previous scrapers never reached because the sub-sections they called were
 * returning 404.
 */
async function scrapeNSP(): Promise<Scholarship[]> {
  const html = await safeFetch("https://scholarships.gov.in/All-Scholarships", {
    referer: "https://scholarships.gov.in/",
    timeout: 8000,
  });
  if (!html) return [];

  const scholarships: Scholarship[] = [];
  const blocks = html.split('<div class="accordion-item">');

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const ministryMatch = block.match(
      /accordion-button collapsed"[^>]*>\s*([\s\S]*?)\s*<\/button>/
    );
    const ministry = (ministryMatch?.[1] || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    // Skip the nav accordions (Students / Institute / Officers / Public).
    if (!ministry || /students|institute|officers|public/i.test(ministry)) continue;

    const rows = block.split('<div class="row mb-4 border-1 border-bottom">');

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const nameMatch = row.match(/<h6>([^<]+)<\/h6>/);
      const title = (nameMatch?.[1] || "").replace(/\s+/g, " ").trim();
      if (title.length < 10) continue;

      const spans = [
        ...row.matchAll(/border-radius: 20px;">\s*([^<]+?)\s*</g),
      ].map((m) => m[1].replace(/\s+/g, " ").trim());

      const opened = extractDate(spans, "open");
      const closes = extractDate(spans, "close");
      const iso = toISO(closes);

      const specLink = row.match(
        /<a href="([^"]+)"[^>]*>\s*Specifications\s*<\/a>/
      )?.[1];

      const url = specLink
        ? resolveUrl(specLink, "https://scholarships.gov.in")
        : APPLY_URL;

      scholarships.push({
        id: `nsp-${Buffer.from(title).toString("base64").slice(0, 40)}`,
        title,
        url,
        provider: ministry,
        amount: "As per scheme norms",
        deadline: iso || (closes ? closes : "Check portal"),
        eligibility: detectCategory(title) === "General" ? ministry : detectCategory(title),
        category: detectCategory(`${title} ${ministry}`),
        applyUrl: APPLY_URL,
        source: "government",
        scrapedAt: new Date().toISOString(),
      });

      void opened;
    }
  }

  return scholarships;
}

/** NSP announces fresh windows and new schemes on its student notices board. */
async function scrapeNSPAnnouncements(): Promise<Scholarship[]> {
  const html = await safeFetch(
    "https://scholarships.gov.in/student-announcements",
    { referer: "https://scholarships.gov.in/" }
  );
  if (!html) return [];

  const $ = cheerio.load(html);
  const scholarships: Scholarship[] = [];

  $("a").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    const href = $(el).attr("href") || "";
    if (text.length < 15 || text.length > 220 || !href) return;
    const t = text.toLowerCase();
    if (!/scholarship|fellowship|stipend|scheme/.test(t)) return;
    if (!/extend|last date|open|apply|notic|announc|deadline|invit/.test(t)) return;

    scholarships.push({
      id: `nsp-a-${Buffer.from(text).toString("base64").slice(0, 40)}`,
      title: text,
      url: resolveUrl(href, "https://scholarships.gov.in"),
      provider: "National Scholarship Portal",
      amount: "Check notification",
      deadline: "Check portal",
      eligibility: "All students",
      category: detectCategory(text),
      applyUrl: APPLY_URL,
      source: "government",
      scrapedAt: new Date().toISOString(),
    });
  });

  return scholarships;
}

/**
 * FreeJobAlert's dedicated scholarship path returns 404, but its homepage
 * still links out to fellowship and scholarship articles.
 */
async function scrapeFreeJobAlertScholarships(): Promise<Scholarship[]> {
  const html = await safeFetch("https://www.freejobalert.com/latest-notifications/", {
    referer: "https://www.freejobalert.com/",
  });
  if (!html) return [];

  const $ = cheerio.load(html);
  const scholarships: Scholarship[] = [];

  $("a").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    const href = $(el).attr("href") || "";
    if (text.length < 15 || !href.includes("/articles/")) return;
    const t = text.toLowerCase();
    if (!/scholarship|fellowship|stipend/.test(t)) return;

    const applyUrl = resolveUrl(href, "https://www.freejobalert.com");
    scholarships.push({
      id: `fja-sch-${Buffer.from(applyUrl).toString("base64").slice(0, 40)}`,
      title: text,
      url: applyUrl,
      provider: "Government of India",
      amount: "Check notification",
      deadline: "Check notification",
      eligibility: "Check notification",
      category: detectCategory(text),
      applyUrl,
      source: "government",
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
    scrapeNSP(),
    scrapeNSPAnnouncements(),
    scrapeFreeJobAlertScholarships(),
  ]);

  let all: Scholarship[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  all = dedupByTitle(all, 80);

  return {
    scholarships: all,
    scrapedAt: new Date().toISOString(),
  };
}
