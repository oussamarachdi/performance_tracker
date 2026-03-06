import { Member } from '@/lib/mockData';
import { TrendingUp } from 'lucide-react';

interface TopPerformerCardProps {
  member: Member;
}

export function TopPerformerCard({ member }: TopPerformerCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground text-lg">{member.name}</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{member.department}</p>
        </div>
        <div className="bg-green-500/10 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-secondary/30 rounded-lg p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Signups</p>
          <p className="text-3xl font-bold text-foreground">{member.signups.toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Leads</p>
            <p className="text-xl font-bold text-foreground">{member.leads.toLocaleString()}</p>
          </div>
          <div className="bg-secondary/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Applied</p>
            <p className="text-xl font-bold text-foreground">{member.applied.toLocaleString()}</p>
          </div>
        </div>
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conversion Rate</span>
            <span className="text-sm font-bold bg-green-500/10 text-green-400 px-3 py-1 rounded-full">{member.conversionRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
