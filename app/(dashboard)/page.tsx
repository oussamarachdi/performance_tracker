'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  UserCheck,
  MapPin,
  TrendingUp,
  BarChart2,
  Calendar,
  ChevronRight,
  Search,
  X,
  ArrowUpRight,
  Filter,
  PieChart as PieChartIcon,
  MousePointer2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  FunnelChart
} from 'recharts';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { TopPerformerCard } from '@/components/dashboard/TopPerformerCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { getDashboardData, DashboardData } from '@/lib/api';
import { Member } from '@/lib/mockData';
import { CHART_COLORS, CHART_COLORS_ARRAY } from '@/lib/chartColors';

export default function OverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('day');

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDashboardData().then(d => {
      setData(d as any);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setMemberDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMemberView = selectedMember !== null;
  // Metric visibility logic
  const hideAppliedMetrics = selectedDepartments.length > 0 || selectedUniversities.length > 0;
  const showApplied = !isMemberView && !hideAppliedMetrics;

  const dateBounds = useMemo(() => {
    const startRaw = dateRange.start?.getTime();
    const endRaw = dateRange.end?.getTime();
    const hasFilter = startRaw != null || endRaw != null;
    const start = startRaw ?? 0;
    const end = endRaw ?? Number.MAX_SAFE_INTEGER;
    const [lo, hi] = hasFilter && startRaw != null && endRaw != null ? [Math.min(start, end), Math.max(start, end)] : [start, end];
    return { hasFilter, lo, hi };
  }, [dateRange.start, dateRange.end]);

  const filteredMembers = useMemo(() => {
    let members = (data as any)?.members ?? [];
    if (selectedDepartments.length > 0) {
      members = members.filter((m: any) => selectedDepartments.includes(m.department));
    }
    if (selectedProducts.length > 0) {
      members = members.filter((m: any) =>
        m.productsPromoted.some((p: any) => selectedProducts.includes(p))
      );
    }
    if (selectedUniversities.length > 0) {
      members = members.filter((m: any) =>
        m.universitiesVisited.some((u: any) => selectedUniversities.includes(u))
      );
    }
    return members;
  }, [data, selectedDepartments, selectedProducts, selectedUniversities]);

  const memberSearchResults = useMemo(() => {
    if (!memberSearch) return (data as any)?.members.slice(0, 10) ?? [];
    return ((data as any)?.members ?? []).filter((m: any) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.department.toLowerCase().includes(memberSearch.toLowerCase())
    );
  }, [data, memberSearch]);

  const filteredTotals = useMemo(() => {
    const { hasFilter, lo, hi } = dateBounds;

    const processMember = (m: Member) => {
      if (!hasFilter) {
        return {
          leads: m.signups,
          signups: m.leads,
          applied: m.applied,
          booths: m.boothsAttended,
        };
      }
      const inRange = (m.dailyMetrics || []).filter((d) => {
        const t = new Date(d.date).getTime();
        return t >= lo && t <= hi;
      });
      return {
        leads: inRange.reduce((s, d) => s + d.signups, 0),
        signups: inRange.reduce((s, d) => s + d.leads, 0),
        applied: inRange.reduce((s, d) => s + d.applied, 0),
        booths: inRange.length,
      };
    };

    if (isMemberView && selectedMember) {
      const p = processMember(selectedMember);
      return {
        ...p,
        boothsAttended: p.booths,
        avgSignupsPerBooth: p.booths > 0 ? Number((p.signups / p.booths).toFixed(1)) : 0,
      };
    }

    const hasDept = selectedDepartments.length > 0;
    const hasProd = selectedProducts.length > 0;
    const hasUni = selectedUniversities.length > 0;
    const noFiltersActive = !hasDept && !hasProd && !hasUni && !hasFilter;

    // No filters at all — use server-computed totals (most accurate, avoids zero-flash)
    if (noFiltersActive) {
      const t = (data as any)?.totals ?? {};
      return {
        leads: t.leads ?? 0,
        signups: t.signups ?? 0,
        applied: t.applied ?? 0,
        boothsAttended: 0,
        avgSignupsPerBooth: 0,
      };
    }

    // ANY filter active — roll up from filteredMembers (intersection of ALL active filters)
    const rolled = filteredMembers.reduce(
      (acc: any, m: Member) => {
        const p = processMember(m);
        return {
          signups: acc.signups + p.signups,
          leads: acc.leads + p.leads,
          applied: acc.applied + p.applied,
          boothsAttended: acc.boothsAttended + p.booths,
        };
      },
      { signups: 0, leads: 0, applied: 0, boothsAttended: 0 }
    );

    return { ...rolled, avgSignupsPerBooth: rolled.boothsAttended > 0 ? Number((rolled.signups / rolled.boothsAttended).toFixed(1)) : 0 };
  }, [isMemberView, selectedMember, filteredMembers, data, dateBounds, selectedDepartments, selectedProducts, selectedUniversities]);

  const conversionRate = useMemo(() => {
    return filteredTotals.leads > 0 ? (filteredTotals.applied / filteredTotals.leads) * 100 : 0;
  }, [filteredTotals]);

  const chartData = useMemo(() => {
    const { hasFilter, lo, hi } = dateBounds;
    const filterByDate = (arr: any[]) => {
      if (!hasFilter) return arr;
      return arr.filter(d => { const t = new Date(d.date).getTime(); return t >= lo && t <= hi; });
    };

    // Aggregates an array of daily-metric rows into a {date, leads, signups, applied} map.
    // Note: backend stores leads/signups swapped vs. UI — swap them here.
    const aggregate = (entries: any[]) => {
      const dateMap = new Map<string, any>();
      entries.forEach(d => {
        const cur = dateMap.get(d.date) ?? { signups: 0, leads: 0, applied: 0 };
        cur.leads += d.signups ?? 0;  // backend .signups = UI Leads (created)
        cur.signups += d.leads ?? 0;  // backend .leads   = UI Signups (total)
        cur.applied += d.applied ?? 0;
        dateMap.set(d.date, cur);
      });
      return Array.from(dateMap.entries()).map(([date, v]) => ({ date, ...v }));
    };

    // Member view — personal chart
    if (isMemberView && selectedMember?.dailyMetrics) {
      return aggregateByPeriod(filterByDate(aggregate(selectedMember.dailyMetrics)), chartPeriod);
    }

    const hasDept = selectedDepartments.length > 0;
    const hasProd = selectedProducts.length > 0;
    const hasUni = selectedUniversities.length > 0;

    // Any filter active → intersect through members
    if (hasDept || hasProd || hasUni) {
      const memMet = filteredMembers.flatMap((m: any) => m.dailyMetrics || []);
      return aggregateByPeriod(filterByDate(aggregate(memMet)), chartPeriod);
    }

    // No filters — use global campaign metrics
    return aggregateByPeriod(filterByDate(aggregate((data as any)?.campaignMetrics ?? [])), chartPeriod);
  }, [chartPeriod, isMemberView, selectedMember, data, dateBounds, filteredMembers, selectedDepartments, selectedProducts, selectedUniversities]);

  const productPieData = useMemo(() => {
    if (isMemberView && selectedMember) return selectedMember.productBreakdown || [];
    const pMap = new Map<string, number>();
    filteredMembers.forEach((m: any) => {
      m.productBreakdown?.forEach((pb: any) => {
        pMap.set(pb.name, (pMap.get(pb.name) || 0) + pb.signups);
      });
    });
    return Array.from(pMap.entries()).map(([name, signups]) => ({ name, signups }));
  }, [isMemberView, selectedMember, filteredMembers]);

  const universityBreakdownData = useMemo(() => {
    if (isMemberView && selectedMember?.universityBreakdown) {
      return selectedMember.universityBreakdown;
    }
    return [];
  }, [isMemberView, selectedMember]);

  const handleReset = () => {
    setSelectedProducts([]);
    setSelectedDepartments([]);
    setSelectedUniversities([]);
    setDateRange({ start: null, end: null });
    setSelectedMember(null);
    setMemberSearch('');
  };

  if (loading || !data) return <div className="p-8">Loading data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">
            {isMemberView ? 'Aggregated Profile View' : 'Campaign performance at a glance'}
          </p>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-border rounded-lg p-4" ref={searchRef}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold" />
            <input
              type="text"
              placeholder="Search or select member..."
              value={selectedMember ? selectedMember.name : memberSearch}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                if (selectedMember) setSelectedMember(null);
                setMemberDropdownOpen(true);
              }}
              onFocus={() => setMemberDropdownOpen(true)}
              className="w-full pl-9 pr-9 py-2 rounded-md bg-slate-800/50 border border-border text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            />
            {memberDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-[#1e293b] shadow-lg z-20">
                {memberSearchResults.map((m: any) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMember(m); setMemberSearch(''); setMemberDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-sm text-[#F8FAFC] hover:bg-slate-700/50 flex justify-between items-center"
                  >
                    <span>{m.name}</span>
                    <span className="text-xs text-slate-400">{m.department}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isMemberView && selectedMember && (
        <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] border border-border rounded-xl p-8 mb-2 shadow-xl relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-[#1e293b]">
              {selectedMember.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-3">{selectedMember.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                  {selectedMember.department} Department
                </span>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-sm font-medium">
                  {selectedMember.universitiesVisited.length} Universities
                </span>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-sm font-medium">
                  {selectedMember.productsPromoted.length} Products
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isMemberView && (
        <FilterBar
          filters={[
            { label: 'Products', options: (data as any).products.map((p: any) => ({ label: p.name, value: p.id })), selected: selectedProducts, onChange: setSelectedProducts },
            { label: 'Departments', options: (data as any).departments.map((d: any) => ({ label: d.name, value: d.name })), selected: selectedDepartments, onChange: setSelectedDepartments },
            { label: 'Universities', options: (data as any).universities.map((u: any) => ({ label: u.name, value: u.id })), selected: selectedUniversities, onChange: setSelectedUniversities },
          ]}
          onDateRangeChange={setDateRange}
          onReset={handleReset}
          hasDateRangeActive={!!(dateRange.start || dateRange.end)}
          dateRange={dateRange}
        />
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isMemberView ? 'lg:grid-cols-4' : (showApplied ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}`}>
        <KpiCard label="Leads" value={filteredTotals.leads} />
        <KpiCard label="Signups" value={filteredTotals.signups} />
        {showApplied && (
          <KpiCard label="Applied" value={filteredTotals.applied} />
        )}
        {isMemberView && (
          <>
            <KpiCard label="Booths attended" value={filteredTotals.boothsAttended} />
            <KpiCard label="Avg signups / booth" value={filteredTotals.avgSignupsPerBooth} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">Campaign Performance</h3>
            <div className="flex bg-slate-800 p-1 rounded-lg">
              {(['day', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all ${chartPeriod === p ? 'bg-primary text-primary-foreground shadow-lg' : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.5} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} itemStyle={{ color: '#94a3b8' }} labelStyle={{ color: '#f8fafc', fontWeight: 700 }} />
                <Legend />
                <Line type="monotone" dataKey="leads" name="Leads" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="signups" name="Signups" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                {showApplied && <Line type="monotone" dataKey="applied" name="Applied" stroke={CHART_COLORS.accent} strokeWidth={2} dot={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          {showApplied && (
            <ChartCard title="Overall Conversion Rate">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-5xl font-bold text-primary mb-2">{(conversionRate || 0).toFixed(1)}%</div>
                <p className="text-muted-foreground text-center text-sm">Leads to applications</p>
              </div>
            </ChartCard>
          )}

          <div className={`bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col ${showApplied ? '' : 'flex-1'}`}>
            <h3 className="text-lg font-bold text-foreground mb-4">{isMemberView ? 'Products Selling' : 'Product Distribution'}</h3>
            <div className={showApplied ? 'h-56' : 'flex-1 min-h-0'}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productPieData} dataKey="signups" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {productPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS_ARRAY[i % CHART_COLORS_ARRAY.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {isMemberView && (
        <div className="space-y-6">
          <ChartCard title="Signups by University">
            <ResponsiveContainer width="100%" height={universityBreakdownData.length > 10 ? universityBreakdownData.length * 40 : 400}>
              <BarChart data={universityBreakdownData} layout="vertical" margin={{ left: 180, right: 80, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  width={170}
                  interval={0}
                  tick={{ width: 170, overflow: 'visible' }}
                />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Bar
                  dataKey="signups"
                  fill={CHART_COLORS.primary}
                  radius={[0, 4, 4, 0]}
                  label={{ position: 'right', fill: '#94a3b8', fontSize: 11, offset: 10 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {!isMemberView && filteredMembers.length > 0 && (
        <ChartCard title="Top Members Leaderboard" description="Ranked by signups then leads">
          <DataTable<any>
            columns={[
              { key: 'name', label: 'Name', sortable: true },
              { key: 'department', label: 'Department', sortable: true },
              { key: 'signups', label: 'Signups', sortable: true },
              { key: 'leads', label: 'Leads', sortable: true },
              {
                key: 'avgPerBooth',
                label: 'Avg / Booth',
                render: (_v: any, m: any) => m.boothsAttended > 0 ? (m.signups / m.boothsAttended).toFixed(1) : '—'
              }
            ]}
            data={[...filteredMembers]
              .sort((a: any, b: any) => b.signups - a.signups || b.leads - a.leads)
              .slice(0, 10)
            }
          />
        </ChartCard>
      )}
    </div>
  );
}

function aggregateByPeriod(data: any[], period: 'day' | 'week' | 'month') {
  if (period === 'day') return data;

  const getKey = (dateStr: string) => {
    const d = new Date(dateStr);
    if (period === 'month') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    // week: ISO week start (Monday)
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  };

  const map = new Map<string, any>();
  data.forEach(row => {
    const key = getKey(row.date);
    const cur = map.get(key) ?? { date: key, leads: 0, signups: 0, applied: 0 };
    cur.leads += row.leads ?? 0;
    cur.signups += row.signups ?? 0;
    cur.applied += row.applied ?? 0;
    map.set(key, cur);
  });

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
