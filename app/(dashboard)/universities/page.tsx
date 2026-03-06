'use client';

import { useState } from 'react';
import { mockData } from '@/lib/mockData';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { UniversityDetailPanel } from '@/components/dashboard/UniversityDetailPanel';
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

export default function UniversitiesPage() {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [selectedUniversity, setSelectedUniversity] = useState<typeof mockData.universities[0] | null>(null);

  // Filter universities based on date range
  const filteredUniversities = mockData.universities.filter((u) => {
    // Date range filtering (placeholder - would need actual date data)
    if (dateRange.start || dateRange.end) {
      return true;
    }
    return true;
  });

  const sortedUniversities = [...filteredUniversities].sort((a, b) => b.signups - a.signups);

  const totalSignups = sortedUniversities.reduce((sum, u) => sum + u.signups, 0);
  const totalLeads = sortedUniversities.reduce((sum, u) => sum + u.leads, 0);
  const totalContacted = sortedUniversities.reduce((sum, u) => sum + u.contacted, 0);
  const totalApplied = sortedUniversities.reduce((sum, u) => sum + u.applied, 0);

  const handleReset = () => {
    setSelectedDepartments([]);
    setDateRange({ start: null, end: null });
    setSelectedUniversity(null);
  };

  const chartData = sortedUniversities.map((u) => ({
    name: u.name.split(' ')[0],
    signups: u.signups,
    applied: u.applied,
    conversionRate: u.conversionRate,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Universities</h1>
        <p className="text-muted-foreground mt-1">Performance by university</p>
      </div>

      {/* Filters */}
      <FilterBar
        filters={[
          {
            label: 'Departments',
            options: mockData.departments.map((d) => ({ label: d.name, value: d.name })),
            selected: selectedDepartments,
            onChange: setSelectedDepartments,
          },
        ]}
        onDateRangeChange={setDateRange}
        onReset={handleReset}
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Signups" value={totalSignups} trend="up" change={12.5} />
        <KpiCard label="Total Leads" value={totalLeads} trend="up" change={8.2} />
        <KpiCard label="Total Contacted" value={totalContacted} trend="up" change={15.3} />
        <KpiCard label="Total Applied" value={totalApplied} trend="up" change={18.7} />
      </div>

      {/* Signups Chart */}
      <ChartCard
        title="Signups by University"
        description="Total signups and applications"
        className="col-span-full"
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis dataKey="name" stroke="#a0a0a0" style={{ fontSize: '12px' }} />
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
            <Bar dataKey="signups" fill="#3b82f6" />
            <Bar dataKey="applied" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Conversion Rate Chart */}
      <ChartCard
        title="Conversion Rate by University"
        description="Application conversion rate percentage"
        className="col-span-full"
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis dataKey="name" stroke="#a0a0a0" style={{ fontSize: '12px' }} />
            <YAxis stroke="#a0a0a0" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#252525',
                border: '1px solid #404040',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f5f5f5' }}
              formatter={(value) => `${(value as number).toFixed(1)}%`}
            />
            <Legend />
            <Bar dataKey="conversionRate" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Universities Table */}
      <ChartCard title="University Performance Details" description="Click a row to view details">
        <DataTable<typeof mockData.universities[0]>
          columns={[
            { key: 'name', label: 'University', sortable: true },
            { key: 'location', label: 'Location', sortable: true },
            { key: 'signups', label: 'Signups', sortable: true },
            { key: 'leads', label: 'Leads', sortable: true },
            { key: 'contacted', label: 'Contacted', sortable: true },
            { key: 'interested', label: 'Interested', sortable: true },
            { key: 'applied', label: 'Applied', sortable: true },
            {
              key: 'conversionRate',
              label: 'Conversion Rate',
              sortable: true,
              render: (value) => `${(value as number).toFixed(1)}%`,
            },
          ]}
          data={sortedUniversities}
          onRowClick={(row) => setSelectedUniversity(row)}
        />
      </ChartCard>

      {/* Detail Panel */}
      <UniversityDetailPanel
        university={selectedUniversity}
        onClose={() => setSelectedUniversity(null)}
      />
    </div>
  );
}
