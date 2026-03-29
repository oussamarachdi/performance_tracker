// ──────────────────────────────────────────────────────────────────────────────
// Data types — your Express backend GET /api/data must return this exact shape.
// ──────────────────────────────────────────────────────────────────────────────

export interface DailyMetric {
  date: string;       // "YYYY-MM-DD"
  signups: number;
  leads: number;
  contacted: number;
  interested: number;
  applied: number;
}

export interface Member {
  id: string;                    // URL-safe slug of the name
  name: string;                  // Full name, e.g. "Malek Elfahem"
  department: string;            // e.g. "MKT", "OGTa", "BD"
  signups: number;
  leads: number;
  contacted: number;
  interested: number;
  applied: number;               // COUNT of unique Expa Person IDs attributed to this member
  conversionRate: number;        // (applied / signups) * 100
  boothsAttended: number;       // How many booth-days this member worked
  dailyMetrics: DailyMetric[];   // Per-day breakdown (can be empty [])
  universitiesVisited: string[]; // Array of university slugs (id values)
  productsPromoted: string[];    // Array of product slugs (id values)
  universityBreakdown?: { id: string; name: string; signups: number }[];
  productBreakdown?: { id: string; name: string; signups: number }[];
}

export interface University {
  id: string;           // URL-safe slug, e.g. "isgs-sousse"
  name: string;         // Full name
  location: string;     // City/region (can be "")
  signups: number;
  leads: number;
  contacted: number;
  interested: number;
  applied: number;
  conversionRate: number; // (applied / signups) * 100
  dailyMetrics?: DailyMetric[];
}

export interface Product {
  id: string;           // URL-safe slug, e.g. "gta"
  name: string;         // e.g. "GTa", "GV", "OGV"
  description: string;  // Short description (can be "")
  signups: number;
  leads: number;
  contacted: number;
  interested: number;
  applied: number;
  conversionRate: number; // (applied / signups) * 100
  dailyMetrics?: DailyMetric[];
}

export interface Department {
  id: string;
  name: string;         // e.g. "MKT", "PM&Ewa"
  signups: number;
  leads: number;
  contacted: number;
  interested: number;
  applied: number;
  conversionRate: number; // (applied / signups) * 100
}

export interface CampaignData {
  date: string;         // "YYYY-MM-DD"
  signups: number;
  leads: number;
  contacted: number;
  interested: number;
  applied: number;
}

export interface DashboardResponse {
  members: Member[];
  universities: University[];
  products: Product[];
  departments: Department[];
  campaignMetrics: CampaignData[];
  totals: {
    signups: number;
    leads: number;
    contacted: number;
    interested: number;
    applied: number;       // Global: COUNT(UNIQUE(Person ID)) from Expa Application sheet
    alreadyExists?: number;
  };
  conversionRate: number;  // (totals.applied / totals.signups) * 100
}

// ──────────────────────────────────────────────────────────────────────────────
// Sample mock data — used as fallback when the backend is unreachable.
// This illustrates the exact shape the backend should return.
// ──────────────────────────────────────────────────────────────────────────────

const sampleMembers: Member[] = [
  {
    id: "malek-elfahem",
    name: "Malek Elfahem",
    department: "MKT",
    leads: 449,
    signups: 406,
    contacted: 0,
    interested: 0,
    applied: 2,
    conversionRate: 0.49,
    boothsAttended: 19,
    dailyMetrics: [],
    universitiesVisited: ["isgs-sousse", "epi-sousse"],
    productsPromoted: ["gta", "gte"],
  },
  {
    id: "chaima-dhouibi",
    name: "Chaima Dhouibi",
    department: "MKT",
    leads: 320,
    signups: 280,
    contacted: 0,
    interested: 0,
    applied: 0,
    conversionRate: 0,
    boothsAttended: 12,
    dailyMetrics: [],
    universitiesVisited: ["isgs-sousse", "fseg-sousse"],
    productsPromoted: ["gta"],
  },
  {
    id: "yomna-ben-amor",
    name: "Yomna Ben Amor",
    department: "IM",
    leads: 50,
    signups: 40,
    contacted: 0,
    interested: 0,
    applied: 1,
    conversionRate: 2.5,
    boothsAttended: 3,
    dailyMetrics: [],
    universitiesVisited: ["fseg-sousse"],
    productsPromoted: ["ogv"],
  },
];

const sampleUniversities: University[] = [
  { id: "isgs-sousse", name: "ISGS Sousse", location: "Sousse", signups: 300, leads: 400, contacted: 0, interested: 0, applied: 1, conversionRate: 0.33 },
  { id: "epi-sousse", name: "EPI Sousse", location: "Sousse", signups: 180, leads: 220, contacted: 0, interested: 0, applied: 1, conversionRate: 0.56 },
  { id: "fseg-sousse", name: "FSEG Sousse", location: "Sousse", signups: 120, leads: 150, contacted: 0, interested: 0, applied: 0, conversionRate: 0 },
];

const sampleProducts: Product[] = [
  { id: "gta", name: "GTa", description: "", signups: 400, leads: 500, contacted: 0, interested: 0, applied: 1, conversionRate: 0.25 },
  { id: "gte", name: "GTe", description: "", signups: 200, leads: 250, contacted: 0, interested: 0, applied: 1, conversionRate: 0.5 },
  { id: "ogv", name: "OGV", description: "", signups: 60, leads: 80, contacted: 0, interested: 0, applied: 0, conversionRate: 0 },
];

const sampleDepartments: Department[] = [
  { id: "mkt", name: "MKT", signups: 686, leads: 769, contacted: 0, interested: 0, applied: 2, conversionRate: 0.29 },
  { id: "im", name: "IM", signups: 40, leads: 50, contacted: 0, interested: 0, applied: 1, conversionRate: 2.5 },
];

function generateSampleCampaignMetrics(): CampaignData[] {
  const metrics: CampaignData[] = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const leads = Math.floor(Math.random() * 80 + 20);
    const signups = Math.floor(leads * (0.7 + Math.random() * 0.2));
    metrics.push({
      date: d.toISOString().slice(0, 10),
      leads,
      signups,
      contacted: 0,
      interested: 0,
      applied: Math.floor(Math.random() * 3),
    });
  }
  return metrics;
}

const sampleCampaignMetrics = generateSampleCampaignMetrics();

export const mockData: DashboardResponse = {
  members: sampleMembers,
  universities: sampleUniversities,
  products: sampleProducts,
  departments: sampleDepartments,
  campaignMetrics: sampleCampaignMetrics,
  totals: {
    leads: 819,
    signups: 726,
    contacted: 0,
    interested: 0,
    applied: 131,
    alreadyExists: 93,
  },
  conversionRate: 18.04,
};
