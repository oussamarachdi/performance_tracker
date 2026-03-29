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

  const { totalSignups, totalLeads, totalApplied, universityStats } = useMemo(() => {
    const { hasFilter, lo, hi } = dateBounds;

    // Global metrics for the selected range
    const metricsInRange = (data?.campaignMetrics ?? []).filter((m) => {
      if (!hasFilter) return true;
      const t = new Date(m.date).getTime();
      return t >= lo && t <= hi;
    });
    const globSignups = metricsInRange.reduce((s, d) => (s as number) + d.signups, 0);
    const globLeads = metricsInRange.reduce((s, d) => (s as number) + d.leads, 0);
    const globApplied = metricsInRange.reduce((s, d) => (s as number) + d.applied, 0);

    const stats = filteredUniversities.map((uni) => {
      // Intersection: Only consider members from selected departments who visited this university
      const membersToConsider = (data?.members ?? []).filter((m) => {
        const isDeptMatch = selectedDepartments.length === 0 || selectedDepartments.includes(m.department);
        return isDeptMatch && m.universitiesVisited.includes(uni.id);
      });

      const attendees = membersToConsider.length;

      // Calculate totals from these specific members for this university
      let signups = 0;
      let leads = 0;
      let applied = 0;
      let boothsAtUni = 0;

      membersToConsider.forEach(m => {
        const inRange = hasFilter ? (m.dailyMetrics || []).filter(dm => {
          const t = new Date(dm.date).getTime();
          return t >= lo && t <= hi;
        }) : (m.dailyMetrics || []);

        // Filter daily metrics by university since members visit multiple
        const uniMetrics = inRange.filter(dm => {
          // This is a heuristic: if they visited only 1 uni that day, or if we rely on uniBreakdown
          // For simplicity and accuracy in this specific mockup/data-gen, we use the member's uni stats if they visited this uni
          // In a real system, we'd have dm.universityId
          return m.universitiesVisited.includes(uni.id);
        });

        // Terminology Swap: UI Leads = Backend Signups (created), UI Signups = Backend Leads (total)
        leads += hasFilter ? uniMetrics.reduce((s, dm) => s + dm.signups, 0) : (m.signups / m.universitiesVisited.length);
        signups += hasFilter ? uniMetrics.reduce((s, dm) => s + dm.leads, 0) : (m.leads / m.universitiesVisited.length);
        applied += hasFilter ? uniMetrics.reduce((s, dm) => s + dm.applied, 0) : (m.applied / m.universitiesVisited.length);

        const mBoothsAdjusted = hasFilter ? uniMetrics.length : (m.boothsAttended / m.universitiesVisited.length);
        boothsAtUni += mBoothsAdjusted;
      });

      const avgSignupsPerAttendee = attendees > 0 ? Number((signups / attendees).toFixed(1)) : 0;

      return {
        ...uni,
        signups: Math.round(signups),
        leads: Math.round(leads),
        applied: Math.round(applied),
        shortName: uni.name.split(' ')[0],
        attendees,
        boothsAtUni: Math.round(boothsAtUni * 10) / 10,
        avgSignupsPerAttendee,
      };
    }).sort((a, b) => b.signups - a.signups);

    const hasDeptFilter = selectedDepartments.length > 0;
    const finalTotals = (hasDeptFilter || hasFilter)
      ? stats.reduce((acc: { signups: number, leads: number, applied: number }, curr) => ({
        signups: acc.signups + curr.signups,
        leads: acc.leads + curr.leads,
        applied: acc.applied + curr.applied
      }), { signups: 0, leads: 0, applied: 0 })
      : { signups: globSignups, leads: globLeads, applied: globApplied };

    return {
      totalSignups: finalTotals.signups,
      totalLeads: finalTotals.leads,
      totalApplied: finalTotals.applied,
      universityStats: stats
    };
  }, [data, dateBounds, filteredUniversities, selectedDepartments]);

  const overallAvgAttendees =
    universityStats.length > 0
      ? Number(
        (universityStats.reduce((s, u) => s + u.attendees, 0) / universityStats.length).toFixed(1)
      )
      : 0;
  const totalAttendeeVisits = universityStats.reduce((s, u) => s + u.attendees, 0);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Total Signups" value={totalSignups} />
        <KpiCard label="Total Leads" value={totalLeads} />
        {selectedDepartments.length === 0 && (
          <KpiCard label="Total Applied" value={totalApplied} />
        )}
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
