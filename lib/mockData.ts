export interface DailyMetric {
  date: string;
  signups: number;
  leads: number;
  contacted: number;
  interested: number;
  applied: number;
}

export interface Member {
  id: string;
  name: string;
  department: string;
  signups: number;
  leads: number;
  contacted: number;
  interested: number;
  applied: number;
  conversionRate: number;
  boothsAttended: number;
  dailyMetrics: DailyMetric[];
  universitiesVisited: string[];
  productsPromoted: string[];
}

export interface University {
  id: string;
  name: string;
  location: string;
  signups: number;
  leads: number;
  contacted: number;
  interested: number;
  applied: number;
  conversionRate: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  signups: number;
  leads: number;
  contacted: number;
  interested: number;
  applied: number;
  conversionRate: number;
}

export interface CampaignData {
  date: string;
  signups: number;
  leads: number;
  contacted: number;
  interested: number;
  applied: number;
}
// Generate daily campaign metrics for the last 120 days
function generateDailyMetrics(): CampaignData[] {
  const metrics: CampaignData[] = [];
  const today = new Date();

  for (let i = 120; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const baseSignups = Math.floor(Math.random() * 200 + 150);
    const signups = Math.max(0, baseSignups + (Math.random() > 0.5 ? 50 : -30));
    const leads = Math.floor(signups * 0.8 * (0.85 + Math.random() * 0.3));
    const contacted = Math.floor(leads * 0.7 * (0.85 + Math.random() * 0.3));
    const interested = Math.floor(contacted * 0.8 * (0.85 + Math.random() * 0.3));
    const applied = Math.floor(interested * 0.6 * (0.85 + Math.random() * 0.3));

    metrics.push({
      date: date.toISOString().split("T")[0],
      signups: Math.floor(signups),
      leads: Math.floor(leads),
      contacted: Math.floor(contacted),
      interested: Math.floor(interested),
      applied: Math.floor(applied),
    });
  }

  return metrics;
}

const dailyMetrics = generateDailyMetrics();

// Calculate totals from daily metrics
const totals = dailyMetrics.reduce(
  (acc, day) => ({
    signups: acc.signups + day.signups,
    leads: acc.leads + day.leads,
    contacted: acc.contacted + day.contacted,
    interested: acc.interested + day.interested,
    applied: acc.applied + day.applied,
  }),
  { signups: 0, leads: 0, contacted: 0, interested: 0, applied: 0 }
);

const members: Member[] = [
  {
    id: "member-1",
    name: "Member 1",
    department: "General",
    signups: 0,
    leads: 0,
    contacted: 0,
    interested: 0,
    applied: 0,
    conversionRate: 0,
    boothsAttended: 0,
    dailyMetrics: [],
    universitiesVisited: [],
    productsPromoted: [],
  },
];

const departments = [...new Set(members.map((m) => m.department))];

const universities: University[] = [
  { id: "uni-1", name: "General", location: "", signups: 0, leads: 0, contacted: 0, interested: 0, applied: 0, conversionRate: 0 },
];
const products: Product[] = [
  { id: "product-1", name: "General", description: "", signups: 0, leads: 0, contacted: 0, interested: 0, applied: 0, conversionRate: 0 },
];

const departmentStats = departments.map((dept) => {
  const deptMembers = members.filter((m) => m.department === dept);
  const totals = deptMembers.reduce(
    (acc, m) => ({
      signups: acc.signups + m.signups,
      leads: acc.leads + m.leads,
      contacted: acc.contacted + m.contacted,
      interested: acc.interested + m.interested,
      applied: acc.applied + m.applied,
    }),
    { signups: 0, leads: 0, contacted: 0, interested: 0, applied: 0 }
  );

  return {
    id: dept.toLowerCase().replace(/\s+/g, "-"),
    name: dept,
    signups: totals.signups,
    leads: totals.leads,
    contacted: totals.contacted,
    interested: totals.interested,
    applied: totals.applied,
    conversionRate: (totals.applied / totals.signups) * 100,
  };
});

export const mockData = {
  campaignMetrics: dailyMetrics,
  members,
  universities,
  products,
  departments: departmentStats,
  totals,
  conversionRate: (totals.applied / totals.signups) * 100,
};
