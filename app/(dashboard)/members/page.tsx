'use client';

import { useState } from 'react';
import { mockData } from '@/lib/mockData';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { DetailPanel } from '@/components/dashboard/DetailPanel';
import { Member } from '@/lib/mockData';
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

export default function MembersPage() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  // Filter members based on selections
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

  const totalSignups = filteredMembers.reduce((sum, m) => sum + m.signups, 0);
  const totalLeads = filteredMembers.reduce((sum, m) => sum + m.leads, 0);
  const totalContacted = filteredMembers.reduce((sum, m) => sum + m.contacted, 0);
  const totalApplied = filteredMembers.reduce((sum, m) => sum + m.applied, 0);

  const chartData = filteredMembers.map((m) => ({
    name: m.name.split(' ')[0],
    signups: m.signups,
    leads: m.leads,
    applied: m.applied,
  }));

  const handleReset = () => {
    setSelectedDepartments([]);
    setSelectedUniversities([]);
    setDateRange({ start: null, end: null });
    setSelectedMember(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Members</h1>
        <p className="text-muted-foreground mt-1">Team leaderboard and performance</p>
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

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Signups" value={totalSignups} trend="up" change={12.5} />
        <KpiCard label="Total Leads" value={totalLeads} trend="up" change={8.2} />
        <KpiCard label="Total Contacted" value={totalContacted} trend="up" change={15.3} />
        <KpiCard label="Total Applied" value={totalApplied} trend="up" change={18.7} />
      </div>

      {/* Performance Chart */}
      <ChartCard
        title="Member Performance Comparison"
        description="Signups, leads, and applications by member"
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
            <Bar dataKey="leads" fill="#06b6d4" />
            <Bar dataKey="applied" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Members Leaderboard */}
      <ChartCard title="Members Leaderboard" description="Click a row to view details">
        <DataTable<typeof mockData.members[0]>
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'department', label: 'Department', sortable: true },
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
          data={filteredMembers}
          onRowClick={(row) => setSelectedMember(row)}
        />
      </ChartCard>

      {/* Detail Panel */}
      <DetailPanel
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
