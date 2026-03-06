'use client';

import { useState } from 'react';
import { mockData } from '@/lib/mockData';
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

export default function DepartmentsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  // Filter departments based on date range
  const filteredDepartments = mockData.departments.filter((d) => {
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

  const handleReset = () => {
    setDateRange({ start: null, end: null });
  };

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
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Signups" value={totalSignups} trend="up" change={12.5} />
        <KpiCard label="Total Leads" value={totalLeads} trend="up" change={8.2} />
        <KpiCard label="Total Contacted" value={totalContacted} trend="up" change={15.3} />
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
            <Bar dataKey="leads" fill="#06b6d4" />
            <Bar dataKey="applied" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Conversion Rate by Department Chart */}
      <ChartCard
        title="Conversion Rate by Department"
        description="Application conversion rate percentage"
        className="col-span-full"
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={filteredDepartments}>
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

      {/* Department Details Table */}
      <ChartCard title="Department Performance Details" className="col-span-full">
        <DataTable<typeof mockData.departments[0]>
          columns={[
            { key: 'name', label: 'Department', sortable: true },
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
          data={filteredDepartments}
        />
      </ChartCard>
    </div>
  );
}
