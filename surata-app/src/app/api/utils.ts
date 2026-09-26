import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { MemoryCache } from "@/lib/utils/cache";

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

  const sharedFetcher = cachedData(fetcher, cacheKey);
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
