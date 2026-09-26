import { NextResponse } from "next/server";
import { runHealthCheck, notifyIfDegraded, type HealthReport } from "@/lib/health";

// A full check reads every section through the Data Cache. On a warm cache
// that is milliseconds; on a cold one it pays the scrape, so allow headroom
// rather than getting killed partway through.
export const maxDuration = 60;

export const dynamic = "force-dynamic";

async function check(): Promise<HealthReport> {
  const report = await runHealthCheck();
  // Fire-and-forget: the webhook must never delay the response.
  void notifyIfDegraded(report);
  return report;
}

export async function GET() {
  try {
    const report = await check();
    return NextResponse.json(report, {
      status: report.status === "ok" ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        checkedAt: new Date().toISOString(),
        slowestMs: 0,
        sections: [],
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
