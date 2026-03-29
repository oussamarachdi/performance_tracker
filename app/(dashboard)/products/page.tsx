'use client';

import { useState, useMemo, useEffect } from 'react';
import { getDashboardData } from '@/lib/api';
import type { DashboardData } from '@/lib/api';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { DataTable } from '@/components/dashboard/DataTable';
import { ProductDetailPanel } from '@/components/dashboard/ProductDetailPanel';
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
} from 'recharts';
import { CHART_COLORS } from '@/lib/chartColors';

const COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.accent];

export default function ProductsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [selectedProduct, setSelectedProduct] = useState<DashboardData['products'][0] | null>(null);

  useEffect(() => {
    getDashboardData().then(setData);
  }, []);

  const filteredProducts = useMemo(() => {
    const products = data?.products ?? [];
    const members = data?.members ?? [];
    if (selectedDepartments.length === 0) return products;
    return products.filter((p) =>
      members.some((m) => selectedDepartments.includes(m.department) && m.productsPromoted.includes(p.id))
    );
  }, [data?.products, data?.members, selectedDepartments]);

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

  const { totalSignups, totalLeads, totalApplied, productsWithMembersCount } = useMemo(() => {
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

    const stats = filteredProducts.map((p) => {
      // Intersection: Only consider members from selected departments who promote this product
      const membersToConsider = (data?.members ?? []).filter((m) => {
        const isDeptMatch = selectedDepartments.length === 0 || selectedDepartments.includes(m.department);
        return isDeptMatch && m.productsPromoted.includes(p.id);
      });

      const membersSelling = membersToConsider.length;

      // Calculate totals from these specific members for this product
      let signups = 0;
      let leads = 0;
      let applied = 0;

      membersToConsider.forEach(m => {
        const inRange = hasFilter ? (m.dailyMetrics || []).filter(dm => {
          const t = new Date(dm.date).getTime();
          return t >= lo && t <= hi;
        }) : (m.dailyMetrics || []);

        // Filter daily metrics by product
        const prodMetrics = inRange.filter(dm => {
          return m.productsPromoted.includes(p.id);
        });

        // Terminology Swap: UI Leads = Backend Signups (created), UI Signups = Backend Leads (total)
        leads += hasFilter ? prodMetrics.reduce((s, dm) => s + dm.signups, 0) : (m.signups / m.productsPromoted.length);
        signups += hasFilter ? prodMetrics.reduce((s, dm) => s + dm.leads, 0) : (m.leads / m.productsPromoted.length);
        applied += hasFilter ? prodMetrics.reduce((s, dm) => s + dm.applied, 0) : (m.applied / m.productsPromoted.length);
      });

      return {
        ...p,
        signups: Math.round(signups),
        leads: Math.round(leads),
        applied: Math.round(applied),
        membersSelling,
        conversionRate: signups > 0 ? (applied / signups) * 100 : 0
      };
    });

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
      productsWithMembersCount: stats
    };
  }, [data, dateBounds, filteredProducts, selectedDepartments]);

  const chartData = productsWithMembersCount.map((p) => ({
    name: p.name,
    signups: p.signups,
    leads: p.leads,
    applied: p.applied,
    conversionRate: p.conversionRate,
    membersSelling: p.membersSelling,
  }));

  const handleReset = () => {
    setSelectedDepartments([]);
    setDateRange({ start: null, end: null });
    setSelectedProduct(null);
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
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground mt-1">Performance by product category</p>
      </div>

      {/* Filters */}
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

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Total Signups" value={totalSignups} />
        <KpiCard label="Total Leads" value={totalLeads} />
        {selectedDepartments.length === 0 && (
          <KpiCard label="Total Applied" value={totalApplied} />
        )}
      </div>

      {/* Product Distribution and Performance */}
      <div className="grid grid-cols-1 gap-6">
        {/* Pie Chart */}
        <ChartCard
          title="Signups Distribution"
          description="Percentage of signups by product"
        >
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={productsWithMembersCount}
                dataKey="signups"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {productsWithMembersCount.map((_, index) => (
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

      {/* Members selling per product */}
      <ChartCard
        title="Members Selling per Product"
        description="Number of team members promoting each product"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#F8FAFC' }}
            />
            <Bar dataKey="membersSelling" name="Members selling" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Performance Metrics */}
      <ChartCard
        title="Product Performance"
        description="Signups, leads, and members selling by product"
        className="col-span-full"
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#F8FAFC' }}
            />
            <Legend />
            <Bar dataKey="signups" name="Signups" fill={CHART_COLORS.primary} />
            <Bar dataKey="leads" name="Leads" fill={CHART_COLORS.secondary} />
            <Bar dataKey="membersSelling" name="Members selling" fill={CHART_COLORS.neutral} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Products Table */}
      <ChartCard title="Product Details" description="Click a row to view details">
        <DataTable<(typeof productsWithMembersCount)[0]>
          columns={[
            { key: 'name', label: 'Product', sortable: true },
            { key: 'membersSelling', label: 'Members selling', sortable: true },
            { key: 'signups', label: 'Signups', sortable: true },
            { key: 'leads', label: 'Leads', sortable: true },
          ]}
          data={productsWithMembersCount}
          onRowClick={(row) => setSelectedProduct(data.products.find((p) => p.id === row.id) ?? null)}
        />
      </ChartCard>

      {/* Detail Panel */}
      <ProductDetailPanel
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
