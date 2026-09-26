import * as cheerio from "cheerio";

export interface OfficialUpdate {
  title: string;
  url: string;
  source: string;
  category: string;
  date: string;
  type: "recruitment" | "result" | "admit-card" | "notification" | "news";
  scrapedAt: string;
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

async function safeFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function guessType(text: string): OfficialUpdate["type"] {
  const lower = text.toLowerCase();
  if (lower.includes("result") || lower.includes("merit") || lower.includes("score")) return "result";
  if (lower.includes("admit card") || lower.includes("exam city") || lower.includes("e-call")) return "admit-card";
  if (lower.includes("recruitment") || lower.includes("online form") || lower.includes("apply online") || lower.includes("vacancy")) return "recruitment";
  if (lower.includes("notification") || lower.includes("notice") || lower.includes("circular")) return "notification";
  return "news";
}

// ========== PIB (Press Information Bureau) ==========
export async function scrapePIB(): Promise<OfficialUpdate[]> {
  const html = await safeFetch("https://pib.gov.in/allRel.aspx");
  if (!html) return [];
  const $ = cheerio.load(html);
  const items: OfficialUpdate[] = [];

  $("a, .news_item, li").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length > 20 && href) {
      const url = href.startsWith("http") ? href : `https://pib.gov.in${href}`;
      items.push({
        title: text.slice(0, 200),
        url,
        source: "PIB (pib.gov.in)",
        category: guessType(text) === "news" ? "Government Policy" : "Government",
        date: new Date().toISOString().split("T")[0],
        type: guessType(text),
        scrapedAt: new Date().toISOString(),
      });
    }
  });

  return items.slice(0, 30);
}

// ========== Employment News (employmentnews.gov.in) ==========
export async function scrapeEmploymentNews(): Promise<OfficialUpdate[]> {
  const html = await safeFetch("https://employmentnews.gov.in/");
  if (!html) return [];
  const $ = cheerio.load(html);
  const items: OfficialUpdate[] = [];

  $("a, .news-item, li, h3 a, h2 a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length > 20 && href) {
      const url = href.startsWith("http") ? href : `https://employmentnews.gov.in${href}`;
      items.push({
        title: text.slice(0, 200),
        url,
        source: "Employment News (employmentnews.gov.in)",
        category: guessType(text) === "recruitment" ? "Jobs" : "Government",
        date: new Date().toISOString().split("T")[0],
        type: guessType(text),
        scrapedAt: new Date().toISOString(),
      });
    }
  });

  return items.slice(0, 30);
}

// ========== NTA (National Testing Agency) ==========
export async function scrapeNTA(): Promise<OfficialUpdate[]> {
  const html = await safeFetch("https://nta.ac.in/important-announcements");
  if (!html) return [];
  const $ = cheerio.load(html);
  const items: OfficialUpdate[] = [];

  $("a, .item, li").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length > 15 && href) {
      const url = href.startsWith("http") ? href : `https://nta.ac.in${href}`;
      const category = text.toLowerCase().includes("neet") ? "Medical" :
                       text.toLowerCase().includes("jee") ? "Engineering" :
                       text.toLowerCase().includes("cuet") ? "University" : "Exams";
      items.push({
        title: text.slice(0, 200),
        url,
        source: "NTA (nta.ac.in)",
        category,
        date: new Date().toISOString().split("T")[0],
        type: guessType(text),
        scrapedAt: new Date().toISOString(),
      });
    }
  });

  return items.slice(0, 20);
}

// ========== UGC (University Grants Commission) ==========
export async function scrapeUGC(): Promise<OfficialUpdate[]> {
  const html = await safeFetch("https://www.ugc.gov.in/important-announcements");
  if (!html) return [];
  const $ = cheerio.load(html);
  const items: OfficialUpdate[] = [];

  $("a, .item, li, .content a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length > 15 && href) {
      const url = href.startsWith("http") ? href : `https://www.ugc.gov.in${href}`;
      items.push({
        title: text.slice(0, 200),
        url,
        source: "UGC (ugc.gov.in)",
        category: "Education",
        date: new Date().toISOString().split("T")[0],
        type: guessType(text),
        scrapedAt: new Date().toISOString(),
      });
    }
  });

  return items.slice(0, 20);
}

// ========== AICTE (All India Council for Technical Education) ==========
export async function scrapeAICTE(): Promise<OfficialUpdate[]> {
  const html = await safeFetch("https://www.aicte-india.org/notices");
  if (!html) return [];
  const $ = cheerio.load(html);
  const items: OfficialUpdate[] = [];

  $("a, .item, li").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length > 15 && href) {
      const url = href.startsWith("http") ? href : `https://www.aicte-india.org${href}`;
      items.push({
        title: text.slice(0, 200),
        url,
        source: "AICTE (aicte-india.org)",
        category: "Technical Education",
        date: new Date().toISOString().split("T")[0],
        type: guessType(text),
        scrapedAt: new Date().toISOString(),
      });
    }
  });

  return items.slice(0, 20);
}

// ========== Ministry of Education ==========
export async function scrapeEducationMinistry(): Promise<OfficialUpdate[]> {
  const html = await safeFetch("https://education.gov.in/whats-new");
  if (!html) return [];
  const $ = cheerio.load(html);
  const items: OfficialUpdate[] = [];

  $("a, .item, li, .views-row").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length > 15 && href) {
      const url = href.startsWith("http") ? href : `https://education.gov.in${href}`;
      items.push({
        title: text.slice(0, 200),
        url,
        source: "Ministry of Education (education.gov.in)",
        category: "Education Policy",
        date: new Date().toISOString().split("T")[0],
        type: guessType(text),
        scrapedAt: new Date().toISOString(),
      });
    }
  });

  return items.slice(0, 20);
}

// ========== RRB (Railway Recruitment Board) ==========
export async function scrapeRRB(): Promise<OfficialUpdate[]> {
  const html = await safeFetch("https://rrbapply.gov.in/notifications");
  if (!html) return [];
  const $ = cheerio.load(html);
  const items: OfficialUpdate[] = [];

  $("a, .item, li, table tr").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length > 15 && href) {
      const url = href.startsWith("http") ? href : `https://rrbapply.gov.in${href}`;
      items.push({
        title: text.slice(0, 200),
        url,
        source: "RRB (rrbapply.gov.in)",
        category: "Railways",
        date: new Date().toISOString().split("T")[0],
        type: guessType(text),
        scrapedAt: new Date().toISOString(),
      });
    }
  });

  return items.slice(0, 20);
}

// ========== MASTER FUNCTION ==========
export async function scrapeAllOfficialUpdates(): Promise<OfficialUpdate[]> {
  // Only the sources that still answer are called. Employment News, NTA,
  // AICTE, the Ministry of Education and rrbapply.gov.in each returned an
  // empty document — NTA and rrbapply fail outright on a certificate and DNS
  // error — and together they spent seven seconds per refresh for nothing.
  const [pib, ugc] = await Promise.allSettled([scrapePIB(), scrapeUGC()]);

  const all: OfficialUpdate[] = [];

  if (pib.status === "fulfilled") all.push(...pib.value);
  if (ugc.status === "fulfilled") all.push(...ugc.value);

  const seen = new Set<string>();
  return all.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
