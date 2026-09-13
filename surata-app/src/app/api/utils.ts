import { NextResponse } from "next/server";
import { MemoryCache } from "@/lib/utils/cache";

interface CachedHandlerOptions<T> {
  fetcher: () => Promise<T>;
  cacheDurationMs?: number;
  filterFn?: (data: T, searchParams: URLSearchParams) => T;
  transformFn?: (data: T, searchParams: URLSearchParams) => Record<string, unknown>;
}

export function createCachedHandler<T>(options: CachedHandlerOptions<T>) {
  const { fetcher, cacheDurationMs = 30 * 60 * 1000, filterFn, transformFn } = options;
  const cache = new MemoryCache<T>(cacheDurationMs);

  return async function GET(request: Request) {
    try {
      if (cache.isStale()) {
        const data = await fetcher();
        cache.set(data);
      }
    } catch (e) {
      console.error("Scrape failed:", e);
      const cached = cache.get();
      if (!cached) {
        return NextResponse.json({ error: "Scraping failed" }, { status: 503 });
      }
    }

    const data = cache.get();
    if (!data) {
      return NextResponse.json({ error: "No data available" }, { status: 503 });
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
