/**
 * Warms every API route after a deploy.
 *
 * A deploy leaves the shared snapshot older than its 5-minute window, so the
 * first visitor of each endpoint would otherwise pay the full scrape
 * (measured at 4-15s). Warming here moves that cost to the deploy itself,
 * where nobody is waiting.
 *
 * Run automatically by `npm run deploy`, or standalone: node scripts/warm.mjs
 */

const BASE = process.env.SITE_URL || "https://surata.vercel.app";

const ENDPOINTS = [
  "/api/jobs",
  "/api/live",
  "/api/liveInternships",
  "/api/liveScholarships",
  "/api/liveHackathons",
  "/api/livePrivateJobs",
  "/api/allJobs",
  "/api/sarkari",
  "/api/updates",
  "/api/iits-iims",
  "/api/official",
  "/api/search?q=engineer",
  "/api/health",
];

// Independent requests, so run them together rather than waiting in sequence.
async function warm(path) {
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: AbortSignal.timeout(60_000),
      cache: "no-store",
    });
    const ms = Date.now() - started;
    const ok = res.ok;
    return { path, ms, ok, status: res.status };
  } catch (error) {
    return {
      path,
      ms: Date.now() - started,
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const results = await Promise.all(ENDPOINTS.map(warm));

let failed = 0;
for (const r of results) {
  const flag = r.ok ? " " : "!";
  if (!r.ok) failed++;
  console.log(`${flag} ${r.path.padEnd(30)} ${String(r.status).padEnd(4)} ${r.ms}ms`);
}

const slowest = Math.max(...results.map((r) => r.ms));
console.log(`\nWarmed ${results.length} endpoints, slowest ${slowest}ms, ${failed} failed.`);

if (failed > 0) {
  console.error("Some endpoints did not respond successfully.");
  process.exitCode = 1;
}
