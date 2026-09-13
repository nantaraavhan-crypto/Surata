interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class MemoryCache<T> {
  private store: CacheEntry<T> | null = null;
  private duration: number;

  constructor(durationMs: number) {
    this.duration = durationMs;
  }

  get(): T | null {
    if (!this.store) return null;
    if (Date.now() - this.store.timestamp > this.duration) {
      this.store = null;
      return null;
    }
    return this.store.data;
  }

  set(data: T): void {
    this.store = { data, timestamp: Date.now() };
  }

  getOrFetch(fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get();
    if (cached !== null) return Promise.resolve(cached);
    return fetcher().then((data) => {
      this.set(data);
      return data;
    });
  }

  isStale(): boolean {
    if (!this.store) return true;
    return Date.now() - this.store.timestamp > this.duration;
  }
}

export function createRouteCache<T>(durationMs: number) {
  return new MemoryCache<T>(durationMs);
}
