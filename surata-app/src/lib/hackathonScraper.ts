import * as cheerio from "cheerio";
import { safeFetch } from "./utils/fetcher";
import { dedupByTitle } from "./utils/dedup";
import type { Hackathon } from "@/types";

function formatDate(iso: string): string {
  if (!iso) return "TBA";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBA";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateRange(startIso: string, endIso: string): string {
  const start = formatDate(startIso);
  const end = formatDate(endIso);
  if (start === "TBA") return "TBA";
  if (end === "TBA" || start === end) return start;
  return `${start} - ${end}`;
}

function daysLeft(iso: string): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return -1;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

interface DevfolioHackathon {
  uuid: string;
  slug: string;
  name: string;
  starts_at: string;
  ends_at: string;
  is_online: boolean;
  settings?: { reg_ends_at?: string };
  participants_count?: number;
}

/**
 * Devfolio ships its listings in `__NEXT_DATA__` rather than in markup — the
 * CSS classes the old scraper targeted do not exist on their site. Reading the
 * JSON payload is both reliable and far cheaper than parsing 180KB of HTML.
 */
async function scrapeDevfolio(): Promise<Hackathon[]> {
  const html = await safeFetch("https://devfolio.co/hackathons", {
    referer: "https://devfolio.co/",
  });
  if (!html) return [];

  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!match) return [];

  let payload: DevfolioHackathon[] = [];
  try {
    const parsed = JSON.parse(match[1]);
    const data =
      parsed?.props?.pageProps?.dehydratedState?.queries?.[0]?.state?.data;
    const source: DevfolioHackathon[] = [
      ...(data?.open_hackathons || []),
      ...(data?.upcoming_hackathons || []),
    ];
    payload = source;
  } catch {
    return [];
  }

  const now = Date.now();

  return payload
    .filter((h) => new Date(h.ends_at).getTime() > now)
    .map((h) => {
      const url = `https://devfolio.co/hackathons/${h.slug}`;
      const deadline = h.settings?.reg_ends_at || h.ends_at;
      return {
        id: `devfolio-${h.uuid}`,
        title: h.name,
        url,
        organizer: h.is_online ? "Online" : "In-Person",
        prize: h.participants_count
          ? `${h.participants_count}+ participants`
          : "Open for registration",
        deadline: formatDate(deadline),
        date: formatDateRange(h.starts_at, h.ends_at),
        mode: h.is_online ? "Online" : "Hybrid",
        source: "devfolio",
        scrapedAt: new Date().toISOString(),
      } satisfies Hackathon;
    });
}

/**
 * MLH marks every event up with schema.org `Event` properties, so the title,
 * dates and attendance mode are readable straight from the markup. Their
 * previous Tailwind class selectors never matched.
 */
async function scrapeMLH(season = "2026"): Promise<Hackathon[]> {
  const html = await safeFetch(`https://mlh.io/seasons/${season}/events`, {
    referer: "https://mlh.io/",
  });
  if (!html) return [];

  const $ = cheerio.load(html);
  const hackathons: Hackathon[] = [];

  $('a[itemType="https://schema.org/Event"]').each((_, el) => {
    const url = ($(el).attr("href") || "").split("?")[0];
    const name = $(el).find("h4").first().text().trim();
    const start = $(el).find('meta[itemProp="startDate"]').attr("content") || "";
    const end = $(el).find('meta[itemProp="endDate"]').attr("content") || "";
    const mode = $(el).find('meta[itemProp="eventAttendanceMode"]').attr("content") || "";

    if (!name || !url) return;

    const locationLine = $(el)
      .find('div[itemProp="location"] span[itemProp="name"]')
      .first()
      .text()
      .trim();

    const isOnline = mode.includes("OnlineEvent");
    const countdown = daysLeft(start);

    hackathons.push({
      id: `mlh-${Buffer.from(url).toString("base64").slice(0, 40)}`,
      title: name,
      url,
      organizer: isOnline ? "Online" : locationLine || "In-Person",
      prize: "Hackathon",
      deadline: countdown >= 0 ? `${countdown} days left` : "TBA",
      date: formatDateRange(start, end),
      mode: isOnline ? "Online" : "In-Person",
      source: "mlh",
      scrapedAt: new Date().toISOString(),
    });
  });

  return hackathons;
}

/**
 * Codeforces publishes a public JSON API, so this one needs no HTML parsing
 * at all — the most reliable feed in the file. It returns the full contest
 * history; only the ones still ahead of us are useful here.
 */
async function scrapeCodeforces(): Promise<Hackathon[]> {
  const html = await safeFetch("https://codeforces.com/api/contest.list?gym=false", {
    referer: "https://codeforces.com/",
    headers: { Accept: "application/json" },
    timeout: 8000,
  });
  if (!html) return [];

  interface CFContest {
    id: number;
    name: string;
    phase: string;
    startTimeSeconds: number;
    durationSeconds: number;
    type?: string;
  }

  let payload: { status?: string; result?: CFContest[] };
  try {
    payload = JSON.parse(html);
  } catch {
    return [];
  }
  if (payload.status !== "OK" || !Array.isArray(payload.result)) return [];

  const now = Date.now();

  return payload.result
    .filter((c) => c.phase === "BEFORE" && c.startTimeSeconds * 1000 > now)
    .slice(0, 30)
    .map((c) => {
      const start = c.startTimeSeconds * 1000;
      const end = start + c.durationSeconds * 1000;
      const countdown = Math.ceil((start - now) / 86_400_000);
      const hours = Math.round(c.durationSeconds / 3600);

      return {
        id: `cf-${c.id}`,
        title: c.name,
        url: `https://codeforces.com/contest/${c.id}`,
        organizer: "Codeforces",
        prize: `${hours} hr ${c.type === "CF" ? "rated" : "gym"} contest`,
        deadline: countdown === 0 ? "Starts today" : `In ${countdown} days`,
        date: formatDateRange(new Date(start).toISOString(), new Date(end).toISOString()),
        mode: "Online",
        source: "codeforces",
        scrapedAt: new Date().toISOString(),
      } satisfies Hackathon;
    });
}

/** HackerEarth is a client-rendered SPA; its card markup never reaches us. */
async function scrapeHackerEarth(): Promise<Hackathon[]> {
  const html = await safeFetch("https://www.hackerearth.com/challenges/", {
    referer: "https://www.hackerearth.com/",
  });
  if (!html) return [];

  const $ = cheerio.load(html);
  const hackathons: Hackathon[] = [];

  $("a").each((_, el) => {
    const href = ($(el).attr("href") || "").split("?")[0];
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!href.includes("/challenges/") || text.length < 6 || text.length > 140) return;

    hackathons.push({
      id: `he-${Buffer.from(href).toString("base64").slice(0, 40)}`,
      title: text,
      url: href.startsWith("http") ? href : `https://www.hackerearth.com${href}`,
      organizer: "Online",
      prize: "Coding Challenge",
      deadline: "Check website",
      date: "TBA",
      mode: "Online",
      source: "hackerearth",
      scrapedAt: new Date().toISOString(),
    });
  });

  return hackathons;
}

export async function scrapeHackathons(): Promise<{
  hackathons: Hackathon[];
  scrapedAt: string;
}> {
  const results = await Promise.allSettled([
    scrapeDevfolio(),
    scrapeMLH(),
    scrapeCodeforces(),
    scrapeHackerEarth(),
  ]);

  let all: Hackathon[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  all = dedupByTitle(all);

  return {
    hackathons: all,
    scrapedAt: new Date().toISOString(),
  };
}
