import { NextResponse } from "next/server";
import { privateJobs, privateJobDepartments, privateJobLocations } from "../../data/privateJobs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const department = searchParams.get("department") || "All";
  const location = searchParams.get("location") || "All";
  const workMode = searchParams.get("workMode") || "All";

  let jobs = [...privateJobs];

  if (search) {
    const q = search.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (department !== "All") jobs = jobs.filter((j) => j.department === department);
  if (location !== "All") jobs = jobs.filter((j) => j.location.includes(location));
  if (workMode !== "All") jobs = jobs.filter((j) => j.workMode === workMode);

  return NextResponse.json({
    total: jobs.length,
    departments: privateJobDepartments,
    locations: privateJobLocations,
    lastUpdated: new Date().toISOString(),
    jobs,
  });
}
