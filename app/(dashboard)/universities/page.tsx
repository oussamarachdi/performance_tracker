'use client';

import { useState, useMemo, useEffect } from 'react';
import { getDashboardData } from '@/lib/api';
import type { DashboardData } from '@/lib/api';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { DataTable } from '@/components/dashboard/DataTable';
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
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import { CHART_COLORS } from '@/lib/chartColors';
import { CHART_COLORS_ARRAY } from '@/lib/chartColors';

export default function UniversitiesPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [selectedUniversity, setSelectedUniversity] = useState<DashboardData['universities'][0] | null>(null);

  useEffect(() => {
    getDashboardData().then(setData);
  }, []);

  const filteredUniversities = useMemo(() => {
    const universities = data?.universities ?? [];
    const members = data?.members ?? [];
    if (selectedDepartments.length === 0) return universities;
    const membersInSelectedDepts = members.filter((m) => selectedDepartments.includes(m.department));
    return universities.filter((uni) =>
      membersInSelectedDepts.some((m) => m.universitiesVisited.includes(uni.id))
    );
  }, [data?.universities, data?.members, selectedDepartments]);
  const sortedUniversities = useMemo(
    () => [...filteredUniversities].sort((a, b) => b.signups - a.signups),
    [filteredUniversities]
  );

  // Per-university stats: attendees (members who visited), booths allocated to this uni, avg signups per attendee
  const universityStats = useMemo(() => {
    return sortedUniversities.map((uni) => {
      const membersWhoVisited = (data?.members ?? []).filter((m) => m.universitiesVisited.includes(uni.id));
      const attendees = membersWhoVisited.length;
      const boothsAtUni =
        attendees > 0
          ? membersWhoVisited.reduce((sum, m) => sum + m.boothsAttended / m.universitiesVisited.length, 0)
          : 0;
      const avgSignupsPerAttendee = attendees > 0 ? Number((uni.signups / attendees).toFixed(1)) : 0;
      return {
        ...uni,
        shortName: uni.name.split(' ')[0],
        attendees,
        boothsAtUni: Math.round(boothsAtUni * 10) / 10,
        avgSignupsPerAttendee,
      };
    });
  }, [sortedUniversities, data?.members]);

  const overallAvgAttendees =
    universityStats.length > 0
      ? Number(
          (universityStats.reduce((s, u) => s + u.attendees, 0) / universityStats.length).toFixed(1)
        )
      : 0;
  const totalAttendeeVisits = universityStats.reduce((s, u) => s + u.attendees, 0);
  const totalSignups = sortedUniversities.reduce((sum, u) => sum + u.signups, 0);
  const totalLeads = sortedUniversities.reduce((sum, u) => sum + u.leads, 0);
  const overallAvgSignupsPerAttendee =
    totalAttendeeVisits > 0 ? Number((totalSignups / totalAttendeeVisits).toFixed(1)) : 0;

  const handleReset = () => {
    setSelectedDepartments([]);
    setDateRange({ start: null, end: null });
    setSelectedUniversity(null);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
  };
  const labelStyle = { color: '#F8FAFC' as const };
  const gridStroke = '#334155';
  const axisStroke = '#94a3b8';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Universities</h1>
        <p className="text-muted-foreground mt-1">Signups, leads, attendees & attendance by university</p>
      </div>

      <FilterBar
        filters={[
          {
            label: 'Departments',
            options: data.departments.map((d) => ({ label: d.name, value: d.name })),
            selected: selectedDepartments,
            onChange: setSelectedDepartments,
          },
        ]}
        onDateRangeChange={setDateRange}
        onReset={handleReset}
        hasDateRangeActive={!!(dateRange.start || dateRange.end)}
        dateRange={dateRange}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Signups" value={totalSignups} trend="up" change={12.5} />
        <KpiCard label="Total Leads" value={totalLeads} trend="up" change={8.2} />
        <KpiCard label="Avg attendees (all unis)" value={overallAvgAttendees} />
        <KpiCard label="Total attendee-visits" value={totalAttendeeVisits} />
        <KpiCard label="Avg signups/attendee (overall)" value={overallAvgSignupsPerAttendee} />
      </div>

      {/* Chart 1: Signups & Leads by University - grouped bar */}
      <ChartCard
        title="Signups & Leads by University"
        description="Volume of signups and leads per university"
        className="col-span-full"
      >
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={universityStats}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="shortName" stroke={axisStroke} style={{ fontSize: '12px' }} />
            <YAxis stroke={axisStroke} style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
            <Legend />
            <Bar dataKey="signups" name="Signups" fill={CHART_COLORS.primary} />
            <Bar dataKey="leads" name="Leads" fill={CHART_COLORS.secondary} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 2: Attendees per university + How much we attended (booths at uni) - two bars or stacked */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Attendees per University"
          description="Number of team members who attended each university"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={universityStats} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" stroke={axisStroke} style={{ fontSize: '11px' }} />
              <YAxis type="category" dataKey="shortName" stroke={axisStroke} style={{ fontSize: '11px' }} width={70} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
              <Bar dataKey="attendees" name="Attendees" fill={CHART_COLORS.accent} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard
          title="How Much We Attended (Booths)"
          description="Allocated booth-days at each university"
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={universityStats}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="shortName" stroke={axisStroke} style={{ fontSize: '11px' }} />
              <YAxis stroke={axisStroke} style={{ fontSize: '11px' }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
              <Bar dataKey="boothsAtUni" name="Booths at university" fill={CHART_COLORS.neutral} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      

      {/* Summary: Avg attendees vs each university (horizontal bar comparing to overall avg) */}
      <ChartCard
        title="Attendees vs Overall Average"
        description={`Overall avg attendees: ${overallAvgAttendees}. Bars show each university's attendee count.`}
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={universityStats}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="shortName" stroke={axisStroke} style={{ fontSize: '12px' }} />
            <YAxis stroke={axisStroke} style={{ fontSize: '12px' }} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
            <ReferenceLine y={overallAvgAttendees} stroke="#64748B" strokeDasharray="4 4" label={{ value: 'Avg', position: 'right', fill: '#94a3b8' }} />
            <Bar
              dataKey="attendees"
              name="Attendees"
              fill={CHART_COLORS.secondary}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Table */}
      <ChartCard title="University Performance Details" description="Click a row to view details">
        <DataTable<(typeof universityStats)[0]>
          columns={[
            { key: 'name', label: 'University', sortable: true },
            { key: 'signups', label: 'Signups', sortable: true },
            { key: 'leads', label: 'Leads', sortable: true },
            { key: 'attendees', label: 'Attendees', sortable: true },
            { key: 'boothsAtUni', label: 'Booths at uni', sortable: true },
            {
              key: 'avgSignupsPerAttendee',
              label: 'Avg signups/attendee',
              sortable: true,
            },
            {
              key: 'conversionRate',
              label: 'Conversion Rate',
              sortable: true,
              render: (value) => `${(value as number).toFixed(1)}%`,
            },
          ]}
          data={universityStats}
          onRowClick={(row) => setSelectedUniversity(data.universities.find((u) => u.id === row.id) ?? null)}
        />
      </ChartCard>

      <UniversityDetailPanel
        university={selectedUniversity}
        onClose={() => setSelectedUniversity(null)}
      />
    </div>
  );
}
