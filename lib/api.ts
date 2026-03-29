import type { DashboardResponse } from "@/lib/mockData";
import { mockData } from "@/lib/mockData";

export type { DashboardResponse as DashboardData };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Fetches dashboard data from the external Express backend.
 * Falls back to mockData when the backend is unreachable.
 */
export async function getDashboardData(): Promise<DashboardResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/data`, { cache: "no-store" });
    if (!res.ok) throw new Error(res.statusText);
    return (await res.json()) as DashboardResponse;
  } catch {
    return mockData;
  }
}
