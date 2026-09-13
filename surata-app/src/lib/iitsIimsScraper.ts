import * as cheerio from "cheerio";

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

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

async function safeFetch(url: string, referer?: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(referer ? { Referer: referer } : {}),
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

const IIT_SITES = [
  { name: "IIT Bombay", url: "https://www.iitb.ac.in/en/recruitment" },
  { name: "IIT Delhi", url: "https://home.iitd.ac.in/recruitment" },
  { name: "IIT Madras", url: "https://www.iitm.ac.in/recruitment" },
  { name: "IIT Kanpur", url: "https://www.iitk.ac.in/recruitment" },
  { name: "IIT Kharagpur", url: "https://www.iitkgp.ac.in/recruitment" },
  { name: "IIT Roorkee", url: "https://www.iitr.ac.in/recruitment" },
  { name: "IIT Guwahati", url: "https://www.iitg.ac.in/recruitment" },
  { name: "IIT Hyderabad", url: "https://www.iith.ac.in/recruitment" },
  { name: "IIT BHU", url: "https://www.iitbhu.ac.in/recruitment" },
  { name: "IIT ISM Dhanbad", url: "https://www.iitism.ac.in/faculty-positions" },
  { name: "IIT Patna", url: "https://www.iitp.ac.in/recruitment" },
  { name: "IIT Indore", url: "https://www.iiti.ac.in/recruitment" },
  { name: "IIT Bhubaneswar", url: "https://www.iitbbs.ac.in/recruitment" },
  { name: "IIT Ropar", url: "https://www.iitrpr.ac.in/recruitment" },
  { name: "IIT Jodhpur", url: "https://www.iitj.ac.in/recruitment" },
  { name: "IIT Mandi", url: "https://www.iitmandi.ac.in/recruitment" },
  { name: "IIT Palakkad", url: "https://www.iitpkd.ac.in/recruitment" },
  { name: "IIT Tirupati", url: "https://www.iitt.ac.in/recruitment" },
  { name: "IIT Jammu", url: "https://www.iitjammu.ac.in/recruitment" },
  { name: "IIT Dharwad", url: "https://www.iitdh.ac.in/recruitment" },
  { name: "IIT Bhilai", url: "https://www.iitbhilai.ac.in/recruitment" },
  { name: "IIT Goa", url: "https://www.iitgoa.ac.in/recruitment" },
  { name: "IIT Palakkad", url: "https://www.iitpkd.ac.in/recruitment" },
];

const IIM_SITES = [
  { name: "IIM Ahmedabad", url: "https://www.iima.ac.in/about-iima/quick-links/careers-iima" },
  { name: "IIM Bangalore", url: "https://www.iimb.ac.in/careers" },
  { name: "IIM Calcutta", url: "https://www.iimcal.ac.in/careers" },
  { name: "IIM Lucknow", url: "https://www.iiml.ac.in/careers" },
  { name: "IIM Kozhikode", url: "https://www.iimk.ac.in/careers" },
  { name: "IIM Indore", url: "https://www.iimidr.ac.in/careers" },
  { name: "IIM Shillong", url: "https://www.iimshillong.ac.in/careers" },
  { name: "IIM Ranchi", url: "https://iimranchi.ac.in/careers" },
  { name: "IIM Raipur", url: "https://www.iimraipur.ac.in/careers" },
  { name: "IIM Tiruchirappalli", url: "https://www.iimtrichy.ac.in/careers" },
  { name: "IIM Udaipur", url: "https://www.iimu.ac.in/careers" },
  { name: "IIM Nagpur", url: "https://www.iimnagpur.ac.in/careers" },
  { name: "IIM Bodh Gaya", url: "https://www.iimbg.ac.in/careers" },
  { name: "IIM Amritsar", url: "https://www.iima.ac.in/careers" },
  { name: "IIM Jammu", url: "https://www.iimj.ac.in/careers" },
  { name: "IIM Sirmaur", url: "https://www.iims.ac.in/careers" },
  { name: "IIM Visakhapatnam", url: "https://www.iimv.ac.in/careers" },
];

function detectType(text: string): IITIIMNews["type"] {
  const t = text.toLowerCase();
  if (t.includes("recruitment") || t.includes("faculty") || t.includes("vacancy") || t.includes("non-teaching") || t.includes("group b") || t.includes("group c")) return "recruitment";
  if (t.includes("admission") || t.includes("entrance") || t.includes("application") || t.includes("registration")) return "admission";
  if (t.includes("result") || t.includes("merit") || t.includes("shortlist")) return "result";
  return "news";
}

async function scrapeInstitutePage(name: string, url: string): Promise<IITIIMNews[]> {
  const news: IITIIMNews[] = [];
  const html = await safeFetch(url, url);
  if (!html) return news;
  const $ = cheerio.load(html);
  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 8 || !href) return;
    const fullUrl = href.startsWith("http") ? href : new URL(href, url).toString();
    news.push({
      id: `${name}-${Buffer.from(fullUrl).toString("base64").slice(0, 30)}`,
      title: text,
      institute: name,
      type: detectType(text),
      url: fullUrl,
      date: "",
      source: url,
      scrapedAt: new Date().toISOString(),
    });
  });
  return news;
}

// Scrape IIT/IIM listings from freejobalert
async function scrapeFreeJobAlertIITIIM(): Promise<IITIIMNews[]> {
  const news: IITIIMNews[] = [];
  const html = await safeFetch("https://www.freejobalert.com/iit-recruitment/", "https://www.freejobalert.com/");
  if (!html) return news;
  const $ = cheerio.load(html);
  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 10 || !href) return;
    const t = text.toLowerCase();
    if (!t.includes("iit") && !t.includes("iim")) return;
    news.push({
      id: `fja-iit-${Buffer.from(href).toString("base64").slice(0, 30)}`,
      title: text,
      institute: t.includes("iim") ? "IIM" : "IIT",
      type: detectType(text),
      url: href.startsWith("http") ? href : `https://www.freejobalert.com${href}`,
      date: "",
      source: "freejobalert.com",
      scrapedAt: new Date().toISOString(),
    });
  });
  return news;
}

// Scrape facultyplus.com for IIT/IIM faculty positions
async function scrapeFacultyPlus(): Promise<IITIIMNews[]> {
  const news: IITIIMNews[] = [];
  const html = await safeFetch("https://www.facultyplus.com/category/iit/", "https://www.facultyplus.com/");
  if (!html) return news;
  const $ = cheerio.load(html);
  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 10 || !href) return;
    const t = text.toLowerCase();
    if (!t.includes("iit") && !t.includes("iim") && !t.includes("recruitment") && !t.includes("faculty")) return;
    news.push({
      id: `fp-${Buffer.from(href).toString("base64").slice(0, 30)}`,
      title: text,
      institute: t.includes("iim") ? "IIM" : "IIT",
      type: detectType(text),
      url: href.startsWith("http") ? href : `https://www.facultyplus.com${href}`,
      date: "",
      source: "facultyplus.com",
      scrapedAt: new Date().toISOString(),
    });
  });
  return news;
}

function dedupNews(items: IITIIMNews[]): IITIIMNews[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title
      .toLowerCase()
      .replace(/recruitment|faculty|vacancy|20\d{2}/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function scrapeIITIIMNews(): Promise<{
  news: IITIIMNews[];
  scrapedAt: string;
}> {
  // Scrape individual IIT/IIM sites (batched)
  const allSites = [...IIT_SITES, ...IIM_SITES];
  const allNews: IITIIMNews[] = [];

  const batchSize = 8;
  for (let i = 0; i < allSites.length; i += batchSize) {
    const batch = allSites.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((site) => scrapeInstitutePage(site.name, site.url))
    );
    for (const r of results) {
      if (r.status === "fulfilled") allNews.push(...r.value);
    }
  }

  // Also scrape aggregator sources
  const aggregatorResults = await Promise.allSettled([
    scrapeFreeJobAlertIITIIM(),
    scrapeFacultyPlus(),
  ]);
  for (const r of aggregatorResults) {
    if (r.status === "fulfilled") allNews.push(...r.value);
  }

  return {
    news: dedupNews(allNews),
    scrapedAt: new Date().toISOString(),
  };
}
