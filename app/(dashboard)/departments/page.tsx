'use client';

import { useState, useEffect } from 'react';
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

  // Filter departments based on date range
  const filteredDepartments = (data?.departments ?? []).filter((d) => {
    // Date range filtering (placeholder - would need actual date data)
    if (dateRange.start || dateRange.end) {
      return true;
    }
    return true;
  });

  const totalSignups = filteredDepartments.reduce((sum, d) => sum + d.signups, 0);
  const totalLeads = filteredDepartments.reduce((sum, d) => sum + d.leads, 0);
  const totalContacted = filteredDepartments.reduce((sum, d) => sum + d.contacted, 0);
  const totalApplied = filteredDepartments.reduce((sum, d) => sum + d.applied, 0);

  // Attendee performance by department (from members)
  const attendeePerformanceByDept = filteredDepartments.map((dept) => {
    const deptMembers = (data?.members ?? []).filter((m) => m.department === dept.name);
    const totalBooths = deptMembers.reduce((sum, m) => sum + m.boothsAttended, 0);
    const totalSignupsDept = deptMembers.reduce((sum, m) => sum + m.signups, 0);
    return {
      name: dept.name,
      signups: totalSignupsDept,
      leads: dept.leads,
      applied: dept.applied,
      attendees: deptMembers.length,
      boothsAttended: totalBooths,
      avgSignupsPerBooth: totalBooths > 0 ? Number((totalSignupsDept / totalBooths).toFixed(1)) : 0,
      conversionRate: dept.conversionRate,
    };
  });

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
        <KpiCard label="Total Signups" value={totalSignups} trend="up" change={12.5} />
        <KpiCard label="Total Leads" value={totalLeads} trend="up" change={8.2} />
        <KpiCard label="Total Applied" value={totalApplied} trend="up" change={18.7} />
      </div>

      {/* Signups by Department Chart */}
      <ChartCard
        title="Signups by Department"
        description="Distribution of signups across departments"
        className="col-span-full"
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={filteredDepartments}>
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
            <Bar dataKey="signups" fill={CHART_COLORS.primary} />
            <Bar dataKey="leads" fill={CHART_COLORS.secondary} />
            <Bar dataKey="applied" fill={CHART_COLORS.accent} />
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
            { key: 'applied', label: 'Applied', sortable: true },
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
