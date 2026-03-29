'use client';

import { useState, useMemo, useEffect } from 'react';
import { getDashboardData } from '@/lib/api';
import type { DashboardData } from '@/lib/api';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { DateRange } from '@/components/dashboard/DateRangeFilter';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/chartColors';

export default function DepartmentsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  useEffect(() => {
    getDashboardData().then(setData);
  }, []);

  // Date filter bounds
  const dateBounds = useMemo(() => {
    const startRaw = dateRange.start?.getTime();
    const endRaw = dateRange.end?.getTime();
    const hasFilter = startRaw != null || endRaw != null;
    const start = startRaw ?? 0;
    const end = endRaw ?? Number.MAX_SAFE_INTEGER;
    const [lo, hi] = hasFilter && startRaw != null && endRaw != null ? [Math.min(start, end), Math.max(start, end)] : [start, end];
    return { hasFilter, lo, hi };
  }, [dateRange.start, dateRange.end]);

  const { totalSignups, totalLeads, totalApplied, attendeePerformanceByDept } = useMemo(() => {
    const { hasFilter, lo, hi } = dateBounds;
    const metricsInRange = (data?.campaignMetrics ?? []).filter((m) => {
      if (!hasFilter) return true;
      const t = new Date(m.date).getTime();
      return t >= lo && t <= hi;
    });

    const signups = metricsInRange.reduce((s, d) => s + d.signups, 0);
    const leads = metricsInRange.reduce((s, d) => s + d.leads, 0);
    const applied = metricsInRange.reduce((s, d) => s + d.applied, 0);

    const perf = (data?.departments ?? []).map((dept) => {
      const deptMembers = (data?.members ?? []).filter((m) => m.department === dept.name);

      let dSignups = 0;
      let dLeads = 0;
      let dApplied = 0;
      let dBooths = 0;

      deptMembers.forEach(m => {
        const inRange = hasFilter ? m.dailyMetrics.filter(dm => {
          const t = new Date(dm.date).getTime();
          return t >= lo && t <= hi;
        }) : m.dailyMetrics;

        dSignups += hasFilter ? inRange.reduce((s, dm) => s + dm.signups, 0) : m.signups;
        dLeads += hasFilter ? inRange.reduce((s, dm) => s + dm.leads, 0) : m.leads;
        dApplied += hasFilter ? inRange.reduce((s, dm) => s + dm.applied, 0) : m.applied;
        dBooths += hasFilter ? inRange.length : m.boothsAttended;
      });

      return {
        name: dept.name,
        signups: dSignups,
        leads: dLeads,
        applied: dApplied,
        attendees: deptMembers.length,
        boothsAttended: dBooths,
        avgSignupsPerBooth: dBooths > 0 ? Number((dSignups / dBooths).toFixed(1)) : 0,
        conversionRate: dSignups > 0 ? (dApplied / dSignups) * 100 : 0
      };
    });

    return { totalSignups: signups, totalLeads: leads, totalApplied: applied, attendeePerformanceByDept: perf };
  }, [data, dateBounds]);

  const handleReset = () => {
    setDateRange({ start: null, end: null });
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Departments</h1>
        <p className="text-muted-foreground mt-1">Performance by department</p>
      </div>

      {/* Filters */}
      <FilterBar
        filters={[]}
        onDateRangeChange={setDateRange}
        onReset={handleReset}
        hasDateRangeActive={!!(dateRange.start || dateRange.end)}
        dateRange={dateRange}
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Total Signups" value={totalSignups} />
        <KpiCard label="Total Leads" value={totalLeads} />
        <KpiCard label="Total Applied" value={totalApplied} />
      </div>

      <ChartCard
        title="Signups by Department"
        description="Distribution of signups across departments"
        className="col-span-full"
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={attendeePerformanceByDept}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
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
            <Bar dataKey="signups" name="Signups" fill={CHART_COLORS.primary} />
            <Bar dataKey="leads" name="Leads" fill={CHART_COLORS.secondary} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Attendee performance by department */}
      <ChartCard
        title="Attendee Performance by Department"
        description="Number of attendees, booths attended, signups and avg signups per booth"
        className="col-span-full"
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={attendeePerformanceByDept}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#F8FAFC' }}
              formatter={(value, name) => {
                if (name === 'avgSignupsPerBooth') return [value, 'Avg signups / booth'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="attendees" name="Attendees" fill={CHART_COLORS.primary} />
            <Bar dataKey="boothsAttended" name="Booths attended" fill={CHART_COLORS.secondary} />
            <Bar dataKey="avgSignupsPerBooth" name="Avg signups / booth" fill={CHART_COLORS.neutral} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Department Details Table */}
      <ChartCard title="Department Performance Details" className="col-span-full">
        <DataTable<(typeof attendeePerformanceByDept)[0]>
          columns={[
            { key: 'name', label: 'Department', sortable: true },
            { key: 'signups', label: 'Signups', sortable: true },
            { key: 'leads', label: 'Leads', sortable: true },
            { key: 'attendees', label: 'Attendees', sortable: true },
            { key: 'boothsAttended', label: 'Booths attended', sortable: true },
            { key: 'avgSignupsPerBooth', label: 'Avg signups / booth', sortable: true },
            {
              key: 'conversionRate',
              label: 'Conversion Rate',
              sortable: true,
              render: (value) => (value != null && typeof value === 'number' && !Number.isNaN(value)) ? `${Number(value).toFixed(1)}%` : '—',
            },
          ]}
          data={attendeePerformanceByDept}
        />
      </ChartCard>
    </div>
  );
}
