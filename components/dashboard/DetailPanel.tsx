'use client';

import { Member, mockData } from '@/lib/mockData';
import { X } from 'lucide-react';

interface DetailPanelProps {
  member: Member | null;
  onClose: () => void;
}

export function DetailPanel({ member, onClose }: DetailPanelProps) {
  if (!member) return null;

  const universities = member.universitiesVisited
    .map((id) => mockData.universities.find((u) => u.id === id)?.name)
    .filter(Boolean);

  const products = member.productsPromoted
    .map((id) => mockData.products.find((p) => p.id === id)?.name)
    .filter(Boolean);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-lg z-50 overflow-y-auto">
        <div className="sticky top-0 border-b border-border bg-card p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Member Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Member Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
            <p className="text-sm text-muted-foreground">{member.department}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Signups</p>
              <p className="text-2xl font-bold text-foreground">{member.signups}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Applied</p>
              <p className="text-2xl font-bold text-foreground">{member.applied}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Conversion</p>
              <p className="text-2xl font-bold text-green-500">{member.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Leads</p>
              <p className="text-2xl font-bold text-foreground">{member.leads}</p>
            </div>
          </div>

          {/* Funnel Metrics */}
          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-3">Conversion Funnel</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Signups</span>
                <span className="text-sm font-semibold text-foreground">{member.signups}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Leads</span>
                <span className="text-sm font-semibold text-foreground">{member.leads} ({((member.leads / member.signups) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Contacted</span>
                <span className="text-sm font-semibold text-foreground">{member.contacted} ({((member.contacted / member.signups) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Interested</span>
                <span className="text-sm font-semibold text-foreground">{member.interested} ({((member.interested / member.signups) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Applied</span>
                <span className="text-sm font-semibold text-foreground">{member.applied} ({((member.applied / member.signups) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          {/* Universities */}
          {universities.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="font-semibold text-foreground mb-2">Universities Visited</h4>
              <div className="space-y-1">
                {universities.map((uni) => (
                  <p key={uni} className="text-sm text-muted-foreground">
                    {uni}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {products.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="font-semibold text-foreground mb-2">Products Promoted</h4>
              <div className="space-y-1">
                {products.map((prod) => (
                  <p key={prod} className="text-sm text-muted-foreground">
                    {prod}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
