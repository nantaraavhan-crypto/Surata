import { unstable_cache } from "next/cache";

/**
 * Persists scraper results in Next's Data Cache.
 *
 * Serverless instances have their own memory, so a module-level cache is
 * thrown away whenever a request lands on a cold instance — which is why
 * responses were taking 10s. The Data Cache is shared across every instance
 * and survives cold starts, so the first request pays the scrape cost and
 * everyone after that is served from cache.
 *
 * `revalidate` is stale-while-revalidate: an expired entry is returned
 * immediately while a background refresh runs, so users never wait.
 */
export function cachedScrape<T>(
  key: string,
  fn: () => Promise<T>,
  revalidate = 60
): () => Promise<T> {
  return unstable_cache(fn, [`surata:${key}`], { revalidate });
}

/** Long-lived wrapper for scrapers whose sources change infrequently. */
export function cachedStaticScrape<T>(
  key: string,
  fn: () => Promise<T>,
  revalidate = 300
): () => Promise<T> {
  return cachedScrape(key, fn, revalidate);
}
