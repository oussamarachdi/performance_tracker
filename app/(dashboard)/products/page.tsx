'use client';

import { useState } from 'react';
import { mockData } from '@/lib/mockData';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { DataTable, Column } from '@/components/dashboard/DataTable';
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

const COLORS = ['#3b82f6', '#06b6d4', '#10b981'];

export default function ProductsPage() {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [selectedProduct, setSelectedProduct] = useState<typeof mockData.products[0] | null>(null);

  // Filter products based on date range
  const filteredProducts = mockData.products.filter((p) => {
    // Date range filtering (placeholder - would need actual date data)
    if (dateRange.start || dateRange.end) {
      return true;
    }
    return true;
  });

  const totalSignups = filteredProducts.reduce((sum, p) => sum + p.signups, 0);
  const totalLeads = filteredProducts.reduce((sum, p) => sum + p.leads, 0);
  const totalContacted = filteredProducts.reduce((sum, p) => sum + p.contacted, 0);
  const totalApplied = filteredProducts.reduce((sum, p) => sum + p.applied, 0);

  const chartData = filteredProducts.map((p) => ({
    name: p.name,
    signups: p.signups,
    leads: p.leads,
    applied: p.applied,
    conversionRate: p.conversionRate,
  }));

  const handleReset = () => {
    setSelectedDepartments([]);
    setDateRange({ start: null, end: null });
    setSelectedProduct(null);
  };

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
                formatter={(value) => `${(value as number).toFixed(1)}%`}
              />
              <Legend />
              <Bar dataKey="conversionRate" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Performance Metrics */}
      <ChartCard
        title="Product Performance"
        description="Signups, leads, and applications by product"
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

      {/* Products Table */}
      <ChartCard title="Product Details" description="Click a row to view details">
        <DataTable<typeof mockData.products[0]>
          columns={[
            { key: 'name', label: 'Product', sortable: true },
            { key: 'description', label: 'Description', sortable: false },
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
          data={filteredProducts}
          onRowClick={(row) => setSelectedProduct(row)}
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
