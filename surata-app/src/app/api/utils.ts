import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { MemoryCache, countItems } from "@/lib/utils/cache";

/**
 * How long a shared snapshot is trusted before the next reader re-scrapes.
 *
 * This is deliberately much longer than the per-instance memory TTL below.
 * The Data Cache is the only cold-start safety net available, and Next
 * *blocks* on an expired entry rather than serving it stale — so if it
 * expired as often as the memory cache, every request landing on a fresh
 * instance would wait out a full scrape (measured at 4-17s in production).
 *
 * With a 5-minute window, a visitor only pays that cost after roughly five
 * minutes of complete silence; warm instances keep the snapshot refreshed in
 * the background well before then.
 */
export const SHARED_REVALIDATE_SECONDS = 300;

/**
 * How long the "last good" snapshot is trusted before it re-scrapes.
 *
 * Long on purpose: during an outage this is the only content left to serve,
 * and it must outlive a source that has stopped responding. Twenty-four
 * hours of stale-but-real beats an empty section, and the cron's low-count
 * alert will have long since fired by then.
 */
const LAST_GOOD_REVALIDATE_SECONDS = 60 * 60 * 24;

interface CachedHandlerOptions<T> {
  fetcher: () => Promise<T>;
  cacheDurationMs?: number;
  /** Stable Data Cache key. Defaults to the fetcher's function name. */
  cacheKey?: string;
  filterFn?: (data: T, searchParams: URLSearchParams) => T;
  transformFn?: (data: T, searchParams: URLSearchParams) => Record<string, unknown>;
}

/**
 * Returns a fetcher backed by Next's Data Cache.
 *
 * The Data Cache persists across serverless invocations and survives cold
 * starts, so a request landing on a fresh instance does not pay the full
 * scrape cost again.
 *
 * Both the API routes, `/api/health`, and the cron call this with the same
 * function reference, so all three read one shared entry rather than
 * scraping separately.
 *
 * This deliberately holds **ground truth** and never substitutes anything.
 * The health check and cron count what came back so an empty section
 * actually trips the alert — see `cachedDataWithFallback` for the variant
 * the public routes serve.
 */
export function cachedData<T>(
  fetcher: () => Promise<T>,
  cacheKey?: string
): () => Promise<T> {
  const key = cacheKey || fetcher.name;
  if (!key) {
    throw new Error("cachedData requires a cacheKey for an anonymous fetcher");
  }

  return unstable_cache(fetcher, [`surata:${key}`], {
    revalidate: SHARED_REVALIDATE_SECONDS,
  });
}

/**
 * What the public routes serve: `cachedData`'s ground truth, falling back to
 * the most recent non-empty result when a source stops producing content.
 *
 * Two entries, deliberately:
 *
 * - The primary one re-scrapes every few minutes and holds whatever the
 *   source actually returned — including nothing. Health reads this.
 * - `lastSeen` re-scrapes only once a day but is *read* on every primary
 *   revalidation, which keeps it warm while things are healthy. During an
 *   outage it still holds real content from some point in the last 24 hours,
 *   so there is something to show instead of an empty section.
 *
 * A plain in-memory fallback would not cover the case that matters most: a
 * cold instance landing on an expired entry after a quiet spell has no
 * history of its own, so the fallback has to be shared. Substituting here
 * costs a section some freshness; it never costs coverage.
 */
export function cachedDataWithFallback<T>(
  fetcher: () => Promise<T>,
  cacheKey?: string
): () => Promise<T> {
  const key = cacheKey || fetcher.name;
  if (!key) {
    throw new Error("cachedData requires a cacheKey for an anonymous fetcher");
  }

  const truth = cachedData(fetcher, key);

  // Most recent non-empty result this process has seen. Its only job is to
  // seed the snapshot below: without it, a snapshot refresh that happens to
  // land mid-outage would store the empty result and destroy the one thing
  // meant to survive the outage.
  let lastGood: T | undefined;

  // Durable, cross-instance copy of the last good result.
  //
  // Its function reads `truth()` rather than scraping again, so refreshing it
  // costs a cache read — `truth()` has always been awaited first, so it is
  // already warm by the time this runs. It is also *called* on every healthy
  // request, which is what keeps its 24-hour clock from quietly running out
  // during a long quiet spell right before a source goes down.
  const snapshot = unstable_cache(
    async () => {
      const current = await truth();
      if (countItems(current) > 0) return current;
      if (lastGood !== undefined) return lastGood;
      return current;
    },
    [`surata:snapshot:${key}`],
    { revalidate: LAST_GOOD_REVALIDATE_SECONDS }
  );

  return async () => {
    const result = await truth();
    const current = countItems(result);

    if (current > 0) {
      lastGood = result;
      // Keep the durable snapshot warm while the source is known good, so an
      // outage begins with a snapshot that is at most a day old rather than
      // an expired one that has to be rebuilt from a broken source.
      await snapshot().catch(() => undefined);
      return result;
    }

    // Only substitute when we positively measured an empty result. A shape
    // `countItems` cannot measure (-1) is left alone rather than swapped out
    // for older data that may well be worse.
    if (current !== 0) return result;

    // Warm instance: the answer is already in this process, and asking the
    // snapshot here would risk refreshing it mid-outage with the same empty
    // result and wiping the one fallback that is meant to survive.
    if (lastGood !== undefined && countItems(lastGood) > 0) {
      console.warn(
        `[cache] ${key} returned 0 items; serving in-process last good result (${countItems(lastGood)})`
      );
      return lastGood;
    }

    // Cold instance: fall back to the durable snapshot written while things
    // were still healthy.
    const previous = await snapshot().catch(() => undefined);
    if (previous !== undefined && countItems(previous) > 0) {
      console.warn(
        `[cache] ${key} returned 0 items; serving last good snapshot (${countItems(previous)})`
      );
      return previous;
    }

    // Nothing to fall back to — a section that has genuinely never had
    // content still has to reach the health check as an empty result.
    return result;
  };
}

/**
 * Two cache layers:
 *
 * 1. `MemoryCache` sits in front with stale-while-revalidate, so an expired
 *    entry is returned immediately while the refresh runs in the background.
 *    This is what keeps warm instances instant.
 * 2. `cachedData` (Next's Data Cache) persists across serverless invocations
 *    and survives cold starts, so a fresh instance reads a shared snapshot
 *    instead of scraping again.
 *
 * Together they keep the first response after a deploy fast and every
 * subsequent response effectively instant.
 */
export function createCachedHandler<T>(options: CachedHandlerOptions<T>) {
  const {
    fetcher,
    cacheDurationMs = 60 * 1000,
    cacheKey,
    filterFn,
    transformFn,
  } = options;

  const sharedFetcher = cachedDataWithFallback(fetcher, cacheKey);
  const cache = new MemoryCache<T>(cacheDurationMs);

  return async function GET(request: Request) {
    let data: T;
    try {
      data = await cache.getWithRevalidate(sharedFetcher);
    } catch (e) {
      console.error("Scrape failed:", e);
      return NextResponse.json({ error: "Scraping failed" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);

    let result: unknown = data;
    if (filterFn) {
      result = filterFn(data, searchParams);
    }
    if (transformFn) {
      return NextResponse.json(transformFn(result as T, searchParams));
    }

    return NextResponse.json(result);
  };
}
