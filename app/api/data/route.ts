import { NextResponse } from "next/server";
import {
  fetchSheetRows,
  fetchExpaApplicationPersonIds,
  fetchMembersInfo,
} from "@/lib/sheets/client";
import { aggregate } from "@/lib/sheets/aggregate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDashboardDataLive() {
  const [rows, expaPersonIds, memberDepartmentByName] = await Promise.all([
    fetchSheetRows(),
    fetchExpaApplicationPersonIds(),
    fetchMembersInfo(),
  ]);
  return aggregate(rows, expaPersonIds, memberDepartmentByName);
}

export async function GET() {
  try {
    const data = await getDashboardDataLive();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load sheet data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
