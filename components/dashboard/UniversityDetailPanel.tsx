'use client';

import { ChevronRight, X } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { mockData } from '@/lib/mockData';
import {
  LineChart,
  Line,
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

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

interface UniversityDetailPanelProps {
  university: typeof mockData.universities[0] | null;
  onClose: () => void;
}

export function UniversityDetailPanel({ university, onClose }: UniversityDetailPanelProps) {
  if (!university) return null;

  // Get members working in this university
  const universityMembers = mockData.members.filter((m) =>
    mockData.campaignMetrics.some((cm) => cm.universityId === university.id)
  );

  // Get products for this university
  const universityProducts = mockData.products;

  // Generate mock daily data for this university
  const dailyData = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    signups: Math.floor(Math.random() * 50 + 20),
    leads: Math.floor(Math.random() * 30 + 10),
    applied: Math.floor(Math.random() * 15 + 5),
  }));

  return (
    <>
      {/* Overlay */}
      {university && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-2xl bg-background border-l border-border z-50 overflow-y-auto transition-transform duration-300 ${
          university ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{university.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{university.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Total Signups
              </p>
              <p className="text-3xl font-bold text-primary">{university.signups}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Total Applied
              </p>
              <p className="text-3xl font-bold text-green-400">{university.applied}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Conversion Rate
              </p>
              <p className="text-3xl font-bold text-amber-400">{(university.conversionRate != null && !Number.isNaN(university.conversionRate) ? university.conversionRate : 0).toFixed(1)}%</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Leads
              </p>
              <p className="text-3xl font-bold text-cyan-400">{university.leads}</p>
            </div>
          </div>

          {/* Performance Trend */}
          <ChartCard title="Daily Performance Trend" description="Last 30 days">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="date" stroke="#a0a0a0" style={{ fontSize: '11px' }} />
                <YAxis stroke="#a0a0a0" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#252525',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f5f5f5' }}
                />
                <Legend />
                <Line type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="leads" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="applied" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Funnel */}
          <ChartCard title="Conversion Funnel" description="Full conversion path">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: 'Signups', value: university.signups },
                  { name: 'Leads', value: university.leads },
                  { name: 'Contacted', value: university.contacted },
                  { name: 'Interested', value: university.interested },
                  { name: 'Applied', value: university.applied },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="name" stroke="#a0a0a0" style={{ fontSize: '11px' }} />
                <YAxis stroke="#a0a0a0" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#252525',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f5f5f5' }}
                />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Members */}
          <ChartCard title="Top Members at this University" description="By signups">
            <div className="space-y-3">
              {universityMembers.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between bg-secondary/20 rounded-lg p-3 hover:bg-secondary/40 transition-colors duration-200"
                >
                  <div>
                    <p className="font-semibold text-foreground text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.department}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">{member.signups} signups</p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </>
  );
}
