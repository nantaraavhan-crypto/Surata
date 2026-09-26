import * as cheerio from "cheerio";

export interface OfficialLink {
  title: string;
  officialUrl: string;
  linkType: "result" | "admit_card" | "answer_key" | "apply_online" | "notification" | "syllabus" | "exam_date";
  organization: string;
  category: string;
  lastDate?: string;
  source: string;
  scrapedAt: string;
}

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
const SR = "https://www.sarkariresult.com";

async function safeFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml", Referer: SR },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function isOfficialUrl(href: string): boolean {
  const officialDomains = [
    // Central Government
    "ssc.nic.in", "ssc.gov.in", "ibps.in", "upsc.gov.in", "rrbapply.gov.in", "rrb",
    "indianrailways.gov.in", "nta.ac.in", "ntaresults.nic.in",
    "cdac.in", "nios.ac.in", "cbse.gov.in",
    "jee.nic.in", "neet.nta.nic.in", "cuet.samarth.ac.in",
    "ugcnet.nta.nic.in", "csirhrdg.res.in", "ugc.gov.in", "aicte-india.org",
    "employmentnews.gov.in", "pib.gov.in", "education.gov.in",
    // Defence
    "joinindianarmybd.nic.in", "joinindianarmy.nic.in",
    "navybandrecruitment.cdac.in", "joinindiannavy.gov.in",
    "afcat.cdac.in", "indianairforce.cdac.in", "indianairforce.nic.in",
    "drdo.gov.in", "isro.gov.in", "hal-india.co.in", "bel.co.in",
    "bsf.gov.in", "crpf.gov.in", "cisf.gov.in", "itbpolice.nic.in", "ssb.nic.in",
    // PSU
    "ntpc.co.in", "bhel.com", "ongcindia.com", "iocl.com",
    "gailonline.com", "sail.co.in", "coalindia.in",
    // All State PSCs
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
    // State SSCs / Selection Boards
    "dsssb.delhi.gov.in", "ssc.dsssb.delhi.gov.in",
    "hssc.gov.in",
    "mpesb.gov.in", "vyapam.mp.gov.in",
    "uksssc.uk.gov.in", "hpsssb.hp.gov.in",
    "jssc.nic.in", "bpssc.bih.nic.in",
    "rsmssb.rajasthan.gov.in",
    "kea.kar.nic.in",
    // High Courts
    "delhihighcourt.nic.in", "allahabadhighcourt.in",
    "patnahc.gov.in", "mphighcourt.nic.in",
    "rajasthanhighcourt.gov.in", "gujarathcpcr.in",
    "calcuttahc.nic.in", "madras HC.gov.in",
    "karhighcourt.karnataka.gov.in", "keralahc.gov.in",
    "bombayhc.gov.in", "telanganahc.gov.in",
    "orissa HC.nic.in",
    // Education
    "uphedu.gov.in", "upbasiceduboard.gov.in", "updeled.gov.in",
    "bsebstat.in", "biharboardonline.com",
    "jeecup.admissions.nic.in", "ctet.nic.in",
    "nielit.in", "cdn.digialm.com",
    "kvs.ac.in", "nvs.gov.in",
    // IITs & IIMs
    "iitb.ac.in", "iitd.ac.in", "iitm.ac.in", "iitk.ac.in", "iitkgp.ac.in",
    "iitr.ac.in", "iitg.ac.in", "iith.ac.in", "iitbhu.ac.in", "iitism.ac.in",
    "iitp.ac.in", "iiti.ac.in", "iitbbs.ac.in", "iitrpr.ac.in", "iitj.ac.in",
    "iitm.ac.in", "iitpkd.ac.in", "iitt.ac.in", "iitjammu.ac.in", "iitdh.ac.in",
    "iitbhilai.ac.in", "iitgoa.ac.in",
    "iima.ac.in", "iimb.ac.in", "iimcal.ac.in", "iiml.ac.in", "iimk.ac.in",
    "iimidr.ac.in", "iimshillong.ac.in", "iimranchi.ac.in", "iimraipur.ac.in",
    "iimtrichy.ac.in", "iimu.ac.in", "iimnagpur.ac.in", "iimbg.ac.in",
    "iimj.ac.in", "iims.ac.in", "iimv.ac.in",
  ];
  const lower = href.toLowerCase();
  return officialDomains.some((d) => lower.includes(d)) || lower.includes(".gov.in") || lower.includes(".nic.in") || lower.includes("gov.in");
}

function detectLinkType(text: string): OfficialLink["linkType"] {
  const t = text.toLowerCase();
  if (t.includes("result") || t.includes("merit") || t.includes("score card")) return "result";
  if (t.includes("admit card") || t.includes("exam city") || t.includes("exam date") || t.includes("e-call")) return "admit_card";
  if (t.includes("answer key") || t.includes("response sheet") || t.includes("final answer")) return "answer_key";
  if (t.includes("apply online") || t.includes("online form") || t.includes("registration")) return "apply_online";
  if (t.includes("notification") || t.includes("advertisement")) return "notification";
  if (t.includes("syllabus") || t.includes("exam pattern")) return "syllabus";
  if (t.includes("exam date") || t.includes("schedule")) return "exam_date";
  return "apply_online";
}

function detectOrg(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("rrb") || t.includes("railway")) return "Railways";
  if (t.includes("ssc")) return "SSC";
  if (t.includes("ibps") || t.includes("bank")) return "Banking";
  if (t.includes("upsc")) return "UPSC";
  if (t.includes("nta")) return "NTA";
  if (t.includes("upsssc")) return "UPSSSC";
  if (t.includes("bpsc") || t.includes("bihar")) return "Bihar";
  if (t.includes("rpsc") || t.includes("rajasthan")) return "Rajasthan";
  if (t.includes("mpesb") || t.includes("mp ") || t.includes("madhya")) return "MP";
  if (t.includes("uppsc") || t.includes("up ")) return "UP";
  if (t.includes("dsssb") || t.includes("delhi")) return "Delhi";
  if (t.includes("hssc") || t.includes("haryana")) return "Haryana";
  if (t.includes("hpc") || t.includes("high court")) return "High Court";
  if (t.includes("nta") || t.includes("neet") || t.includes("jee") || t.includes("cuet")) return "NTA";
  if (t.includes("uphedu") || t.includes("upbed") || t.includes("tET")) return "UP Education";
  return "Government";
}

// Step 1: Scrape sarkariresult homepage to get all internal links
async function scrapeHomepage(): Promise<{ title: string; url: string; section: string }[]> {
  const html = await safeFetch(SR);
  if (!html) return [];
  const $ = cheerio.load(html);
  const items: { title: string; url: string; section: string }[] = [];
  const seen = new Set<string>();

  $("ul.sarkari-quick-list li a, .gb-headline a, .job-box a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (text.length < 10 || !href || seen.has(href)) return;
    seen.add(href);

    let section = "other";
    const parent = $(el).closest(".gb-grid-column, .job-box");
    const sectionEl = parent.find(".gb-headline-text, .job-headline").first();
    const sectionText = sectionEl.text().toLowerCase() || parent.attr("class") || "";
    if (sectionText.includes("result")) section = "result";
    else if (sectionText.includes("admit")) section = "admit_card";
    else if (sectionText.includes("answer")) section = "answer_key";
    else if (sectionText.includes("job") || sectionText.includes("form") || sectionText.includes("online")) section = "job";
    else if (sectionText.includes("syllabus")) section = "syllabus";
    else if (sectionText.includes("admission")) section = "admission";

    items.push({ title: text, url: href, section });
  });

  return items;
}

// Step 2: Scrape individual page to find official government URLs
async function scrapeDetailPage(pageUrl: string): Promise<{ officialUrl: string; linkType: OfficialLink["linkType"]; label: string }[]> {
  const html = await safeFetch(pageUrl);
  if (!html) return [];
  const $ = cheerio.load(html);
  const results: { officialUrl: string; linkType: OfficialLink["linkType"]; label: string }[] = [];
  const seen = new Set<string>();

  // Look in table rows (the "Useful Important Links" section)
  $("table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;
    const label = $(cells[0]).text().trim().toLowerCase();
    const link = $(cells[1]).find("a").first();
    const href = link.attr("href") || "";
    if (!href || seen.has(href)) return;

    // Check if it's an official URL
    if (isOfficialUrl(href) && !href.includes("sarkariresult.com")) {
      seen.add(href);
      let linkType: OfficialLink["linkType"] = "apply_online";
      if (label.includes("result")) linkType = "result";
      else if (label.includes("admit card") || label.includes("exam city")) linkType = "admit_card";
      else if (label.includes("answer key")) linkType = "answer_key";
      else if (label.includes("notification") || label.includes("advertisement")) linkType = "notification";
      else if (label.includes("syllabus")) linkType = "syllabus";
      else if (label.includes("official")) linkType = "apply_online";

      results.push({ officialUrl: href, linkType, label: $(cells[0]).text().trim() });
    }
  });

  // Also check generic links
  if (results.length === 0) {
    $("a").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      if (!href || seen.has(href) || text.length < 5) return;
      if (isOfficialUrl(href) && !href.includes("sarkariresult.com")) {
        seen.add(href);
        results.push({ officialUrl: href, linkType: detectLinkType(text), label: text });
      }
    });
  }

  return results;
}

// Master function: scrape everything
export async function scrapeAllOfficialLinks(): Promise<{
  results: OfficialLink[];
  admitCards: OfficialLink[];
  answerKeys: OfficialLink[];
  latestJobs: OfficialLink[];
  scrapedAt: string;
}> {
  const homepage = await scrapeHomepage();

  // Group by section. The detail-page crawl below costs one request per entry,
  // so the per-section caps are what keep this route inside a couple of
  // seconds instead of ten.
  const resultPages = homepage.filter((p) => p.section === "result").slice(0, 20);
  const admitPages = homepage.filter((p) => p.section === "admit_card").slice(0, 20);
  const answerPages = homepage.filter((p) => p.section === "answer_key").slice(0, 16);
  const jobPages = homepage.filter((p) => p.section === "job").slice(0, 20);

  const allPages = [...resultPages, ...admitPages, ...answerPages, ...jobPages];

  // Scrape detail pages in batches
  const results: OfficialLink[] = [];
  const admitCards: OfficialLink[] = [];
  const answerKeys: OfficialLink[] = [];
  const latestJobs: OfficialLink[] = [];

  const batchSize = 12;
  for (let i = 0; i < allPages.length; i += batchSize) {
    const batch = allPages.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (page) => {
        const officialLinks = await scrapeDetailPage(page.url);
        return { page, officialLinks };
      })
    );

    for (const result of batchResults) {
      if (result.status !== "fulfilled") continue;
      const { page, officialLinks } = result.value;
      const org = detectOrg(page.title);

      for (const link of officialLinks) {
        const item: OfficialLink = {
          title: page.title,
          officialUrl: link.officialUrl,
          linkType: link.linkType,
          organization: org,
          category: page.section,
          source: "sarkariresult.com",
          scrapedAt: new Date().toISOString(),
        };

        if (link.linkType === "result" || page.section === "result") results.push(item);
        else if (link.linkType === "admit_card" || page.section === "admit_card") admitCards.push(item);
        else if (link.linkType === "answer_key" || page.section === "answer_key") answerKeys.push(item);
        else latestJobs.push(item);
      }
    }
  }

  // Deduplicate by officialUrl AND by normalized title (keep first occurrence)
  const dedup = (arr: OfficialLink[]) => {
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();
    return arr.filter((item) => {
      if (seenUrls.has(item.officialUrl)) return false;
      seenUrls.add(item.officialUrl);
      const normalizedTitle = item.title
        .toLowerCase()
        .replace(/admit\s*card|answer\s*key|result|response\s*sheet|final\s*answer|merit\s*list|score\s*card|download|view|apply\s*online|notification|advertisement|exam\s*date|syllabus/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (seenTitles.has(normalizedTitle)) return false;
      seenTitles.add(normalizedTitle);
      return true;
    });
  };

  return {
    results: dedup(results),
    admitCards: dedup(admitCards),
    answerKeys: dedup(answerKeys),
    latestJobs: dedup(latestJobs),
    scrapedAt: new Date().toISOString(),
  };
}
