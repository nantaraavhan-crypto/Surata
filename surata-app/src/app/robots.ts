import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API routes are JSON for the site's own client; crawling them would
        // only waste the crawl budget meant for the actual pages.
        disallow: ["/api/", "/search?"],
      },
    ],
    sitemap: "https://surata.vercel.app/sitemap.xml",
  };
}
