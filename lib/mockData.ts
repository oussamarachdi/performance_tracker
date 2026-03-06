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

const universities: University[] = [
  {
    id: "uni-1",
    name: "Stanford University",
    location: "California",
    signups: 3200,
    leads: 2560,
    contacted: 1792,
    interested: 1433,
    applied: 860,
    conversionRate: 33.8,
  },
  {
    id: "uni-2",
    name: "MIT",
    location: "Massachusetts",
    signups: 2800,
    leads: 2240,
    contacted: 1568,
    interested: 1254,
    applied: 752,
    conversionRate: 33.5,
  },
  {
    id: "uni-3",
    name: "Harvard University",
    location: "Massachusetts",
    signups: 2600,
    leads: 2080,
    contacted: 1456,
    interested: 1165,
    applied: 698,
    conversionRate: 33.5,
  },
  {
    id: "uni-4",
    name: "UC Berkeley",
    location: "California",
    signups: 2400,
    leads: 1920,
    contacted: 1344,
    interested: 1075,
    applied: 645,
    conversionRate: 33.6,
  },
  {
    id: "uni-5",
    name: "Oxford University",
    location: "UK",
    signups: 2200,
    leads: 1760,
    contacted: 1232,
    interested: 986,
    applied: 592,
    conversionRate: 33.6,
  },
  {
    id: "uni-6",
    name: "Cambridge University",
    location: "UK",
    signups: 2100,
    leads: 1680,
    contacted: 1176,
    interested: 941,
    applied: 564,
    conversionRate: 33.6,
  },
  {
    id: "uni-7",
    name: "University of Tokyo",
    location: "Japan",
    signups: 1900,
    leads: 1520,
    contacted: 1064,
    interested: 851,
    applied: 511,
    conversionRate: 33.6,
  },
  {
    id: "uni-8",
    name: "NUS Singapore",
    location: "Singapore",
    signups: 1800,
    leads: 1440,
    contacted: 1008,
    interested: 806,
    applied: 484,
    conversionRate: 33.6,
  },
];

const products: Product[] = [
  {
    id: "prod-1",
    name: "Global Volunteer",
    description: "Volunteer opportunities around the world",
    signups: 8200,
    leads: 6560,
    contacted: 4592,
    interested: 3674,
    applied: 2204,
    conversionRate: 33.6,
  },
  {
    id: "prod-2",
    name: "Global Talent",
    description: "Professional talent development program",
    signups: 6800,
    leads: 5440,
    contacted: 3808,
    interested: 3046,
    applied: 1828,
    conversionRate: 33.6,
  },
  {
    id: "prod-3",
    name: "Global Teacher",
    description: "Teaching and educational exchange program",
    signups: 4200,
    leads: 3360,
    contacted: 2352,
    interested: 1882,
    applied: 1128,
    conversionRate: 33.6,
  },
];

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
    name: "Sarah Johnson",
    department: "West Coast",
    signups: 1200,
    leads: 960,
    contacted: 672,
    interested: 538,
    applied: 323,
    conversionRate: 33.6,
    dailyMetrics: dailyMetrics.slice(0, 30),
    universitiesVisited: ["uni-1", "uni-4"],
    productsPromoted: ["prod-1", "prod-2"],
  },
  {
    id: "member-2",
    name: "Michael Chen",
    department: "East Coast",
    signups: 1100,
    leads: 880,
    contacted: 616,
    interested: 493,
    applied: 296,
    conversionRate: 33.6,
    dailyMetrics: dailyMetrics.slice(0, 30),
    universitiesVisited: ["uni-2", "uni-3"],
    productsPromoted: ["prod-1", "prod-3"],
  },
  {
    id: "member-3",
    name: "Emma Williams",
    department: "International",
    signups: 980,
    leads: 784,
    contacted: 549,
    interested: 439,
    applied: 263,
    conversionRate: 33.6,
    dailyMetrics: dailyMetrics.slice(0, 30),
    universitiesVisited: ["uni-5", "uni-6", "uni-7"],
    productsPromoted: ["prod-1", "prod-2", "prod-3"],
  },
  {
    id: "member-4",
    name: "James Rodriguez",
    department: "Midwest",
    signups: 920,
    leads: 736,
    contacted: 515,
    interested: 412,
    applied: 247,
    conversionRate: 33.6,
    dailyMetrics: dailyMetrics.slice(0, 30),
    universitiesVisited: ["uni-4", "uni-8"],
    productsPromoted: ["prod-2"],
  },
  {
    id: "member-5",
    name: "Lisa Anderson",
    department: "South",
    signups: 850,
    leads: 680,
    contacted: 476,
    interested: 381,
    applied: 228,
    conversionRate: 33.6,
    dailyMetrics: dailyMetrics.slice(0, 30),
    universitiesVisited: ["uni-1", "uni-3"],
    productsPromoted: ["prod-3"],
  },
  {
    id: "member-6",
    name: "David Park",
    department: "Asia Pacific",
    signups: 780,
    leads: 624,
    contacted: 437,
    interested: 350,
    applied: 210,
    conversionRate: 33.6,
    dailyMetrics: dailyMetrics.slice(0, 30),
    universitiesVisited: ["uni-7", "uni-8"],
    productsPromoted: ["prod-1"],
  },
  {
    id: "member-7",
    name: "Rachel Green",
    department: "Europe",
    signups: 720,
    leads: 576,
    contacted: 403,
    interested: 322,
    applied: 193,
    conversionRate: 33.6,
    dailyMetrics: dailyMetrics.slice(0, 30),
    universitiesVisited: ["uni-5", "uni-6"],
    productsPromoted: ["prod-2", "prod-3"],
  },
  {
    id: "member-8",
    name: "Alex Martinez",
    department: "West Coast",
    signups: 680,
    leads: 544,
    contacted: 381,
    interested: 305,
    applied: 183,
    conversionRate: 33.6,
    dailyMetrics: dailyMetrics.slice(0, 30),
    universitiesVisited: ["uni-1"],
    productsPromoted: ["prod-1"],
  },
];

const departments = [
  "West Coast",
  "East Coast",
  "International",
  "Midwest",
  "South",
  "Asia Pacific",
  "Europe",
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
