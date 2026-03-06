'use client';

import { useState } from 'react';
import { mockData } from '@/lib/mockData';
import { DateRange } from '@/components/dashboard/DateRangeFilter';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { TopPerformerCard } from '@/components/dashboard/TopPerformerCard';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import {
  LineChart,
  Line,
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

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export default function OverviewPage() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  // Filter data based on selections
  const filteredMembers = mockData.members.filter((m) => {
    if (selectedDepartments.length > 0 && !selectedDepartments.includes(m.department)) {
      return false;
    }
    // Date range filtering (placeholder - would need actual date data)
    if (dateRange.start || dateRange.end) {
      return true;
    }
    return true;
  });

  const filteredDepartments = mockData.departments.filter((d) =>
    selectedDepartments.length > 0 ? selectedDepartments.includes(d.name) : true
  );

  const departmentStats = filteredDepartments.length > 0 ? filteredDepartments : mockData.departments;

  // Calculate filtered totals
  const filteredTotals = filteredMembers.reduce(
    (acc, m) => ({
      signups: acc.signups + m.signups,
      leads: acc.leads + m.leads,
      contacted: acc.contacted + m.contacted,
      interested: acc.interested + m.interested,
      applied: acc.applied + m.applied,
    }),
    { signups: 0, leads: 0, contacted: 0, interested: 0, applied: 0 }
  );

  const conversionRate = filteredTotals.signups > 0 
    ? (filteredTotals.applied / filteredTotals.signups) * 100 
    : 0;

  const topMembers = [...filteredMembers]
    .sort((a, b) => b.signups - a.signups)
    .slice(0, 3);

  const handleReset = () => {
    setSelectedProducts([]);
    setSelectedDepartments([]);
    setSelectedUniversities([]);
    setDateRange({ start: null, end: null });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Campaign performance at a glance</p>
      </div>

      {/* Filters */}
      <FilterBar
        filters={[
          {
            label: 'Products',
            options: mockData.products.map((p) => ({ label: p.name, value: p.id })),
            selected: selectedProducts,
            onChange: setSelectedProducts,
          },
          {
            label: 'Departments',
            options: mockData.departments.map((d) => ({ label: d.name, value: d.name })),
            selected: selectedDepartments,
            onChange: setSelectedDepartments,
          },
          {
            label: 'Universities',
            options: mockData.universities.map((u) => ({ label: u.name, value: u.id })),
            selected: selectedUniversities,
            onChange: setSelectedUniversities,
          },
        ]}
        onDateRangeChange={setDateRange}
        onReset={handleReset}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Signups"
          value={filteredTotals.signups}
          trend="up"
          change={12.5}
        />
        <KpiCard
          label="Leads"
          value={filteredTotals.leads}
          trend="up"
          change={8.2}
        />
        <KpiCard
          label="Contacted"
          value={filteredTotals.contacted}
          trend="up"
          change={15.3}
        />
        <KpiCard
          label="Interested"
          value={filteredTotals.interested}
          trend="up"
          change={10.1}
        />
        <KpiCard
          label="Applied"
          value={filteredTotals.applied}
          trend="up"
          change={18.7}
        />
      </div>

      {/* Performance Chart */}
      <ChartCard
        title="Campaign Performance"
        description="Daily signups and leads over time"
        className="col-span-full"
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={mockData.campaignMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis dataKey="date" stroke="#a0a0a0" style={{ fontSize: '12px' }} />
            <YAxis stroke="#a0a0a0" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#252525',
                border: '1px solid #404040',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f5f5f5' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="signups"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="leads"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Conversion Rate Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Rate Card */}
        <ChartCard title="Overall Conversion Rate" className="lg:col-span-1">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-5xl font-bold text-primary mb-2">
              {conversionRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-center text-sm">
              From signups to applications
            </p>
          </div>
        </ChartCard>

        {/* Funnel */}
        <ChartCard title="Conversion Funnel" className="lg:col-span-1">
          <FunnelChart
            data={[
              { name: 'Signups', value: filteredTotals.signups },
              { name: 'Leads', value: filteredTotals.leads },
              { name: 'Contacted', value: filteredTotals.contacted },
              { name: 'Interested', value: filteredTotals.interested },
              { name: 'Applied', value: filteredTotals.applied },
            ]}
          />
        </ChartCard>

        {/* Product Distribution */}
        <ChartCard title="Signups by Product" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockData.products}
                dataKey="signups"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {mockData.products.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#252525',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f5f5f5' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topMembers.map((member) => (
          <TopPerformerCard key={member.id} member={member} />
        ))}
      </div>

      {/* Member Leaderboard */}
      <ChartCard title="Top Members Leaderboard" className="col-span-full">
        <DataTable<typeof mockData.members[0]>
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'department', label: 'Department', sortable: true },
            { key: 'signups', label: 'Signups', sortable: true },
            { key: 'leads', label: 'Leads', sortable: true },
            {
              key: 'conversionRate',
              label: 'Conversion Rate',
              sortable: true,
              render: (value) => `${value.toFixed(1)}%`,
            },
          ]}
          data={filteredMembers}
        />
      </ChartCard>
    </div>
  );
}
