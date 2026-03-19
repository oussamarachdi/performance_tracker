'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { getDashboardData } from '@/lib/api';
import type { DashboardData } from '@/lib/api';
import { DateRange } from '@/components/dashboard/DateRangeFilter';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { DataTable } from '@/components/dashboard/DataTable';
import { TopPerformerCard } from '@/components/dashboard/TopPerformerCard';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { Member } from '@/lib/mockData';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CHART_COLORS_ARRAY, CHART_COLORS } from '@/lib/chartColors';
import { Search, X } from 'lucide-react';

type ChartPeriod = 'day' | 'week' | 'month';

function aggregateByPeriod(
  metrics: { date: string; signups: number; leads: number }[],
  period: ChartPeriod
) {
  if (!metrics.length) return [];
  if (period === 'day') {
    return metrics.map((d) => ({ date: d.date, signups: d.signups, leads: d.leads }));
  }
  const groups = new Map<string, { signups: number; leads: number }>();
  for (const d of metrics) {
    const date = new Date(d.date);
    let key: string;
    if (period === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    const cur = groups.get(key) ?? { signups: 0, leads: 0 };
    cur.signups += d.signups;
    cur.leads += d.leads;
    groups.set(key, cur);
  }
  return Array.from(groups.entries())
    .map(([date, v]) => ({ date, signups: v.signups, leads: v.leads }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export default function OverviewPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('day');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDashboardData().then(setData);
  }, []);

  const filteredMembers = useMemo(() => {
    const members = data?.members ?? [];
    return members.filter((m) => {
      if (selectedDepartments.length > 0 && !selectedDepartments.includes(m.department)) return false;
      if (selectedProducts.length > 0 && !m.productsPromoted.some((id) => selectedProducts.includes(id))) return false;
      if (selectedUniversities.length > 0 && !m.universitiesVisited.some((id) => selectedUniversities.includes(id))) return false;
      return true;
    });
  }, [data?.members, selectedDepartments, selectedProducts, selectedUniversities]);

  const memberSearchResults = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return filteredMembers;
    return filteredMembers.filter((m) => m.name.toLowerCase().includes(q));
  }, [memberSearch, filteredMembers]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setMemberDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMemberView = selectedMember !== null;

  const filteredTotals = useMemo(() => {
    if (isMemberView && selectedMember) {
      const m = selectedMember;
      return {
        signups: m.signups,
        leads: m.leads,
        applied: m.applied,
        boothsAttended: m.boothsAttended,
        avgSignupsPerBooth: m.boothsAttended > 0 ? Number((m.signups / m.boothsAttended).toFixed(1)) : 0,
      };
    }
    return filteredMembers.reduce(
      (acc, m) => ({
        signups: acc.signups + m.signups,
        leads: acc.leads + m.leads,
        applied: acc.applied + m.applied,
        boothsAttended: acc.boothsAttended + m.boothsAttended,
        avgSignupsPerBooth: 0,
      }),
      { signups: 0, leads: 0, applied: 0, boothsAttended: 0, avgSignupsPerBooth: 0 }
    );
  }, [isMemberView, selectedMember, filteredMembers]);

  const conversionRate =
    filteredTotals.signups > 0 ? (filteredTotals.applied / filteredTotals.signups) * 100 : 0;

  const chartData = useMemo(() => {
    const startRaw = dateRange.start?.getTime();
    const endRaw = dateRange.end?.getTime();
    const hasDateFilter = startRaw != null || endRaw != null;
    const start = startRaw ?? 0;
    const end = endRaw ?? Number.MAX_SAFE_INTEGER;
    const [lo, hi] = hasDateFilter && startRaw != null && endRaw != null ? [Math.min(start, end), Math.max(start, end)] : [start, end];

    if (isMemberView && selectedMember?.dailyMetrics?.length) {
      let memberDaily = selectedMember.dailyMetrics.map((d) => ({ date: d.date, signups: d.signups, leads: d.leads }));
      if (hasDateFilter) {
        memberDaily = memberDaily.filter((d) => {
          const t = new Date(d.date).getTime();
          return t >= lo && t <= hi;
        });
      }
      return aggregateByPeriod(memberDaily, chartPeriod);
    }
    let metrics = data?.campaignMetrics ?? [];
    if (hasDateFilter) {
      metrics = metrics.filter((m) => {
        const t = new Date(m.date).getTime();
        return t >= lo && t <= hi;
      });
    }
    return aggregateByPeriod(metrics, chartPeriod);
  }, [chartPeriod, isMemberView, selectedMember, data?.campaignMetrics, dateRange.start, dateRange.end]);

  const topMembers = useMemo(() => {
    const base = isMemberView && selectedMember ? [selectedMember] : filteredMembers;
    return [...base]
      .filter((m) => m.signups >= 3)
      .sort((a, b) => b.signups - a.signups)
      .slice(0, 3);
  }, [isMemberView, selectedMember, filteredMembers]);

  const leaderboardData = useMemo(() => {
    if (isMemberView && selectedMember) return [selectedMember];
    return filteredMembers.filter((m) => m.signups >= 3);
  }, [isMemberView, selectedMember, filteredMembers]);

  const productPieData = useMemo(() => {
    if (isMemberView && selectedMember && selectedMember.productsPromoted.length > 0 && data?.products) {
      return selectedMember.productsPromoted
        .map((id) => data.products.find((p) => p.id === id))
        .filter(Boolean)
        .map((p, i) => ({
          name: p!.name,
          signups: Math.floor(selectedMember!.signups * (0.25 + 0.15 * (i + 1)) + 10),
        }));
    }
    const products = data?.products ?? [];
    if (selectedProducts.length > 0) {
      return products.filter((p) => selectedProducts.includes(p.id));
    }
    return products;
  }, [isMemberView, selectedMember, data?.products, selectedProducts]);

  const handleReset = () => {
    setSelectedProducts([]);
    setSelectedDepartments([]);
    setSelectedUniversities([]);
    setDateRange({ start: null, end: null });
    setSelectedMember(null);
    setMemberSearch('');
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">
          {isMemberView ? `Viewing: ${selectedMember?.name}` : 'Campaign performance at a glance'}
        </p>
      </div>

      {/* Member name filter - search / dropdown */}
      <div className="bg-[#1e293b] border border-border rounded-lg p-4" ref={searchRef}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
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
              className="w-full pl-9 pr-9 py-2 rounded-md bg-slate-800/50 border border-border text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {selectedMember && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMember(null);
                  setMemberSearch('');
                  setMemberDropdownOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-600 text-slate-400"
                aria-label="Clear member"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {memberDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-[#1e293b] shadow-lg z-20">
                {memberSearchResults.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-slate-400">No members found</div>
                ) : (
                  memberSearchResults.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMember(m);
                        setMemberSearch('');
                        setMemberDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-[#F8FAFC] hover:bg-slate-700/50 flex justify-between items-center"
                    >
                      <span>{m.name}</span>
                      <span className="text-xs text-slate-400">{m.department}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400">Content updates by selected member</span>
        </div>
      </div>

      <FilterBar
        filters={[
          {
            label: 'Products',
            options: data.products.map((p) => ({ label: p.name, value: p.id })),
            selected: selectedProducts,
            onChange: setSelectedProducts,
          },
          {
            label: 'Departments',
            options: data.departments.map((d) => ({ label: d.name, value: d.name })),
            selected: selectedDepartments,
            onChange: setSelectedDepartments,
          },
          {
            label: 'Universities',
            options: data.universities.map((u) => ({ label: u.name, value: u.id })),
            selected: selectedUniversities,
            onChange: setSelectedUniversities,
          },
        ]}
        onDateRangeChange={setDateRange}
        onReset={handleReset}
        hasDateRangeActive={!!(dateRange.start || dateRange.end)}
        dateRange={dateRange}
      />

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isMemberView ? 'lg:grid-cols-5' : 'lg:grid-cols-3'}`}>
        <KpiCard label="Signups" value={filteredTotals.signups} trend="up" change={12.5} />
        <KpiCard label="Leads" value={filteredTotals.leads} trend="up" change={8.2} />
        <KpiCard label="Applied" value={filteredTotals.applied} trend="up" change={18.7} />
        {isMemberView && (
          <>
            <KpiCard label="Booths attended" value={filteredTotals.boothsAttended} />
            <KpiCard label="Avg signups / booth" value={filteredTotals.avgSignupsPerBooth} />
          </>
        )}
      </div>

      {/* Performance Chart with Day / Week / Month */}
      <ChartCard
        title={isMemberView ? `${selectedMember?.name} — Performance` : 'Campaign Performance'}
        description="Signups and leads by period"
        className="col-span-full"
      >
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Period</span>
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setChartPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                chartPeriod === p
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {p === 'day' ? 'By Day' : p === 'week' ? 'By Week' : 'By Month'}
            </button>
          ))}
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#F8FAFC' }}
              />
              <Legend />
              <Line type="monotone" dataKey="signups" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="leads" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-slate-400 text-sm">
            No time-series data for this member
          </div>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Overall Conversion Rate" className="lg:col-span-1">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-5xl font-bold text-primary mb-2">{(conversionRate != null && !Number.isNaN(conversionRate) ? conversionRate : 0).toFixed(1)}%</div>
            <p className="text-muted-foreground text-center text-sm">From signups to applications</p>
          </div>
        </ChartCard>

        <ChartCard title="Conversion Funnel" className="lg:col-span-1">
          <FunnelChart
            data={[
              { name: 'Signups', value: filteredTotals.signups },
              { name: 'Applied', value: filteredTotals.applied },
            ]}
          />
        </ChartCard>

        <ChartCard title={isMemberView ? 'Signups by Product (member)' : 'Signups by Product'} className="lg:col-span-1">
          {isMemberView && productPieData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm">
              No product data for this member
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={productPieData} dataKey="signups" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {productPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {topMembers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topMembers.map((member) => (
            <TopPerformerCard key={member.id} member={member} />
          ))}
        </div>
      )}

      <ChartCard
        title="Top Members Leaderboard"
        description={isMemberView ? 'Selected member' : 'Filtered by Departments / Universities'}
      >
        <DataTable<(typeof data.members)[0]>
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'department', label: 'Department', sortable: true },
            { key: 'signups', label: 'Signups', sortable: true },
            { key: 'leads', label: 'Leads', sortable: true },
            { key: 'boothsAttended', label: 'Booths', sortable: true },
            {
              key: 'conversionRate',
              label: 'Conversion Rate',
              sortable: true,
              render: (value) => (value != null && typeof value === 'number' && !Number.isNaN(value)) ? `${Number(value).toFixed(1)}%` : '—',
            },
          ]}
          data={leaderboardData}
        />
      </ChartCard>
    </div>
  );
}
