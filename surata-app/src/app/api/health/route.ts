import { NextResponse } from "next/server";
import { MemoryCache } from "@/lib/utils/cache";

interface HealthStatus {
  status: "healthy" | "degraded" | "down";
  timestamp: string;
  uptime: number;
  version: string;
  scrapers: Record<string, {
    lastCheck: string | null;
    lastSuccess: string | null;
    consecutiveFailures: number;
    status: "ok" | "failing" | "unknown";
  }>;
}

const scraperHealth: Record<string, {
  lastCheck: string | null;
  lastSuccess: string | null;
  consecutiveFailures: number;
}> = {};

export function recordScraperHealth(name: string, success: boolean): void {
  if (!scraperHealth[name]) {
    scraperHealth[name] = { lastCheck: null, lastSuccess: null, consecutiveFailures: 0 };
  }
  const now = new Date().toISOString();
  scraperHealth[name].lastCheck = now;
  if (success) {
    scraperHealth[name].consecutiveFailures = 0;
    scraperHealth[name].lastSuccess = now;
  } else {
    scraperHealth[name].consecutiveFailures++;
  }
}

const startTime = Date.now();

export async function GET() {
  const scrapers = Object.entries(scraperHealth).map(([name, info]) => ({
    name,
    ...info,
    status: info.consecutiveFailures === 0
      ? (info.lastSuccess ? "ok" : "unknown")
      : info.consecutiveFailures >= 3
        ? "failing"
        : "ok" as "ok" | "failing" | "unknown",
  }));

  const failingCount = scrapers.filter((s) => s.status === "failing").length;
  const status: HealthStatus["status"] = failingCount === 0
    ? "healthy"
    : failingCount < scrapers.length
      ? "degraded"
      : "down";

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: "0.1.0",
    scrapers: Object.fromEntries(
      scrapers.map((s) => [s.name, {
        lastCheck: s.lastCheck,
        lastSuccess: s.lastSuccess,
        consecutiveFailures: s.consecutiveFailures,
        status: s.status,
      }])
    ),
  });
}
