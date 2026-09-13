import * as cheerio from "cheerio";

export interface PrivateJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  department: string;
  workMode: string;
  jobType: string;
  postedDate: string;
  applyUrl: string;
  source: string;
  scrapedAt: string;
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
];

let uaIndex = 0;
function nextUA(): string {
  const ua = USER_AGENTS[uaIndex % USER_AGENTS.length];
  uaIndex++;
  return ua;
}

function browserHeaders(referer?: string): Record<string, string> {
  return {
    "User-Agent": nextUA(),
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": referer ? "same-origin" : "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
    "Sec-Ch-Ua": '"Chromium";v="126", "Google Chrome";v="126", "Not-A.Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    ...(referer ? { Referer: referer } : {}),
  };
}

function detectDepartment(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("engineer") || t.includes("developer") || t.includes("sde") || t.includes("full stack") || t.includes("backend") || t.includes("frontend") || t.includes("java") || t.includes("python") || t.includes("node") || t.includes("react")) return "Engineering";
  if (t.includes("data scien") || t.includes("machine learn") || t.includes(" ai ") || t.includes(" ml ") || t.includes("analytics")) return "Data Science & AI";
  if (t.includes("product") || t.includes("program manage")) return "Product";
  if (t.includes("design") || t.includes(" ux") || t.includes(" ui ")) return "Design";
  if (t.includes("market") || t.includes("growth") || t.includes("seo") || t.includes("content")) return "Marketing";
  if (t.includes("sales") || t.includes("business develop") || t.includes("bd ")) return "Sales";
  if (t.includes("finance") || t.includes("account") || t.includes("ca ") || t.includes("chartered")) return "Finance";
  if (t.includes("hr ") || t.includes("human resource") || t.includes("recruit")) return "HR";
  if (t.includes("consult") || t.includes("advisory")) return "Consulting";
  if (t.includes("ops") || t.includes("operations") || t.includes("supply chain")) return "Operations";
  if (t.includes("intern")) return "Internship";
  return "Other";
}

// Session-based fetch: get cookies from homepage, then use them
async function sessionFetch(url: string, baseUrl: string, cookieJar?: Map<string, string>): Promise<{ html: string; cookies: Map<string, string> }> {
  const cookies = cookieJar || new Map<string, string>();
  try {
    const res = await fetch(url, {
      headers: {
        ...browserHeaders(baseUrl),
        Cookie: [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; "),
      },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });
    // Extract set-cookie headers
    const setCookies = res.headers.getSetCookie?.() || [];
    for (const sc of setCookies) {
      const [kv] = sc.split(";");
      const [k, v] = kv.split("=");
      if (k && v) cookies.set(k.trim(), v.trim());
    }
    if (!res.ok) return { html: "", cookies };
    const html = await res.text();
    return { html, cookies };
  } catch {
    return { html: "", cookies };
  }
}

// Source 1: Himalayas.app API
async function scrapeHimalayas(): Promise<PrivateJob[]> {
  try {
    const res = await fetch("https://himalayas.app/jobs/api?limit=100&sort=new", {
      headers: { "User-Agent": nextUA() },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs || []).map((j: Record<string, unknown>) => {
      const salary = j.minSalary && j.maxSalary
        ? `${j.currency || ""} ${(j.minSalary as number).toLocaleString()} - ${(j.maxSalary as number).toLocaleString()} / ${j.salaryPeriod || "year"}`
        : "Not Disclosed";
      const locs = Array.isArray(j.locationRestrictions) ? (j.locationRestrictions as string[]).join(", ") : "Remote";
      const seniority = Array.isArray(j.seniority) ? (j.seniority as string[]).join(", ") : "";
      const pubDate = j.pubDate ? new Date((j.pubDate as number) * 1000).toISOString() : "";
      return {
        id: `himalayas-${Buffer.from((j.guid as string) || (j.title as string) || "").toString("base64").slice(0, 40)}`,
        title: (j.title as string) || "",
        company: (j.companyName as string) || "Multiple Companies",
        location: locs || "Remote",
        salary,
        experience: seniority || "Check posting",
        department: detectDepartment((j.title as string) || ""),
        workMode: locs.toLowerCase().includes("remote") ? "Remote" : "Office",
        jobType: (j.employmentType as string) || "Full Time",
        postedDate: pubDate,
        applyUrl: (j.applicationLink as string) || (j.guid as string) || "",
        source: "himalayas.app",
        scrapedAt: new Date().toISOString(),
      };
    });
  } catch { return []; }
}

// Source 2: Arbeitnow API
async function scrapeArbeitnow(): Promise<PrivateJob[]> {
  try {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      headers: { "User-Agent": nextUA() },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).map((j: Record<string, string>) => ({
      id: `arbeitnow-${j.id}`,
      title: j.title || "",
      company: j.company_name || "Multiple Companies",
      location: j.location || "India",
      salary: j.salary || "Not Disclosed",
      experience: "Check posting",
      department: detectDepartment(j.title || ""),
      workMode: j.remote ? "Remote" : "Office",
      jobType: "Full Time",
      postedDate: j.created_at || "",
      applyUrl: j.url || "",
      source: "arbeitnow.com",
      scrapedAt: new Date().toISOString(),
    }));
  } catch { return []; }
}

// Source 3: Jobicy API
async function scrapeJobicy(): Promise<PrivateJob[]> {
  try {
    const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=50", {
      headers: { "User-Agent": nextUA() },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs || []).map((j: Record<string, unknown>) => {
      const salary = j.salaryMin && j.salaryMax
        ? `${j.salaryCurrency || ""} ${(j.salaryMin as number).toLocaleString()} - ${(j.salaryMax as number).toLocaleString()} / ${j.salaryPeriod || "year"}`
        : "Not Disclosed";
      const jobType = Array.isArray(j.jobType) ? (j.jobType as string[]).join(", ") : (j.jobType as string) || "Full Time";
      return {
        id: `jobicy-${j.id}`,
        title: (j.jobTitle as string) || "",
        company: (j.companyName as string) || "Multiple Companies",
        location: (j.jobGeo as string) || "Remote",
        salary,
        experience: (j.jobLevel as string) || "Check posting",
        department: detectDepartment((j.jobTitle as string) || ""),
        workMode: "Remote",
        jobType,
        postedDate: (j.pubDate as string) || "",
        applyUrl: (j.url as string) || "",
        source: "jobicy.com",
        scrapedAt: new Date().toISOString(),
      };
    });
  } catch { return []; }
}

// Source 4: Naukri — try session-based approach with cookies
async function scrapeNaukri(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = ["software-engineer", "data-scientist", "fresher", "marketing", "finance", "design", "sales", "developer"];
  const cookies = new Map<string, string>();

  // Step 1: Hit homepage to get cookies
  await sessionFetch("https://www.naukri.com/", "https://www.naukri.com/", cookies);

  for (const q of queries) {
    try {
      const { html, cookies: updatedCookies } = await sessionFetch(
        `https://www.naukri.com/${q}-jobs?experience=0&jobAge=7`,
        "https://www.naukri.com/",
        cookies,
      );
      // Merge cookies
      for (const [k, v] of updatedCookies) cookies.set(k, v);

      if (!html || html.includes("captcha") || html.includes("blocked") || html.includes("verify")) continue;
      const $ = cheerio.load(html);

      // Naukri uses JSON-LD structured data
      const jsonLd = $("script[type='application/ld+json']").first().html();
      if (jsonLd) {
        try {
          const ld = JSON.parse(jsonLd);
          if (ld.itemListElement) {
            for (const item of ld.itemListElement.slice(0, 20)) {
              const job = item.item || item;
              if (!job.name) continue;
              jobs.push({
                id: `naukri-ld-${Buffer.from(job.url || job.name).toString("base64").slice(0, 40)}`,
                title: job.name || "",
                company: job.hiringOrganization?.name || "Multiple Companies",
                location: job.jobLocation?.address?.addressLocality || "India",
                salary: job.baseSalary?.value?.value ? `₹${job.baseSalary.value.value.toLocaleString()}` : "Not Disclosed",
                experience: job.employmentType || "Check posting",
                department: detectDepartment(job.name || ""),
                workMode: "Office",
                jobType: job.employmentType || "Full Time",
                postedDate: job.datePosted || "",
                applyUrl: job.url || "",
                source: "naukri.com",
                scrapedAt: new Date().toISOString(),
              });
            }
          }
        } catch { /* JSON parse failed */ }
      }

      // Fallback: HTML selectors
      if (jobs.length === 0) {
        const selectors = ["div.tuple", "article.jobTuple", ".srp-cardContainer", "div.srp-cardLite", "div[data-job-id]"];
        for (const sel of selectors) {
          $(sel).each((_, el) => {
            const titleEl = $(el).find("a.title, a.titleellipsis, .jobTuple-header a, a.accent, a[data-title]").first();
            const title = titleEl.text().trim();
            const href = titleEl.attr("href") || "";
            const company = $(el).find("a.companyName, .companyName, .company-name, a.nkw").first().text().trim();
            const location = $(el).find("li.location span, .location, .jobLocation, span.locWdth").first().text().trim();
            const salary = $(el).find("li.salary span, .salary, .package, span.salary").first().text().trim();
            const experience = $(el).find("li.experience span, .experience, span.exp").first().text().trim();
            if (!title || title.length < 3) return;
            const applyUrl = href.startsWith("http") ? href : `https://www.naukri.com${href}`;
            jobs.push({
              id: `naukri-${Buffer.from(applyUrl + q).toString("base64").slice(0, 40)}`,
              title,
              company: company || "Multiple Companies",
              location: location || "India",
              salary: salary || "Not Disclosed",
              experience: experience || "Check posting",
              department: detectDepartment(title),
              workMode: "Office",
              jobType: "Full Time",
              postedDate: "",
              applyUrl,
              source: "naukri.com",
              scrapedAt: new Date().toISOString(),
            });
          });
          if (jobs.length > 0) break;
        }
      }

      // Fallback: extract from __NEXT_DATA__ or embedded JSON
      if (jobs.length === 0) {
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (nextDataMatch) {
          try {
            const nextData = JSON.parse(nextDataMatch[1]);
            const jobList = nextData?.props?.pageProps?.jobList || nextData?.props?.pageProps?.data?.jobs || [];
            for (const job of jobList.slice(0, 20)) {
              if (!job.title && !job.jobTitle) continue;
              jobs.push({
                id: `naukri-next-${Buffer.from(job.url || job.jobId || job.title).toString("base64").slice(0, 40)}`,
                title: job.title || job.jobTitle || "",
                company: job.companyName || job.company?.name || "Multiple Companies",
                location: job.location || "India",
                salary: job.salary || "Not Disclosed",
                experience: job.experience || "Check posting",
                department: detectDepartment(job.title || job.jobTitle || ""),
                workMode: "Office",
                jobType: "Full Time",
                postedDate: job.lastDate || "",
                applyUrl: job.url || `https://www.naukri.com/jobapi/v3/job/${job.jobId}` || "",
                source: "naukri.com",
                scrapedAt: new Date().toISOString(),
              });
            }
          } catch { /* JSON parse failed */ }
        }
      }
    } catch { continue; }
  }
  return jobs;
}

// Source 5: Indeed India — session-based with cookies
async function scrapeIndeedIndia(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = ["software engineer", "data scientist", "fresher", "marketing", "finance", "design", "sales", "developer"];
  const cookies = new Map<string, string>();

  // Step 1: Hit homepage to establish session
  await sessionFetch("https://in.indeed.com/", "https://in.indeed.com/", cookies);

  for (const q of queries) {
    try {
      const { html, cookies: updatedCookies } = await sessionFetch(
        `https://in.indeed.com/jobs?q=${encodeURIComponent(q)}&l=India&sort=date&fromage=7`,
        "https://in.indeed.com/",
        cookies,
      );
      for (const [k, v] of updatedCookies) cookies.set(k, v);

      if (!html || html.includes("captcha") || html.includes("verify you are human") || html.includes("cf-challenge")) continue;
      const $ = cheerio.load(html);

      const selectors = ["div.job_seen_beacon", ".resultContent", "td.resultContent", "div[data-jk]"];
      for (const sel of selectors) {
        $(sel).each((_, el) => {
          const titleEl = $(el).find("h2.jobTitle a, a.jcs-JobTitle, .jobTitle a, a[data-jk]").first();
          const title = titleEl.text().trim();
          const href = titleEl.attr("href") || "";
          const company = $(el).find("span[data-testid='company-name'], .companyName, .company, span.company").first().text().trim();
          const location = $(el).find("div[data-testid='text-location'], .companyLocation, .location").first().text().trim();
          const salary = $(el).find("div.salary-snippet-container, .salaryText, span.salaryText").first().text().trim();
          if (!title || title.length < 3) return;
          const applyUrl = href.startsWith("http") ? href : `https://in.indeed.com${href}`;
          jobs.push({
            id: `indeed-${Buffer.from(applyUrl + q).toString("base64").slice(0, 40)}`,
            title,
            company: company || "Multiple Companies",
            location: location || "India",
            salary: salary || "Not Disclosed",
            experience: "Check posting",
            department: detectDepartment(title),
            workMode: "Office",
            jobType: "Full Time",
            postedDate: "",
            applyUrl,
            source: "in.indeed.com",
            scrapedAt: new Date().toISOString(),
          });
        });
        if (jobs.length > 0) break;
      }
    } catch { continue; }
  }
  return jobs;
}

// Source 6: LinkedIn Jobs — use Google to bypass
async function scrapeLinkedIn(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = ["site:linkedin.com/jobs software engineer india", "site:linkedin.com/jobs data scientist india", "site:linkedin.com/jobs product manager india", "site:linkedin.com/jobs fresher india"];
  for (const q of queries) {
    try {
      const { html } = await sessionFetch(
        `https://www.google.com/search?q=${encodeURIComponent(q)}&num=20`,
        "https://www.google.com/",
      );
      if (!html) continue;
      const $ = cheerio.load(html);
      $("div.g, div[data-hveid]").each((_, el) => {
        const titleEl = $(el).find("h3").first();
        const linkEl = $(el).find("a[href*='linkedin.com/jobs']").first();
        const title = titleEl.text().trim();
        const href = linkEl.attr("href") || "";
        if (!title || !href.includes("linkedin.com")) return;
        const snippet = $(el).find("div[data-sncf], .VwiC3b, span.aCOpRe").text().trim();
        const companyMatch = snippet.match(/(?:at|@)\s+(.+?)(?:\s+in|\s+·|$)/i);
        jobs.push({
          id: `linkedin-${Buffer.from(href).toString("base64").slice(0, 40)}`,
          title: title.replace(" - LinkedIn", "").replace(" | LinkedIn", "").trim(),
          company: companyMatch?.[1] || "Multiple Companies",
          location: "India",
          salary: "Not Disclosed",
          experience: "Check posting",
          department: detectDepartment(title),
          workMode: "Hybrid",
          jobType: "Full Time",
          postedDate: "",
          applyUrl: href,
          source: "linkedin.com",
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch { continue; }
  }
  return jobs;
}

// Source 7: Indeed via Google cache
async function scrapeIndeedViaGoogle(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = ["site:in.indeed.com/viewjob software engineer india", "site:in.indeed.com/viewjob data scientist india", "site:in.indeed.com/viewjob fresher india"];
  for (const q of queries) {
    try {
      const { html } = await sessionFetch(
        `https://www.google.com/search?q=${encodeURIComponent(q)}&num=20`,
        "https://www.google.com/",
      );
      if (!html) continue;
      const $ = cheerio.load(html);
      $("div.g, div[data-hveid]").each((_, el) => {
        const titleEl = $(el).find("h3").first();
        const linkEl = $(el).find("a[href*='indeed.com/viewjob'], a[href*='indeed.com/jobs']").first();
        const title = titleEl.text().trim();
        const href = linkEl.attr("href") || "";
        if (!title || !href.includes("indeed.com")) return;
        const snippet = $(el).find("div[data-sncf], .VwiC3b, span.aCOpRe").text().trim();
        const companyMatch = snippet.match(/(?:at|@)\s+(.+?)(?:\s+in|\s+·|$)/i);
        jobs.push({
          id: `indeed-g-${Buffer.from(href).toString("base64").slice(0, 40)}`,
          title: title.replace(" - Indeed India", "").replace(" | Indeed.com", "").trim(),
          company: companyMatch?.[1] || "Multiple Companies",
          location: "India",
          salary: "Not Disclosed",
          experience: "Check posting",
          department: detectDepartment(title),
          workMode: "Office",
          jobType: "Full Time",
          postedDate: "",
          applyUrl: href,
          source: "in.indeed.com",
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch { continue; }
  }
  return jobs;
}

// Source 8: Naukri via Google
async function scrapeNaukriViaGoogle(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = ["site:naukri.com software engineer jobs india", "site:naukri.com data scientist jobs", "site:naukri.com fresher jobs", "site:naukri.com marketing jobs"];
  for (const q of queries) {
    try {
      const { html } = await sessionFetch(
        `https://www.google.com/search?q=${encodeURIComponent(q)}&num=20`,
        "https://www.google.com/",
      );
      if (!html) continue;
      const $ = cheerio.load(html);
      $("div.g, div[data-hveid]").each((_, el) => {
        const titleEl = $(el).find("h3").first();
        const linkEl = $(el).find("a[href*='naukri.com/']").first();
        const title = titleEl.text().trim();
        const href = linkEl.attr("href") || "";
        if (!title || !href.includes("naukri.com")) return;
        const snippet = $(el).find("div[data-sncf], .VwiC3b, span.aCOpRe").text().trim();
        const companyMatch = snippet.match(/(?:at|@)\s+(.+?)(?:\s+in|\s+·|$)/i);
        jobs.push({
          id: `naukri-g-${Buffer.from(href).toString("base64").slice(0, 40)}`,
          title: title.replace(" - Naukri.com", "").replace(" | Naukri.com", "").trim(),
          company: companyMatch?.[1] || "Multiple Companies",
          location: "India",
          salary: "Not Disclosed",
          experience: "Check posting",
          department: detectDepartment(title),
          workMode: "Office",
          jobType: "Full Time",
          postedDate: "",
          applyUrl: href,
          source: "naukri.com",
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch { continue; }
  }
  return jobs;
}

// Source 9: Remotive — try with different approach
async function scrapeRemotive(): Promise<PrivateJob[]> {
  try {
    const res = await fetch("https://remotive.com/api/jobs?limit=50&category=software-dev,design,product,data,marketing,business,finance", {
      headers: {
        ...browserHeaders("https://remotive.com/"),
        Accept: "application/json, text/plain, */*",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const text = await res.text();
    if (text.includes("challenge-platform") || text.includes("Just a moment") || text.includes("cf-chl")) return [];
    const data = JSON.parse(text);
    return (data.jobs || []).map((j: Record<string, string>) => ({
      id: `remotive-${j.id}`,
      title: j.title || "",
      company: j.company_name || "Multiple Companies",
      location: j.candidate_required_location || "Remote",
      salary: j.salary || "Not Disclosed",
      experience: "Check posting",
      department: detectDepartment(j.title || ""),
      workMode: "Remote",
      jobType: j.job_type || "Full Time",
      postedDate: j.publication_date || "",
      applyUrl: j.url || "",
      source: "remotive.com",
      scrapedAt: new Date().toISOString(),
    }));
  } catch { return []; }
}

// Source 10: LinkedIn Jobs RSS (sometimes accessible)
async function scrapeLinkedInRSS(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = ["software-engineer", "data-scientist", "product-manager", "fresher", "marketing", "design"];
  for (const q of queries) {
    try {
      const { html } = await sessionFetch(
        `https://www.linkedin.com/jobs/search?keywords=${q}&location=India&sortBy=DD&f_TPR=r604800&format=rss`,
        "https://www.linkedin.com/",
      );
      if (!html || !html.includes("<item>")) continue;
      const $ = cheerio.load(html, { xml: true });
      $("item").each((_, el) => {
        const title = $(el).find("title").text().trim();
        const link = $(el).find("link").text().trim();
        const company = $(el).find("company").text().trim() || $(el).find("description").text().match(/at\s+(.+?)(?:\s+in|\.)/)?.[1] || "";
        const description = $(el).find("description").text().trim();
        if (!title) return;
        jobs.push({
          id: `linkedin-rss-${Buffer.from(link || title).toString("base64").slice(0, 40)}`,
          title: title.replace(" - LinkedIn", "").trim(),
          company: company || "Multiple Companies",
          location: "India",
          salary: "Not Disclosed",
          experience: "Check posting",
          department: detectDepartment(title),
          workMode: "Hybrid",
          jobType: "Full Time",
          postedDate: "",
          applyUrl: link || "",
          source: "linkedin.com",
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch { continue; }
  }
  return jobs;
}

// Source 11: RemoteOK API (JSON, works from serverless)
async function scrapeRemoteOK(): Promise<PrivateJob[]> {
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": nextUA() },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    // First item is metadata, skip it
    return (data.slice(1) || []).map((j: Record<string, unknown>) => ({
      id: `remoteok-${j.id}`,
      title: (j.position as string) || "",
      company: (j.company as string) || "Multiple Companies",
      location: (j.location as string) || "Remote",
      salary: j.salary_min && j.salary_max && (j.salary_min as number) > 0
        ? `$${(j.salary_min as number).toLocaleString()} - $${(j.salary_max as number).toLocaleString()}`
        : "Not Disclosed",
      experience: "Check posting",
      department: detectDepartment((j.position as string) || ""),
      workMode: "Remote",
      jobType: "Full Time",
      postedDate: (j.date as string) || "",
      applyUrl: (j.apply_url as string) || (j.url as string) || "",
      source: "remoteok.com",
      scrapedAt: new Date().toISOString(),
    }));
  } catch { return []; }
}

// Source 12: Indeed India RSS feed
async function scrapeIndeedRSS(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = ["software+engineer", "data+scientist", "fresher", "marketing", "finance", "developer", "python", "react"];
  for (const q of queries) {
    try {
      const res = await fetch(`https://in.indeed.com/rss?q=${q}&l=India&sort=date&fromage=7`, {
        headers: { "User-Agent": nextUA(), Accept: "application/rss+xml, application/xml, text/xml" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      if (xml.includes("captcha") || xml.includes("challenge")) continue;
      const $ = cheerio.load(xml, { xml: true });
      $("item").each((_, el) => {
        const title = $(el).find("title").text().trim();
        const link = $(el).find("link").text().trim();
        const description = $(el).find("description").text().trim();
        const pubDate = $(el).find("pubDate").text().trim();
        if (!title || title.length < 3) return;
        // Extract company from description
        const companyMatch = description.match(/<span class="company">([^<]+)<\/span>/);
        const company = companyMatch?.[1]?.trim() || "";
        const locMatch = description.match(/<span class="location">([^<]+)<\/span>/);
        const location = locMatch?.[1]?.trim() || "India";
        jobs.push({
          id: `indeed-rss-${Buffer.from(link || title).toString("base64").slice(0, 40)}`,
          title: title.replace(/ - .+$/, "").trim(),
          company: company || "Multiple Companies",
          location,
          salary: "Not Disclosed",
          experience: "Check posting",
          department: detectDepartment(title),
          workMode: "Office",
          jobType: "Full Time",
          postedDate: pubDate || "",
          applyUrl: link || "",
          source: "in.indeed.com",
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch { continue; }
  }
  return jobs;
}

// Source 13: Foundit RSS
async function scrapeFounditRSS(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = ["software-engineer", "data-scientist", "fresher", "marketing", "python-developer", "react-developer"];
  for (const q of queries) {
    try {
      const res = await fetch(`https://www.foundit.in/rss/${q}-jobs`, {
        headers: { "User-Agent": nextUA(), Accept: "application/rss+xml, application/xml, text/xml" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      if (xml.includes("captcha") || xml.includes("blocked")) continue;
      const $ = cheerio.load(xml, { xml: true });
      $("item").each((_, el) => {
        const title = $(el).find("title").text().trim();
        const link = $(el).find("link").text().trim();
        const description = $(el).find("description").text().trim();
        const pubDate = $(el).find("pubDate").text().trim();
        if (!title) return;
        // Parse company from title (usually "Company Name - Job Title")
        const parts = title.split(" - ");
        const company = parts.length > 1 ? parts[parts.length - 1].trim() : "Multiple Companies";
        const jobTitle = parts.length > 1 ? parts.slice(0, -1).join(" - ").trim() : title;
        jobs.push({
          id: `foundit-rss-${Buffer.from(link || title).toString("base64").slice(0, 40)}`,
          title: jobTitle,
          company,
          location: "India",
          salary: "Not Disclosed",
          experience: "Check posting",
          department: detectDepartment(jobTitle),
          workMode: "Office",
          jobType: "Full Time",
          postedDate: pubDate || "",
          applyUrl: link || "",
          source: "foundit.in",
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch { continue; }
  }
  return jobs;
}

// Source 14: Shine.com RSS
async function scrapeShineRSS(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = ["software-engineer", "data-scientist", "fresher", "marketing", "python-developer", "react-developer", "product-manager"];
  for (const q of queries) {
    try {
      const res = await fetch(`https://www.shine.com/job-search/rss/${q}-jobs`, {
        headers: { "User-Agent": nextUA(), Accept: "application/rss+xml, application/xml, text/xml" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      if (xml.includes("captcha") || xml.includes("blocked")) continue;
      const $ = cheerio.load(xml, { xml: true });
      $("item").each((_, el) => {
        const title = $(el).find("title").text().trim();
        const link = $(el).find("link").text().trim();
        const description = $(el).find("description").text().trim();
        const pubDate = $(el).find("pubDate").text().trim();
        if (!title) return;
        // Extract company from description
        const companyMatch = description.match(/Company:\s*([^<\n]+)/i);
        const company = companyMatch?.[1]?.trim() || "Multiple Companies";
        const locMatch = description.match(/Location:\s*([^<\n]+)/i);
        const location = locMatch?.[1]?.trim() || "India";
        jobs.push({
          id: `shine-${Buffer.from(link || title).toString("base64").slice(0, 40)}`,
          title,
          company,
          location,
          salary: "Not Disclosed",
          experience: "Check posting",
          department: detectDepartment(title),
          workMode: "Office",
          jobType: "Full Time",
          postedDate: pubDate || "",
          applyUrl: link || "",
          source: "shine.com",
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch { continue; }
  }
  return jobs;
}

// Source 15: TimesJobs RSS
async function scrapeTimesJobsRSS(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = ["software-engineer", "data-scientist", "fresher", "marketing", "python-developer"];
  for (const q of queries) {
    try {
      const res = await fetch(`https://www.timesjobs.com/rss/${q}-jobs`, {
        headers: { "User-Agent": nextUA(), Accept: "application/rss+xml, application/xml, text/xml" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      if (xml.includes("captcha") || xml.includes("blocked")) continue;
      const $ = cheerio.load(xml, { xml: true });
      $("item").each((_, el) => {
        const title = $(el).find("title").text().trim();
        const link = $(el).find("link").text().trim();
        const description = $(el).find("description").text().trim();
        const pubDate = $(el).find("pubDate").text().trim();
        if (!title) return;
        const companyMatch = description.match(/Company:\s*([^<\n]+)/i) || title.match(/\bat\b\s+(.+)/i);
        const company = companyMatch?.[1]?.trim() || "Multiple Companies";
        jobs.push({
          id: `timesjobs-${Buffer.from(link || title).toString("base64").slice(0, 40)}`,
          title: title.replace(/\s*[-–]\s*.+$/, "").trim(),
          company,
          location: "India",
          salary: "Not Disclosed",
          experience: "Check posting",
          department: detectDepartment(title),
          workMode: "Office",
          jobType: "Full Time",
          postedDate: pubDate || "",
          applyUrl: link || "",
          source: "timesjobs.com",
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch { continue; }
  }
  return jobs;
}

// Source 16: LandingJobs API (JSON, works)
async function scrapeLandingJobs(): Promise<PrivateJob[]> {
  try {
    const res = await fetch("https://www.landing.jobs/api/v1/jobs?limit=100", {
      headers: { "User-Agent": nextUA(), Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map((j: Record<string, unknown>) => {
      const tags = Array.isArray(j.tags) ? (j.tags as string[]).join(", ") : "";
      const salary = j.salary_min && j.salary_max
        ? `${j.currency_code || "EUR"} ${(j.salary_min as number).toLocaleString()} - ${(j.salary_max as number).toLocaleString()}`
        : "Not Disclosed";
      return {
        id: `landingjobs-${j.id}`,
        title: (j.name as string) || "",
        company: (j.company_name as string) || "Multiple Companies",
        location: (j.city as string) || (j.remote_allowed ? "Remote" : "Europe"),
        salary,
        experience: tags || "Check posting",
        department: detectDepartment((j.name as string) || ""),
        workMode: j.remote_allowed ? "Remote" : "Office",
        jobType: "Full Time",
        postedDate: (j.published_at as string) || "",
        applyUrl: `https://www.landing.jobs/jobs/${j.id}`,
        source: "landing.jobs",
        scrapedAt: new Date().toISOString(),
      };
    });
  } catch { return []; }
}

// Source 17: LinkedIn Guest API (Indian jobs, no auth needed)
async function scrapeLinkedInGuest(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = [
    "software+engineer", "data+scientist", "product+manager", "marketing",
    "sales", "finance", "hr", "design", "developer", "fresher",
    "python+developer", "react+developer", "full+stack", "backend+developer",
    "frontend+developer", "devops", "cloud+engineer", "machine+learning",
    "business+analyst", "project+manager", "operations", "consultant",
  ];
  for (const q of queries) {
    for (let start = 0; start < 25; start += 25) {
      try {
        const res = await fetch(
          `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${q}&location=India&start=${start}`,
          {
            headers: {
              "User-Agent": nextUA(),
              Accept: "text/html",
              "Accept-Language": "en-US,en;q=0.9",
            },
            signal: AbortSignal.timeout(10000),
          },
        );
        if (!res.ok) continue;
        const html = await res.text();
        if (html.includes("challenge") || html.includes("blocked") || html.includes("captcha")) continue;
        const $ = cheerio.load(html);
        $("li").each((_, el) => {
          const titleEl = $(el).find("h3.base-search-card__title, h3").first();
          const title = titleEl.text().trim();
          const companyEl = $(el).find("h4.base-search-card__subtitle, a.hidden-nested-link").first();
          const company = companyEl.text().trim();
          const locationEl = $(el).find("span.job-search-card__location, span").last();
          const location = locationEl.text().trim();
          const linkEl = $(el).find("a.base-card__full-link, a").first();
          const href = linkEl.attr("href") || "";
          if (!title || title.length < 3) return;
          jobs.push({
            id: `linkedin-guest-${Buffer.from(href || title + company).toString("base64").slice(0, 40)}`,
            title,
            company: company || "Multiple Companies",
            location: location || "India",
            salary: "Not Disclosed",
            experience: "Check posting",
            department: detectDepartment(title),
            workMode: "Hybrid",
            jobType: "Full Time",
            postedDate: "",
            applyUrl: href.split("?")[0] || "",
            source: "linkedin.com",
            scrapedAt: new Date().toISOString(),
          });
        });
      } catch { continue; }
    }
  }
  return jobs;
}

// Source 18: Internshala HTML scrape (Indian internships/jobs)
async function scrapeInternshalaJobs(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const urls = [
    "https://internshala.com/jobs/work-from-home-jobs",
    "https://internshala.com/jobs/software-development-jobs",
    "https://internshala.com/jobs/data-science-jobs",
    "https://internshala.com/jobs/marketing-jobs",
    "https://internshala.com/jobs/design-jobs",
    "https://internshala.com/jobs/finance-jobs",
    "https://internshala.com/jobs/hr-jobs",
    "https://internshala.com/jobs/engineering-jobs",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": nextUA(), Accept: "text/html" },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      if (html.includes("captcha") || html.includes("challenge")) continue;
      // Extract from embedded JSON
      const jsonMatch = html.match(/"jobList":\s*(\[.*?\])/);
      if (jsonMatch) {
        try {
          const jobList = JSON.parse(jsonMatch[1]);
          for (const j of jobList.slice(0, 30)) {
            if (!j.title && !j.jobTitle) continue;
            const title = j.title || j.jobTitle || "";
            const company = j.companyName || j.company || "Multiple Companies";
            const location = j.location || j.city || "India";
            const salary = j.salary ? `₹${j.salary}` : "Not Disclosed";
            jobs.push({
              id: `internshala-${Buffer.from(title + company).toString("base64").slice(0, 40)}`,
              title,
              company,
              location,
              salary,
              experience: j.experience || "Fresher/Entry Level",
              department: detectDepartment(title),
              workMode: location.toLowerCase().includes("work from home") || location.toLowerCase().includes("remote") ? "Remote" : "Office",
              jobType: j.type || "Full Time",
              postedDate: j.postedOn || "",
              applyUrl: j.url ? `https://internshala.com${j.url}` : "",
              source: "internshala.com",
              scrapedAt: new Date().toISOString(),
            });
          }
        } catch { /* JSON parse failed */ }
      }
      // Fallback: HTML parsing
      if (jobs.length === 0) {
        const $ = cheerio.load(html);
        const selectors = ["div.job-title", ".job-card", "div.ipn-lead-details", "div.job-internship-name", "a.job-internship-name"];
        for (const sel of selectors) {
          $(sel).each((_, el) => {
            const title = $(el).text().trim();
            if (!title || title.length < 3) return;
            const parent = $(el).closest(".job-card, .ipn-lead-details, div");
            const company = parent.find(".company-name, .company_name").first().text().trim();
            const location = parent.find(".location, .job-location").first().text().trim();
            jobs.push({
              id: `internshala-${Buffer.from(title).toString("base64").slice(0, 40)}`,
              title,
              company: company || "Multiple Companies",
              location: location || "India",
              salary: "Not Disclosed",
              experience: "Fresher/Entry Level",
              department: detectDepartment(title),
              workMode: "Office",
              jobType: "Full Time",
              postedDate: "",
              applyUrl: "",
              source: "internshala.com",
              scrapedAt: new Date().toISOString(),
            });
          });
          if (jobs.length > 0) break;
        }
      }
    } catch { continue; }
  }
  return jobs;
}

// Source 19: Hasjob (Indian startup job board, Atom feed)
async function scrapeHasjob(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  try {
    const res = await fetch("https://hasjob.co/feed", {
      headers: { "User-Agent": nextUA(), Accept: "application/atom+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const $ = cheerio.load(xml, { xml: true });
    $("entry").each((_, el) => {
      const title = $(el).find("title").text().trim();
      const link = $(el).find("link").attr("href") || "";
      const location = $(el).find("location").text().trim();
      const published = $(el).find("published").text().trim();
      const content = $(el).find("content").text().trim();
      // Extract company from content
      const companyMatch = content.match(/<strong><a[^>]*>([^<]+)<\/a><\/strong>/);
      const company = companyMatch?.[1] || content.match(/<strong>([^<]+)<\/strong>/)?.[1] || "Startup";
      if (!title) return;
      jobs.push({
        id: `hasjob-${Buffer.from(link || title).toString("base64").slice(0, 40)}`,
        title,
        company,
        location: location || "India",
        salary: "Not Disclosed",
        experience: "Check posting",
        department: detectDepartment(title),
        workMode: location.toLowerCase().includes("remote") ? "Remote" : "Office",
        jobType: "Full Time",
        postedDate: published || "",
        applyUrl: link,
        source: "hasjob.co",
        scrapedAt: new Date().toISOString(),
      });
    });
  } catch { /* ignore */ }
  return jobs;
}

// Source 20: Dev.to job articles
async function scrapeDevtoJobs(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  try {
    const res = await fetch("https://dev.to/api/articles?tag=jobs&per_page=30", {
      headers: { "User-Agent": nextUA(), Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    for (const article of data) {
      const title = article.title || "";
      const url = article.url || "";
      // Extract company from title patterns like "Company is hiring..."
      const companyMatch = title.match(/^(.+?)\s+(?:is\s+)?hiring/i) || title.match(/^(.+?)\s*[-–|]/);
      const company = companyMatch?.[1]?.trim() || "Tech Company";
      const tags = (article.tag_list || []).join(", ");
      if (!title.toLowerCase().includes("hiring") && !title.toLowerCase().includes("job")) continue;
      jobs.push({
        id: `devto-${article.id}`,
        title: title.replace(/is hiring.*$/i, "").trim(),
        company,
        location: "Remote / India",
        salary: "Not Disclosed",
        experience: "Check posting",
        department: detectDepartment(title),
        workMode: "Remote",
        jobType: "Full Time",
        postedDate: article.published_at || "",
        applyUrl: url,
        source: "dev.to",
        scrapedAt: new Date().toISOString(),
      });
    }
  } catch { /* ignore */ }
  return jobs;
}

// Source 21: Internshala Internships (dedicated intern scraper)
async function scrapeInternshalaInternships(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const urls = [
    "https://internshala.com/internships/work-from-home",
    "https://internshala.com/internships/software-development-internship",
    "https://internshala.com/internships/data-science-internship",
    "https://internshala.com/internships/marketing-internship",
    "https://internshala.com/internships/design-internship",
    "internshala.com/internships/content-writing-internship",
    "https://internshala.com/internships/finance-internship",
    "https://internshala.com/internships/hr-internship",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": nextUA(), Accept: "text/html" },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      if (html.includes("captcha") || html.includes("challenge")) continue;
      const $ = cheerio.load(html);
      // Look for intern cards
      const selectors = ["div.individual_internship", "div.internship_card", "div.ipn-lead-details", "a.job-internship-name", "div.job-title"];
      for (const sel of selectors) {
        $(sel).each((_, el) => {
          const title = $(el).find("h3, .job-internship-name, .title, a").first().text().trim() || $(el).text().trim().split("\n")[0];
          if (!title || title.length < 3 || title.length > 100) return;
          const parent = $(el).closest(".individual_internship, .internship_card, .ipn-lead-details");
          const company = parent.find(".company-name, .company_name, .company").first().text().trim();
          const location = parent.find(".location, .internship-location, span.location").first().text().trim();
          const stipend = parent.find(".stipend, .stipend_text, span stipend").first().text().trim();
          if (title.toLowerCase().includes("intern") || title.toLowerCase().includes("trainee") || title.length < 50) {
            jobs.push({
              id: `internshala-int-${Buffer.from(title + company).toString("base64").slice(0, 40)}`,
              title,
              company: company || "Startup",
              location: location || "India",
              salary: stipend || "Stipend Available",
              experience: "Fresher/Student",
              department: detectDepartment(title),
              workMode: location.toLowerCase().includes("work from home") || location.toLowerCase().includes("remote") ? "Remote" : "Office",
              jobType: "Internship",
              postedDate: "",
              applyUrl: "",
              source: "internshala.com",
              scrapedAt: new Date().toISOString(),
            });
          }
        });
        if (jobs.length > 0) break;
      }
    } catch { continue; }
  }
  return jobs;
}

// Source 22: Wellfound/AngelList startup jobs via Google
async function scrapeWellfoundGoogle(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const queries = [
    "site:wellfound.com/role software engineer india",
    "site:wellfound.com/role data scientist india",
    "site:wellfound.com/role product manager india",
    "site:wellfound.com/role fresher india",
    "site:wellfound.com/role marketing india",
    "site:wellfound.com/role design india",
  ];
  for (const q of queries) {
    try {
      const { html } = await sessionFetch(
        `https://www.google.com/search?q=${encodeURIComponent(q)}&num=20`,
        "https://www.google.com/",
      );
      if (!html) continue;
      const $ = cheerio.load(html);
      $("div.g, div[data-hveid]").each((_, el) => {
        const titleEl = $(el).find("h3").first();
        const linkEl = $(el).find("a[href*='wellfound.com/role']").first();
        const title = titleEl.text().trim();
        const href = linkEl.attr("href") || "";
        if (!title || !href.includes("wellfound.com")) return;
        const snippet = $(el).find("div[data-sncf], .VwiC3b").text().trim();
        const companyMatch = snippet.match(/(?:at|@)\s+(.+?)(?:\s+in|\s+·|$)/i);
        jobs.push({
          id: `wellfound-${Buffer.from(href).toString("base64").slice(0, 40)}`,
          title: title.replace(" | Wellfound", "").replace(" - Wellfound", "").trim(),
          company: companyMatch?.[1] || "Startup",
          location: "India",
          salary: "Not Disclosed",
          experience: "Check posting",
          department: detectDepartment(title),
          workMode: "Hybrid",
          jobType: "Full Time",
          postedDate: "",
          applyUrl: href,
          source: "wellfound.com",
          scrapedAt: new Date().toISOString(),
        });
      });
    } catch { continue; }
  }
  return jobs;
}

// Source 23: Internshala JSON-LD scrape (Indian jobs, structured data)
async function scrapeInternshalaJsonLd(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  const pages = [
    "https://internshala.com/jobs/search?keyword=developer&location=India",
    "https://internshala.com/jobs/search?keyword=python&location=India",
    "https://internshala.com/jobs/search?keyword=react&location=India",
    "https://internshala.com/jobs/search?keyword=java&location=India",
    "https://internshala.com/jobs/search?keyword=data+scientist&location=India",
    "https://internshala.com/jobs/search?keyword=full+stack&location=India",
    "https://internshala.com/jobs/search?keyword=marketing&location=India",
    "https://internshala.com/jobs/search?keyword=design&location=India",
    "https://internshala.com/jobs/search?keyword=finance&location=India",
    "https://internshala.com/jobs/search?keyword=devops&location=India",
    "https://internshala.com/jobs/search?keyword=android&location=India",
    "https://internshala.com/jobs/search?keyword=frontend&location=India",
  ];
  for (const url of pages) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": nextUA(), Accept: "text/html" },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const html = await res.text();
      if (html.includes("captcha") || html.includes("challenge")) continue;
      // Parse JSON-LD structured data
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/);
      if (jsonLdMatch) {
        try {
          const json = JSON.parse(jsonLdMatch[1]);
          if (json.itemListElement) {
            for (const item of json.itemListElement) {
              const title = item.name || "";
              const jobUrl = item.url || "";
              // Extract company and location from URL: /job/detail/{title}-job-in-{city}-at-{company}{id}
              const urlMatch = jobUrl.match(/-in-([^-]+(?:-[^-]+)*)-at-([^-]+)(\d+)$/);
              const location = urlMatch?.[1]?.replace(/-/g, " ") || "India";
              const company = urlMatch?.[2]?.replace(/-/g, " ") || "Company";
              if (!title || title.length < 3) continue;
              jobs.push({
                id: `internshala-jd-${item.position || Buffer.from(title + company).toString("base64").slice(0, 30)}`,
                title,
                company: company.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                location: location.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                salary: "Not Disclosed",
                experience: "Entry Level",
                department: detectDepartment(title),
                workMode: location.toLowerCase().includes("work from home") || location.toLowerCase().includes("remote") ? "Remote" : "Office",
                jobType: "Full Time",
                postedDate: "",
                applyUrl: jobUrl.startsWith("http") ? jobUrl : `https://internshala.com${jobUrl}`,
                source: "internshala.com",
                scrapedAt: new Date().toISOString(),
              });
            }
          }
        } catch { /* JSON parse failed */ }
      }
      // Also parse data-href divs
      const hrefMatches = html.matchAll(/data-href=['"]([^'"]+)['"]\s+internshipId=["'](\d+)["']\s+employment_type=["'](\w+)["']/g);
      for (const match of hrefMatches) {
        const jobUrl = match[1];
        const jobId = match[2];
        const empType = match[3];
        // Extract title from URL
        const titleMatch = jobUrl.match(/\/detail\/(.+?)-job-in-/);
        const title = titleMatch?.[1]?.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "";
        const urlMatch2 = jobUrl.match(/-in-([^-]+(?:-[^-]+)*)-at-([^-]+)(\d+)$/);
        const location = urlMatch2?.[1]?.replace(/-/g, " ") || "India";
        const company = urlMatch2?.[2]?.replace(/-/g, " ") || "Company";
        if (!title || title.length < 3) continue;
        const fullUrl = `https://internshala.com${jobUrl}`;
        // Avoid duplicates with JSON-LD data
        if (jobs.some(j => j.applyUrl === fullUrl)) continue;
        jobs.push({
          id: `internshala-dh-${jobId}`,
          title,
          company: company.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          location: location.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          salary: "Not Disclosed",
          experience: "Entry Level",
          department: detectDepartment(title),
          workMode: location.toLowerCase().includes("work from home") || location.toLowerCase().includes("remote") ? "Remote" : "Office",
          jobType: empType === "job" ? "Full Time" : "Internship",
          postedDate: "",
          applyUrl: fullUrl,
          source: "internshala.com",
          scrapedAt: new Date().toISOString(),
        });
      }
    } catch { continue; }
  }
  return jobs;
}

// Source 24: More Arbeitnow pages
async function scrapeArbeitnowPages(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  for (let page = 2; page <= 5; page++) {
    try {
      const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?page=${page}`, {
        headers: { "User-Agent": nextUA(), Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.data || data.data.length === 0) break;
      for (const j of data.data) {
        const tags = j.tags ? j.tags.join(", ") : "";
        jobs.push({
          id: `arbeitnow-p${page}-${j.slug}`,
          title: j.title || "",
          company: j.company_name || "Multiple Companies",
          location: j.location || "Remote",
          salary: "Not Disclosed",
          experience: tags || "Check posting",
          department: detectDepartment(j.title || ""),
          workMode: j.remote ? "Remote" : (j.location?.toLowerCase().includes("remote") ? "Remote" : "Office"),
          jobType: "Full Time",
          postedDate: j.created_at || "",
          applyUrl: j.url || `https://www.arbeitnow.com/job/${j.slug}`,
          source: "arbeitnow.com",
          scrapedAt: new Date().toISOString(),
        });
      }
    } catch { break; }
  }
  return jobs;
}

// Source 25: More Himalayas pages
async function scrapeHimalayasPages(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  for (let page = 2; page <= 3; page++) {
    try {
      const res = await fetch(`https://himalayas.app/jobs/api?page=${page}`, {
        headers: { "User-Agent": nextUA(), Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.jobs || data.jobs.length === 0) break;
      for (const j of data.jobs) {
        const salary = j.salaryMin && j.salaryMax
          ? `${j.salaryCurrency || "$"} ${j.salaryMin.toLocaleString()} - ${j.salaryMax.toLocaleString()}`
          : "Not Disclosed";
        const tags = j.tags ? j.tags.join(", ") : "";
        jobs.push({
          id: `himalayas-p${page}-${j.id}`,
          title: j.title || "",
          company: j.companyName || j.company?.name || "Multiple Companies",
          location: j.location || "Remote",
          salary,
          experience: tags || "Check posting",
          department: detectDepartment(j.title || ""),
          workMode: j.remote ? "Remote" : "Office",
          jobType: "Full Time",
          postedDate: j.datePosted || "",
          applyUrl: `https://himalayas.app/jobs/${j.id}`,
          source: "himalayas.app",
          scrapedAt: new Date().toISOString(),
        });
      }
    } catch { break; }
  }
  return jobs;
}

// Source 26: More Jobicy pages
async function scrapeJobicyPages(): Promise<PrivateJob[]> {
  const jobs: PrivateJob[] = [];
  for (let page = 2; page <= 5; page++) {
    try {
      const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=50&page=${page}`, {
        headers: { "User-Agent": nextUA(), Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.jobs || data.jobs.length === 0) break;
      for (const j of data.jobs) {
        const salary = j.salaryMin && j.salaryMax
          ? `${j.salaryCurrency || "$"} ${j.salaryMin} - ${j.salaryMax} ${j.salaryPeriod || "yearly"}`
          : "Not Disclosed";
        jobs.push({
          id: `jobicy-p${page}-${j.id}`,
          title: j.jobTitle || "",
          company: j.companyName || "Multiple Companies",
          location: j.jobGeo || j.jobCity || "Remote",
          salary,
          experience: j.jobType || "Full Time",
          department: detectDepartment(j.jobTitle || ""),
          workMode: j.jobRemote === "true" ? "Remote" : "Hybrid",
          jobType: "Full Time",
          postedDate: j.pubDate || "",
          applyUrl: j.url || "",
          source: "jobicy.com",
          scrapedAt: new Date().toISOString(),
        });
      }
    } catch { break; }
  }
  return jobs;
}

function dedupJobs(jobs: PrivateJob[]): PrivateJob[] {
  const seen = new Set<string>();
  return jobs.filter((j) => {
    const key = `${j.title.toLowerCase().replace(/\s+/g, " ").trim()}|${j.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function scrapePrivateJobs(): Promise<{
  jobs: PrivateJob[];
  scrapedAt: string;
}> {
  const results = await Promise.allSettled([
    scrapeHimalayas(),
    scrapeArbeitnow(),
    scrapeJobicy(),
    scrapeRemoteOK(),
    scrapeLandingJobs(),
    scrapeLinkedInGuest(),
    scrapeInternshalaJobs(),
    scrapeInternshalaInternships(),
    scrapeInternshalaJsonLd(),
    scrapeHasjob(),
    scrapeDevtoJobs(),
    scrapeWellfoundGoogle(),
    scrapeArbeitnowPages(),
    scrapeHimalayasPages(),
    scrapeJobicyPages(),
    scrapeRemotive(),
    scrapeIndeedRSS(),
    scrapeFounditRSS(),
    scrapeShineRSS(),
    scrapeTimesJobsRSS(),
    scrapeNaukri(),
    scrapeIndeedIndia(),
    scrapeLinkedIn(),
    scrapeLinkedInRSS(),
    scrapeIndeedViaGoogle(),
    scrapeNaukriViaGoogle(),
  ]);

  let allJobs: PrivateJob[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") allJobs.push(...r.value);
  }

  allJobs = dedupJobs(allJobs);

  return {
    jobs: allJobs,
    scrapedAt: new Date().toISOString(),
  };
}
