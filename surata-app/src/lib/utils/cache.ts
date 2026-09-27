interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Best-effort item count for the shapes this app caches: a bare array, or an
 * object containing arrays (all scrapers return one of those two).
 *
 * Returns -1 for anything unrecognisable so callers know to leave it alone
 * rather than applying a guard to data they cannot measure.
 */
export function countItems(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") {
    const arrays = Object.values(value).filter(Array.isArray) as unknown[][];
    if (arrays.length > 0) return arrays.reduce((n, a) => n + a.length, 0);
  }
  return -1;
}

export class MemoryCache<T> {
  private store: CacheEntry<T> | null = null;
  private duration: number;
  private pending: Promise<T> | null = null;

  constructor(durationMs: number) {
    this.duration = durationMs;
  }

  get(): T | null {
    if (!this.store) return null;
    return this.store.data;
  }

  set(data: T): void {
    this.store = { data, timestamp: Date.now() };
  }

  isStale(): boolean {
    if (!this.store) return true;
    return Date.now() - this.store.timestamp > this.duration;
  }

  /**
   * Stale-while-revalidate: returns cached data immediately if available.
   * Only blocks the caller when the cache is completely empty.
   */
  async getWithRevalidate(fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get();

    if (cached !== null && !this.isStale()) {
      return cached;
    }

    if (cached !== null) {
      // Serve stale immediately, refresh in background
      this.revalidateInBackground(fetcher);
      return cached;
    }

    // Cold cache — must block once
    return this.fetchOnce(fetcher);
  }

  private revalidateInBackground(fetcher: () => Promise<T>): void {
    if (this.pending) return;
    this.pending = this.fetchOnce(fetcher).finally(() => {
      this.pending = null;
    });
  }

  private async fetchOnce(fetcher: () => Promise<T>): Promise<T> {
    try {
      const data = await fetcher();
      const previous = this.get();

      if (previous !== null) {
        const before = countItems(previous);
        const after = countItems(data);
        if (before > 0 && after === 0) {
          // A scrape that "succeeds" while returning nothing is the failure
          // that emptied sections in the past. Holding the last good result
          // means a broken source degrades freshness, never coverage — and
          // re-stamping the entry retries on the next pass instead of
          // hammering the source on every request.
          console.warn(
            `[cache] refresh returned 0 items (had ${before}); keeping last good result`
          );
          this.set(previous);
          return previous;
        }
      }

      this.set(data);
      return data;
    } catch (e) {
      console.error("Cache revalidate failed:", e);
      const cached = this.get();
      if (cached !== null) return cached;
      throw e;
    }
  }
}

export function createRouteCache<T>(durationMs: number) {
  return new MemoryCache<T>(durationMs);
}
