import * as cheerio from "cheerio";
import { safeFetch, resolveUrl } from "./utils/fetcher";
import { dedupByTitle } from "./utils/dedup";
import type { ComprehensiveJob } from "@/types";

const OFFICIAL_DOMAINS = [
  "ssc.nic.in", "ssc.gov.in", "ibps.in", "upsc.gov.in",
  "rrbapply.gov.in", "indianrailways.gov.in",
  "nta.ac.in", "ntaresults.nic.in",
  "psc.ap.gov.in", "appsc.gov.in", "apsc.nic.in",
  "bpsc.bih.nic.in", "bpssc.bih.nic.in",
  "psc.cg.gov.in", "gpsc.goa.gov.in", "gpsc.gujarat.gov.in",
  "hpsc.gov.in", "hppsc.hp.gov.in",
  "jpsc.gov.in", "jssc.nic.in",
  "kpsc.kar.nic.in", "keralapsc.gov.in",
  "mppsc.mp.gov.in", "mpsc.mp.gov.in",
  "opsc.gov.in", "ossc.gov.in",
  "ppsc.gov.in",
  "rpsc.rajasthan.gov.in", "rsmssb.rajasthan.gov.in", "rssb.rajasthan.gov.in",
  "spsc.sikkim.gov.in",
  "tnpsc.gov.in",
  "tspsc.gov.in", "tgpsc.telangana.gov.in",
  "tpsc.tripura.gov.in",
  "uppsc.up.nic.in", "upsssc.up.nic.in", "upspsc.up.nic.in",
  "ukpsc.uk.gov.in", "uksssc.uk.gov.in",
  "wbpsc.gov.in",
  "jkpsc.nic.in", "jkssb.nic.in",
  "dsssb.delhi.gov.in", "hssc.gov.in",
  "mpesb.gov.in", "vyapam.mp.gov.in",
  "hpsssb.hp.gov.in",
  "kea.kar.nic.in",
  "drdo.gov.in", "isro.gov.in", "hal-india.co.in", "bel.co.in",
  "bsf.gov.in", "crpf.gov.in", "cisf.gov.in", "itbpolice.nic.in", "ssb.nic.in",
  "ntpc.co.in", "bhel.com", "ongcindia.com", "iocl.com",
  "gailonline.com", "sail.co.in", "coalindia.in",
  "ugc.gov.in", "aicte-india.org",
  "employmentnews.gov.in", "pib.gov.in", "education.gov.in",
  "joinindianarmy.nic.in", "joinindiannavy.gov.in", "indianairforce.nic.in",
  "kvs.ac.in", "nvs.gov.in", "ctet.nic.in",
  "nielit.in", "cbse.gov.in", "nios.ac.in",
  "patnahc.gov.in", "delhihighcourt.nic.in", "allahabadhighcourt.in",
  "mphighcourt.nic.in", "rajasthanhighcourt.gov.in",
  "calcuttahc.nic.in", "bombayhc.gov.in",
  "iitb.ac.in", "iitd.ac.in", "iitm.ac.in", "iitk.ac.in", "iitkgp.ac.in",
  "iitr.ac.in", "iitg.ac.in", "iith.ac.in", "iitbhu.ac.in", "iitism.ac.in",
  "iitp.ac.in", "iiti.ac.in", "iitbbs.ac.in", "iitrpr.ac.in", "iitj.ac.in",
  "iitpkd.ac.in", "iitt.ac.in", "iitjammu.ac.in", "iitdh.ac.in",
  "iima.ac.in", "iimb.ac.in", "iimcal.ac.in", "iiml.ac.in", "iimk.ac.in",
  "iimidr.ac.in", "iimshillong.ac.in", "iimranchi.ac.in", "iimraipur.ac.in",
  "iimtrichy.ac.in", "iimu.ac.in", "iimnagpur.ac.in", "iimj.ac.in",
];

function extractOfficialDomain(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    for (const domain of OFFICIAL_DOMAINS) {
      if (host.includes(domain) || domain.includes(host)) return domain;
    }
    if (host.endsWith(".gov.in") || host.endsWith(".nic.in")) return host;
    return null;
  } catch {
    return null;
  }
}

async function followAndExtractOfficial(
  aggregatorUrl: string
): Promise<{ officialUrl: string; officialSource: string } | null> {
  // Detail pages are small and only needed for their outbound link, so a short
  // timeout keeps one slow host from holding up a whole batch.
  const html = await safeFetch(aggregatorUrl, {
    referer: aggregatorUrl,
    timeout: 4000,
  });
  if (!html) return null;

  const $ = cheerio.load(html);
  let found: { officialUrl: string; officialSource: string } | null = null;

  // Check table rows first (the "Useful Important Links" pattern)
  $("table tr").each((_, row) => {
    if (found) return;
    const cells = $(row).find("td");
    if (cells.length < 2) return;
    const href = $(cells[1]).find("a").first().attr("href") || "";
    if (!href) return;
    const officialDomain = extractOfficialDomain(href);
    if (officialDomain) {
      found = { officialUrl: href, officialSource: officialDomain };
    }
  });

  // Fallback to generic links
  if (!found) {
    $("a").each((_, el) => {
      if (found) return;
      const href = $(el).attr("href") || "";
      const officialDomain = extractOfficialDomain(href);
      if (officialDomain) {
        found = { officialUrl: href, officialSource: officialDomain };
      }
    });
  }

  return found;
}

function detectCategory(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("psc") || t.includes("civil service") || t.includes("pcs") || t.includes("ias ") || t.includes("ips "))
    return "Civil Services";
  if (t.includes("ssc") || t.includes("staff selection")) return "Staff Selection";
  if (t.includes("rrb") || t.includes("railway")) return "Railways";
  if (t.includes("ibps") || t.includes("bank") || t.includes("sbi") || t.includes("rbi")) return "Banking";
  if (t.includes("upsc")) return "UPSC";
  if (t.includes("nta") || t.includes("neet") || t.includes("jee") || t.includes("cuet")) return "NTA Exams";
  if (t.includes("police") || t.includes("constable") || t.includes("si ") || t.includes("sub-inspector"))
    return "Police";
  if (t.includes("army") || t.includes("navy") || t.includes("air force") || t.includes("defence") || t.includes("bsf") || t.includes("crpf"))
    return "Defence";
  if (t.includes("teacher") || t.includes("tgt") || t.includes("pgt") || t.includes("tet")) return "Teaching";
  if (t.includes("court") || t.includes("judge") || t.includes("judicial")) return "Judiciary";
  if (t.includes("doctor") || t.includes("nurse") || t.includes("medical")) return "Medical";
  if (t.includes("engineer") || t.includes(" je ") || t.includes(" ae ")) return "Engineering";
  if (/\biit\b/.test(t) || /\biim\b/.test(t) || /\biisc\b/.test(t)) return "IIT/IIM";
  if (t.includes("psu") || t.includes("ongc") || t.includes("ntpc") || t.includes("bhel") || t.includes("sail"))
    return "PSU";
  return "Government";
}

const STATE_MAP: Record<string, string[]> = {
  "Andhra Pradesh": ["andhra", "apsc", "appsc"],
  Assam: ["assam", "apsc"],
  Bihar: ["bihar", "bpsc", "bssc"],
  Chhattisgarh: ["chhattisgarh", "cgpsc"],
  Goa: ["goa", "gpsc"],
  Gujarat: ["gujarat", "gpsc.gujarat", "gsssb"],
  Haryana: ["haryana", "hssc", "hpsc"],
  "Himachal Pradesh": ["himachal", "hppsc", "hpsssb"],
  Jharkhand: ["jharkhand", "jpsc", "jssc"],
  Karnataka: ["karnataka", "kpsc", "kea"],
  Kerala: ["kerala", "keralapsc"],
  "Madhya Pradesh": ["madhya pradesh", "mppsc", "mppeb", "vyapam"],
  Maharashtra: ["maharashtra", "mpsc"],
  Odisha: ["odisha", "orissa", "opsc", "ossc"],
  Punjab: ["punjab", "ppsc"],
  Rajasthan: ["rajasthan", "rpsc", "rsmssb", "rssb"],
  Sikkim: ["sikkim", "spsc"],
  "Tamil Nadu": ["tamil nadu", "tnpsc"],
  Telangana: ["telangana", "tspsc", "tgpsc"],
  Tripura: ["tripura", "tpsc"],
  "Uttar Pradesh": ["uttar pradesh", "uppsc", "upsssc"],
  Uttarakhand: ["uttarakhand", "ukpsc", "uksssc"],
  "West Bengal": ["west bengal", "wbpsc"],
  Delhi: ["delhi", "dsssb"],
  "Jammu & Kashmir": ["jammu", "kashmir", "jkpsc", "jkssb"],
};

function detectState(text: string, url: string): string {
  const combined = `${text.toLowerCase()} ${url.toLowerCase()}`;
  for (const [state, keywords] of Object.entries(STATE_MAP)) {
    if (keywords.some((k) => combined.includes(k))) return state;
  }
  return "All India";
}

function createJobFromLink(
  prefix: string,
  text: string,
  officialUrl: string,
  officialSource: string,
  overrides: Partial<ComprehensiveJob> = {}
): ComprehensiveJob {
  return {
    id: `${prefix}-${Buffer.from(officialUrl).toString("base64").slice(0, 40)}`,
    title: text,
    url: officialUrl,
    organization: detectCategory(text),
    category: detectCategory(text),
    state: detectState(text, officialUrl),
    totalPosts: 0,
    lastDate: "",
    applyUrl: officialUrl,
    source: officialSource,
    scrapedAt: new Date().toISOString(),
    ...overrides,
  };
}

async function scrapeAggregator(
  prefix: string,
  listUrl: string,
  baseUrl: string,
  // Was 5 links per serial batch across 40 links — 80 detail requests walked
  // eight at a time, which is what made this the slowest route in the app.
  // Wider batches mean the wall clock is decided by the slowest request
  // rather than by a queue.
  batchSize = 15,
  maxLinks = 30
): Promise<ComprehensiveJob[]> {
  const jobs: ComprehensiveJob[] = [];
  const html = await safeFetch(listUrl, { referer: baseUrl });
  if (!html) return jobs;

  const $ = cheerio.load(html);
  const links: { text: string; href: string }[] = [];

  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 15 || !href || href.includes("#")) return;
    const t = text.toLowerCase();
    if (t.includes("recruitment") || t.includes("online form") || t.includes("notification") || t.includes("apply")) {
      links.push({ text, href: resolveUrl(href, baseUrl) });
    }
  });

  for (let i = 0; i < Math.min(links.length, maxLinks); i += batchSize) {
    const batch = links.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (link) => {
        const official = await followAndExtractOfficial(link.href);
        return { link, official };
      })
    );
    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      const { link, official } = r.value;
      if (official) {
        jobs.push(createJobFromLink(prefix, link.text, official.officialUrl, official.officialSource));
      }
    }
  }
  return jobs;
}

async function scrapeDirectSource(
  prefix: string,
  url: string,
  baseUrl: string,
  overrides: Partial<ComprehensiveJob> = {}
): Promise<ComprehensiveJob[]> {
  const html = await safeFetch(url, { referer: baseUrl });
  if (!html) return [];

  const $ = cheerio.load(html);
  const jobs: ComprehensiveJob[] = [];

  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 10 || !href) return;
    const fullUrl = resolveUrl(href, baseUrl);
    jobs.push(
      createJobFromLink(prefix, text, fullUrl, new URL(baseUrl).hostname, overrides)
    );
  });

  return jobs;
}

export async function scrapeComprehensiveJobs(): Promise<{
  jobs: ComprehensiveJob[];
  sources: string[];
  scrapedAt: string;
}> {
  const results = await Promise.allSettled([
    scrapeAggregator("fja", "https://www.freejobalert.com/sarkari-naukri/", "https://www.freejobalert.com/"),
    scrapeAggregator("gja", "https://govtjobsalert.in/", "https://govtjobsalert.in/"),
    scrapeDirectSource("pib", "https://pib.gov.in/allRel.aspx", "https://pib.gov.in/", {
      organization: "PIB",
    }),
    scrapeDirectSource("drdo", "https://drdo.gov.in/drdo/en/offerings/vacancies", "https://drdo.gov.in/", {
      organization: "DRDO",
      category: "Defence",
    }),
    scrapeDirectSource("isro", "https://www.isro.gov.in/Careers.html", "https://www.isro.gov.in/", {
      organization: "ISRO",
      category: "PSU",
    }),
    scrapeDirectSource("ugc", "https://www.ugc.gov.in/important-announcements", "https://www.ugc.gov.in/", {
      organization: "UGC",
      category: "Education",
    }),
  ]);

  let allJobs: ComprehensiveJob[] = [];
  const sources: string[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") {
      allJobs.push(...r.value);
      sources.push(...[...new Set(r.value.map((j) => j.source))]);
    }
  }

  allJobs = dedupByTitle(allJobs);

  return {
    jobs: allJobs,
    sources: [...new Set(sources)],
    scrapedAt: new Date().toISOString(),
  };
}
