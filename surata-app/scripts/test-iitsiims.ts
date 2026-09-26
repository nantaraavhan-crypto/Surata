import { scrapeIITIIMNews } from "../src/lib/iitsIimsScraper";

async function main() {
  const start = Date.now();
  const { news } = await scrapeIITIIMNews();
  const ms = Date.now() - start;

  console.log(`total=${news.length}  in ${ms}ms\n`);

  const bySource = new Map<string, number>();
  const byInstitute = new Map<string, number>();
  for (const n of news) {
    bySource.set(n.source, (bySource.get(n.source) || 0) + 1);
    byInstitute.set(n.institute, (byInstitute.get(n.institute) || 0) + 1);
  }

  console.log("by source:");
  [...bySource.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([s, c]) => console.log(`   ${String(c).padStart(4)}  ${s}`));

  console.log("\ntop institutes:");
  [...byInstitute.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .forEach(([s, c]) => console.log(`   ${String(c).padStart(4)}  ${s}`));

  console.log("\nsample:");
  news.slice(0, 6).forEach((n) => console.log(`   [${n.type}] ${n.institute} — ${n.title.slice(0, 70)}`));
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exitCode = 1;
});
