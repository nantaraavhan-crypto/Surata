import { NextResponse } from "next/server";
import { internships } from "../../data/internships";
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  let items = [...internships];

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.company.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    total: items.length,
    lastUpdated: new Date().toISOString(),
    internships: items,
  });
}
