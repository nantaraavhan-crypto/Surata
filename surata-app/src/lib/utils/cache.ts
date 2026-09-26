interface CacheEntry<T> {
  data: T;
  timestamp: number;
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
