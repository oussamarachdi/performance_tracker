import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  fetchSheetRows,
  fetchExpaApplicationPersonIds,
  fetchMembersInfo,
} from "@/lib/sheets/client";
import { aggregate } from "@/lib/sheets/aggregate";

async function getCachedDashboardData() {
  const [rows, expaPersonIds, memberDepartmentByName] = await Promise.all([
    fetchSheetRows(),
    fetchExpaApplicationPersonIds(),
    fetchMembersInfo(),
  ]);
  return aggregate(rows, expaPersonIds, memberDepartmentByName);
}

const CACHE_TAG = "dashboard-data";
const REVALIDATE_SECONDS = 60;

export async function GET() {
  try {
    const data = await unstable_cache(
      getCachedDashboardData,
      [CACHE_TAG],
      { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] }
    )();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load sheet data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
