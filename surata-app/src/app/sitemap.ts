import type { MetadataRoute } from "next";

const SITE = "https://surata.vercel.app";

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/**
 * Every page is statically rendered, so a sitemap can be generated at build
 * time. Section pages carry the highest priority because they are where
 * search traffic should land.
 */
const ROUTES: { path: string; priority: number; changeFrequency: ChangeFrequency }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/government-jobs", priority: 0.9, changeFrequency: "daily" },
  { path: "/private-jobs", priority: 0.9, changeFrequency: "daily" },
  { path: "/internships", priority: 0.9, changeFrequency: "daily" },
  { path: "/scholarships", priority: 0.9, changeFrequency: "weekly" },
  { path: "/results", priority: 0.9, changeFrequency: "daily" },
  { path: "/admit-cards", priority: 0.9, changeFrequency: "daily" },
  { path: "/answer-keys", priority: 0.8, changeFrequency: "daily" },
  { path: "/government-exams", priority: 0.8, changeFrequency: "weekly" },
  { path: "/news", priority: 0.8, changeFrequency: "daily" },
  { path: "/current-affairs", priority: 0.7, changeFrequency: "daily" },
  { path: "/college", priority: 0.7, changeFrequency: "weekly" },
  { path: "/iits-iims", priority: 0.7, changeFrequency: "weekly" },
  { path: "/placements", priority: 0.7, changeFrequency: "weekly" },
  { path: "/companies", priority: 0.6, changeFrequency: "weekly" },
  { path: "/eligibility", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tracker", priority: 0.6, changeFrequency: "monthly" },
  { path: "/ai-tools", priority: 0.6, changeFrequency: "monthly" },
  { path: "/search", priority: 0.5, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Fixed at build time rather than per-request: these pages are static, and
  // a build timestamp is an honest signal of when the shell last changed.
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${SITE}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
