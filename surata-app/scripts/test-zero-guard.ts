/**
 * Proves a section cannot be wiped to zero by a source that starts failing.
 *
 * Simulates the exact sequence seen in production: a scrape returns good data,
 * the source breaks, and the next scrape "succeeds" while returning nothing.
 *
 *   npx tsx scripts/test-zero-guard.ts
 */
import { MemoryCache, countItems } from "../src/lib/utils/cache";

const GOOD = {
  internships: Array.from({ length: 60 }, (_, i) => ({ id: i, title: `Internship ${i}` })),
  scrapedAt: "2026-09-27T06:00:00.000Z",
};
const EMPTY = { internships: [], scrapedAt: "2026-09-27T06:05:00.000Z" };

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) {
    failures++;
    console.log(`      expected ${JSON.stringify(expected)}`);
    console.log(`      actual   ${JSON.stringify(actual)}`);
  }
}

// --- countItems --------------------------------------------------------
check("counts a bare array", countItems([1, 2, 3]), 3);
check("counts arrays inside an object", countItems(GOOD), 60);
check("counts an empty object's arrays as 0", countItems(EMPTY), 0);
check("returns -1 for a shape it cannot measure", countItems("not-an-array"), -1);

/**
 * `getWithRevalidate` answers immediately with stale data and refreshes on a
 * background promise — by design. Assertions about what the *refresh* did have
 * to wait for that promise, so this drains it before we look.
 */
async function flush(cache: MemoryCache<unknown>): Promise<void> {
  const pending = (cache as unknown as { pending: Promise<unknown> | null }).pending;
  if (pending) await pending;
}

async function run() {
  // --- MemoryCache: the last line of defence on a warm instance ---------
  const cache = new MemoryCache<typeof GOOD>(60 * 1000);

  const first = await cache.getWithRevalidate(async () => GOOD);
  check("first fetch returns good data", countItems(first), 60);

  // Force staleness so the next read actually re-scrapes. `-1` rather than
  // `0`: a zero-length window can still read as fresh if under a millisecond
  // has elapsed, which would skip the refresh entirely.
  (cache as unknown as { duration: number }).duration = -1;

  const duringOutage = await cache.getWithRevalidate(async () => EMPTY);
  check(
    "source dies: served last good result, not empty",
    countItems(duringOutage),
    60
  );
  check(
    "served result is the last good one (not the empty scrape)",
    duringOutage.scrapedAt,
    GOOD.scrapedAt
  );
  await flush(cache);

  check(
    "cache still holds non-empty data after the failed refresh",
    countItems(cache.get()),
    60
  );

  // --- Recovery: once the source works, fresh data must flow again ------
  const recovered = {
    internships: [{ id: 99, title: "New" }],
    scrapedAt: "2026-09-27T07:00:00.000Z",
  };
  await cache.getWithRevalidate(async () => recovered);
  await flush(cache);
  check(
    "recovery: fresh data replaces the snapshot",
    cache.get()?.scrapedAt,
    recovered.scrapedAt
  );

  // --- A thrown error (not an empty result) must also keep the data -----
  const onThrow = await cache.getWithRevalidate(async () => {
    throw new Error("source unreachable");
  });
  await flush(cache);
  check(
    "thrown error: served last good result",
    countItems(onThrow),
    1
  );
  check(
    "thrown error: cache still holds data afterwards",
    countItems(cache.get()),
    1
  );

  // --- Legitimately-measurable but unmeasurable shapes must pass through -
  const shapeCache = new MemoryCache<string>(60 * 1000);
  const passthrough = await shapeCache.getWithRevalidate(async () => "plain string");
  check(
    "unmeasurable shape passes through untouched",
    passthrough,
    "plain string"
  );

  console.log(
    failures === 0
      ? "\nAll checks passed."
      : `\n${failures} check(s) FAILED.`
  );
  process.exit(failures === 0 ? 0 : 1);
}

run();
