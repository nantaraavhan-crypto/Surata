import * as cheerio from "cheerio";
import { safeFetch, resolveUrl } from "./utils/fetcher";
import { dedupByCompositeKey } from "./utils/dedup";
import type { Internship } from "@/types";

function detectType(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("software") || t.includes("developer") || t.includes("engineering") || t.includes("sde"))
    return "Engineering";
  if (t.includes("data") || t.includes("ml") || t.includes("ai") || t.includes("analytics"))
    return "Data & AI";
  if (t.includes("marketing") || t.includes("growth") || t.includes("social media"))
    return "Marketing";
  if (t.includes("finance") || t.includes("accounting")) return "Finance";
  if (t.includes("design") || t.includes("ux") || t.includes("ui")) return "Design";
  if (t.includes("product")) return "Product";
  if (t.includes("business") || t.includes("sales")) return "Business";
  if (t.includes("content") || t.includes("writing")) return "Content";
  if (t.includes("hr") || t.includes("human resource")) return "HR";
  return "General";
}

const INTERNSHALA_CATEGORIES = [
  "work-from-home", "java-development", "python-development",
  "web-development", "data-science", "marketing", "finance",
  "design", "content-writing", "business-development", "hr", "fresher-jobs",
];

async function scrapeInternshala(): Promise<Internship[]> {
  const internships: Internship[] = [];

  for (const category of INTERNSHALA_CATEGORIES) {
    const url = `https://internshala.com/internships/${category}`;
    const html = await safeFetch(url, { referer: "https://internshala.com/" });
    if (!html) continue;

    const $ = cheerio.load(html);
    $("div.internship_card, .internship-item, .individual_internship_details").each((_, el) => {
      const titleEl = $(el).find("a.job-title-href, .job-intro h4 a, .internship-name a, h4 a").first();
      const title = titleEl.text().trim();
      const href = titleEl.attr("href") || "";
      if (!title || title.length < 3) return;

      const company = $(el).find("p.company-name, .company-name, .internship-company").first().text().trim();
      const location = $(el).find("p.locations, .location-name, .internship-location").first().text().trim();
      const stipend = $(el).find("span.stipend, .stipend-container, .internship-stipend").first().text().trim();
      const duration = $(el).find("span.duration, .duration, .internship-duration").first().text().trim();
      const applyUrl = resolveUrl(href, "https://internshala.com");

      internships.push({
        id: `internshala-${Buffer.from(applyUrl).toString("base64").slice(0, 40)}`,
        title,
        url: applyUrl,
        company: company || "Multiple Companies",
        location: location || "Work From Home",
        stipend: stipend || "Stipend Available",
        duration: duration || "Check posting",
        type: detectType(title),
        postedDate: "",
        applyUrl,
        source: "internshala.com",
        scrapedAt: new Date().toISOString(),
      });
    });
  }

  return internships;
}

async function scrapeWellfound(): Promise<Internship[]> {
  const html = await safeFetch("https://wellfound.com/internships", {
    referer: "https://wellfound.com/",
  });
  if (!html) return [];

  const $ = cheerio.load(html);
  const internships: Internship[] = [];

  $("div.styles_job__sEJvA, .job-listing, .styles_jobCard__").each((_, el) => {
    const titleEl = $(el).find("a.job-title, h4 a, .styles_jobTitle__ a").first();
    const title = titleEl.text().trim();
    const href = titleEl.attr("href") || "";
    if (!title || title.length < 3) return;

    const company = $(el).find("a.company-name, .company-name, .styles_companyName__").first().text().trim();
    const location = $(el).find("span.location, .location").first().text().trim();
    const salary = $(el).find("span.salary, .salary").first().text().trim();
    const applyUrl = resolveUrl(href, "https://wellfound.com");

    internships.push({
      id: `wellfound-${Buffer.from(applyUrl).toString("base64").slice(0, 40)}`,
      title,
      url: applyUrl,
      company: company || "Startup",
      location: location || "India",
      stipend: salary || "Stipend Available",
      duration: "3-6 months",
      type: detectType(title),
      postedDate: "",
      applyUrl,
      source: "wellfound.com",
      scrapedAt: new Date().toISOString(),
    });
  });

  return internships;
}

async function scrapeFreeJobAlertInternships(): Promise<Internship[]> {
  const html = await safeFetch("https://www.freejobalert.com/internship/", {
    referer: "https://www.freejobalert.com/",
  });
  if (!html) return [];

  const $ = cheerio.load(html);
  const internships: Internship[] = [];

  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 10 || !href) return;
    const t = text.toLowerCase();
    if (!t.includes("intern") && !t.includes("trainee")) return;

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
      source: "freejobalert.com",
      scrapedAt: new Date().toISOString(),
    });
  });

  return internships;
}

export async function scrapeInternships(): Promise<{
  internships: Internship[];
  scrapedAt: string;
}> {
  const results = await Promise.allSettled([
    scrapeInternshala(),
    scrapeWellfound(),
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
