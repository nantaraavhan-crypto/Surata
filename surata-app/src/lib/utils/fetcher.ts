const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

const DEFAULT_HEADERS = {
  "User-Agent": DEFAULT_UA,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

interface FetchOptions {
  timeout?: number;
  referer?: string;
  revalidate?: number;
  headers?: Record<string, string>;
}

export async function safeFetch(
  url: string,
  opts: FetchOptions = {}
): Promise<string | null> {
  const { timeout = 15000, referer, revalidate = 900, headers = {} } = opts;
  try {
    const res = await fetch(url, {
      headers: {
        ...DEFAULT_HEADERS,
        ...(referer ? { Referer: referer } : {}),
        ...headers,
      },
      signal: AbortSignal.timeout(timeout),
      next: { revalidate },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function safeFetchWithRetry(
  url: string,
  opts: FetchOptions & { retries?: number; retryDelay?: number } = {}
): Promise<string | null> {
  const { retries = 2, retryDelay = 1000, ...fetchOpts } = opts;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const html = await safeFetch(url, fetchOpts);
    if (html) return html;
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, retryDelay * (attempt + 1)));
    }
  }
  return null;
}

export function resolveUrl(href: string, base: string): string {
  if (href.startsWith("http")) return href;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${normalizedBase}${href.startsWith("/") ? "" : "/"}${href}`;
}
