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

  const productsWithMembersCount = useMemo(() => {
    const members = data?.members ?? [];
    return filteredProducts.map((p) => {
      const membersSelling = members.filter((m) => m.productsPromoted.includes(p.id)).length;
      return { ...p, membersSelling };
    });
  }, [filteredProducts, data?.members]);

  const totalSignups = filteredProducts.reduce((sum, p) => sum + p.signups, 0);
  const totalLeads = filteredProducts.reduce((sum, p) => sum + p.leads, 0);
  const totalContacted = filteredProducts.reduce((sum, p) => sum + p.contacted, 0);
  const totalApplied = filteredProducts.reduce((sum, p) => sum + p.applied, 0);
  const totalMembersSelling = productsWithMembersCount.reduce((sum, p) => sum + p.membersSelling, 0);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Signups" value={totalSignups} trend="up" change={12.5} />
        <KpiCard label="Total Leads" value={totalLeads} trend="up" change={8.2} />
        <KpiCard label="Total Applied" value={totalApplied} trend="up" change={18.7} />
      </div>

      {/* Product Distribution and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <ChartCard
          title="Signups Distribution"
          description="Percentage of signups by product"
        >
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={filteredProducts}
                dataKey="signups"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {filteredProducts.map((_, index) => (
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

        {/* Conversion Rate Chart */}
        <ChartCard
          title="Conversion Rate by Product"
          description="Application conversion percentage"
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
                formatter={(value) => (value != null && typeof value === 'number' && !Number.isNaN(value)) ? `${Number(value).toFixed(1)}%` : '—'}
              />
              <Legend />
              <Bar dataKey="conversionRate" fill="#f59e0b" />
            </BarChart>
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
        description="Signups, leads, applications and members selling by product"
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
            <Bar dataKey="signups" fill={CHART_COLORS.primary} />
            <Bar dataKey="leads" fill={CHART_COLORS.secondary} />
            <Bar dataKey="applied" fill={CHART_COLORS.accent} />
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
            { key: 'applied', label: 'Applied', sortable: true },
            {
              key: 'conversionRate',
              label: 'Conversion Rate',
              sortable: true,
              render: (value) => (value != null && typeof value === 'number' && !Number.isNaN(value)) ? `${Number(value).toFixed(1)}%` : '—',
            },
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
