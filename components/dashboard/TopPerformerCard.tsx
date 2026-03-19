import { Member } from '@/lib/mockData';
import { TrendingUp } from 'lucide-react';

interface TopPerformerCardProps {
  member: Member;
}

export function TopPerformerCard({ member }: TopPerformerCardProps) {
  const avgSignupsPerBooth =
    member.boothsAttended > 0
      ? (member.signups / member.boothsAttended).toFixed(1)
      : '0';

  return (
    <div className="bg-[#1e293b] border border-border rounded-lg p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold text-[#F8FAFC] text-lg">{member.name}</h3>
          <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">{member.department}</p>
        </div>
        <div className="bg-green-500/10 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Signups</p>
            <p className="text-xl font-bold text-[#F8FAFC]">{member.signups.toLocaleString()}</p>
          </div>
          
        </div>
        <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Leads</p>
            <p className="text-xl font-bold text-[#F8FAFC]">{member.leads.toLocaleString()}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Booths attended</p>
            <p className="text-xl font-bold text-[#F8FAFC]">{member.boothsAttended}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Avg signups / booth</p>
            <p className="text-xl font-bold text-[#F8FAFC]">{avgSignupsPerBooth}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
