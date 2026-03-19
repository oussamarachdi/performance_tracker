import type { Member, University, Product, CampaignData } from "@/lib/mockData";
import { mockData } from "@/lib/mockData";

export interface DashboardData {
  members: Member[];
  universities: University[];
  products: Product[];
  departments: {
    id: string;
    name: string;
    signups: number;
    leads: number;
    contacted: number;
    interested: number;
    applied: number;
    conversionRate: number;
  }[];
  campaignMetrics: CampaignData[];
  totals: {
    signups: number;
    leads: number;
    contacted: number;
    interested: number;
    applied: number;
    /** Rows where account status = "already exists with this email" */
    alreadyExists?: number;
  };
  conversionRate: number;
}

/**
 * Fetches dashboard data from the API. Falls back to mockData when:
 * - NEXT_PUBLIC_USE_LIVE_DATA is not 'true', or
 * - The API request fails (e.g. no sheet configured, network error).
 */
export async function getDashboardData(): Promise<DashboardData> {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_LIVE_DATA !== "true") {
    return mockData as DashboardData;
  }
  try {
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
    const data = (await res.json()) as DashboardData;
    return data;
  } catch {
    return mockData as DashboardData;
  }
}
