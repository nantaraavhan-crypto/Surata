/**
 * Refreshes every section of the live site, then verifies what came back.
 *
 * Designed to be run on a schedule by CI (`.github/workflows/refresh.yml`).
 * Each request that lands on an endpoint whose shared snapshot has aged past
 * its five-minute window forces a real re-scrape server-side — so a machine
 * parked on this loop keeps the data continuously fresh with nothing running
 * on anyone's desktop.
 *
 * It also does the alerting job for free: if any section falls below its
 * expected minimum, this exits non-zero, which fails the CI run, which makes
 * GitHub email the repository owner. No webhook to create, no service to
 * sign up for.
 *
 *   node scripts/refresh.mjs
 */

const BASE = process.env.SITE_URL || "https://surata.vercel.app";

// Kept in sync with scripts/warm.mjs — hitting these is what drives refresh.
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
];

async function hit(path) {
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: AbortSignal.timeout(90_000),
      cache: "no-store",
    });
    return {
      path,
      ms: Date.now() - started,
      status: res.status,
      ok: res.ok,
    };
  } catch (error) {
    return {
      path,
      ms: Date.now() - started,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Parallel: sequentially these would take minutes, and the whole point is that
// one CI minute should refresh everything at once.
const results = await Promise.all(ENDPOINTS.map(hit));

let endpointFailures = 0;
for (const r of results) {
  if (!r.ok) endpointFailures++;
  console.log(
    `${r.ok ? " " : "!"} ${r.path.padEnd(30)} ${String(r.status).padEnd(4)} ${r.ms}ms`
  );
}

const slowest = Math.max(...results.map((r) => r.ms));
console.log(
  `\nRefreshed ${results.length} endpoints, slowest ${slowest}ms, ${endpointFailures} failed.\n`
);

// --- Verify what is actually being served ---------------------------------
let degraded = 0;
let health;
try {
  const res = await fetch(`${BASE}/api/health`, {
    signal: AbortSignal.timeout(90_000),
    cache: "no-store",
  });
  health = await res.json();
} catch (error) {
  console.error(
    `Health check unreachable: ${error instanceof Error ? error.message : error}`
  );
  process.exit(1);
}

console.log(`Health: ${health.status}`);

const lines = [];
for (const s of health.sections ?? []) {
  const ok = s.status === "ok";
  if (!ok) degraded++;
  console.log(
    `${ok ? " " : "!"} ${s.label.padEnd(42)} ${String(s.count).padStart(5)} / min ${s.minimum}  ${s.status}`
  );
  lines.push(
    `- ${ok ? "" : "**"}${s.label}: ${s.count}${ok ? "" : ` (expected ${s.minimum}+) **`}`
  );
}

// Surface it in the CI run page as well as the log.
if (process.env.GITHUB_STEP_SUMMARY) {
  const { writeFileSync } = await import("node:fs");
  const icon = health.status === "ok" ? "✅" : "⚠️";
  writeFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `# ${icon} Data refresh — ${health.status}\n\n` +
      `Checked at ${health.checkedAt}\n\n` +
      `| Section | Items | Minimum |\n|---|---:|---:|\n` +
      (health.sections ?? [])
        .map((s) => `| ${s.label} | ${s.count} | ${s.minimum} |`)
        .join("\n") +
      `\n`
  );
}

if (endpointFailures > 0) {
  console.error(`\n${endpointFailures} endpoint(s) did not respond successfully.`);
}

if (degraded > 0) {
  console.error(
    `\n${degraded} section(s) below their expected minimum:\n${lines.join("\n")}`
  );
}

if (endpointFailures > 0 || degraded > 0 || health.status !== "ok") {
  console.error("\nRefresh FAILED.");
  process.exit(1);
}

console.log("\nRefresh OK — all sections populated.");
