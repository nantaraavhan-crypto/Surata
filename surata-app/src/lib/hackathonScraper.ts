import * as cheerio from "cheerio";
import { safeFetch, resolveUrl } from "./utils/fetcher";
import { dedupByTitle } from "./utils/dedup";
import type { Hackathon } from "@/types";

const SOURCES = [
  {
    name: "devfolio" as const,
    url: "https://devfolio.co/hackathons",
    referer: "https://devfolio.co/",
    baseUrl: "https://devfolio.co",
    selector: "div.hackathon-card, .hackathonCard, .card",
    titleSelector: "h3 a, h4 a, .hackathon-name a, a.card-title",
    orgSelector: ".organizer, .org-name, .host",
    prizeSelector: ".prize, .prize-pool, .reward",
    dateSelector: ".date, .timeline, .hackathon-date",
    mode: "Online/Hybrid",
  },
  {
    name: "mlh" as const,
    url: "https://mlh.io/seasons/2026/events",
    referer: "https://mlh.io/",
    baseUrl: "https://mlh.io",
    selector: "div.event-box, .event-card, .event",
    titleSelector: "h3 a, .event-name a, a.event-link",
    orgSelector: ".organizer, .event-organizer",
    prizeSelector: ".prize, .prize-amount",
    dateSelector: ".date, .event-date, .event-date-range",
    mode: "Online/In-Person",
  },
  {
    name: "hackerearth" as const,
    url: "https://www.hackerearth.com/challenges/",
    referer: "https://www.hackerearth.com/",
    baseUrl: "https://www.hackerearth.com",
    selector: "div.challenge-card, .event-card, .challenge-listing",
    titleSelector: "a.challenge-title, h3 a, .event-name a",
    orgSelector: ".organizer, .host-name",
    prizeSelector: ".prize, .prize-pool",
    dateSelector: ".date, .challenge-date",
    mode: "Online",
  },
  {
    name: "unstop" as const,
    url: "https://unstop.com/hackathons",
    referer: "https://unstop.com/",
    baseUrl: "https://unstop.com",
    selector: "div.hackathon-card, .competition-card, .card",
    titleSelector: "h3 a, h4 a, .title a, a.competition-title",
    orgSelector: ".organizer, .company-name, .host",
    prizeSelector: ".prize, .prize-pool, .reward",
    dateSelector: ".date, .deadline, .end-date",
    mode: "Online/Hybrid",
  },
  {
    name: "devpost" as const,
    url: "https://devpost.com/hackathons",
    referer: "https://devpost.com/",
    baseUrl: "https://devpost.com",
    selector: "div.hackathon-tile, .submission-tile, .challenge-tile",
    titleSelector: "h3 a, .hackathon-name a, a.tile-title",
    orgSelector: ".organizer, .host",
    prizeSelector: ".prize, .prize-amount",
    dateSelector: ".date, .deadline",
    mode: "Online",
  },
];

async function scrapeSource(
  source: (typeof SOURCES)[number]
): Promise<Hackathon[]> {
  const html = await safeFetch(source.url, { referer: source.referer });
  if (!html) return [];

  const $ = cheerio.load(html);
  const hackathons: Hackathon[] = [];

  $(source.selector).each((_, el) => {
    const titleEl = $(el).find(source.titleSelector).first();
    const title = titleEl.text().trim();
    const href = titleEl.attr("href") || "";
    if (!title || title.length < 5) return;

    const organizer = $(el).find(source.orgSelector).first().text().trim();
    const prize = $(el).find(source.prizeSelector).first().text().trim();
    const date = $(el).find(source.dateSelector).first().text().trim();
    const url = resolveUrl(href, source.baseUrl);

    hackathons.push({
      id: `${source.name}-${Buffer.from(url).toString("base64").slice(0, 40)}`,
      title,
      organizer: organizer || "Community",
      prize: prize || "Prizes Worth",
      deadline: date || "Check website",
      date: date || "TBA",
      mode: source.mode,
      url,
      source: new URL(source.baseUrl).hostname,
      scrapedAt: new Date().toISOString(),
    });
  });

  return hackathons;
}

export async function scrapeHackathons(): Promise<{
  hackathons: Hackathon[];
  scrapedAt: string;
}> {
  const results = await Promise.allSettled(SOURCES.map(scrapeSource));

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
