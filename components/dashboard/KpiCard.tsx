import { ArrowDown, ArrowUp } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number;
  change?: number;
  unit?: string;
  trend?: 'up' | 'down';
}

export function KpiCard({ label, value, change, unit = '', trend }: KpiCardProps) {
  const displayValue = unit === '%' ? value.toFixed(1) : value.toLocaleString();

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex flex-col hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-4xl font-bold text-foreground tracking-tight">
          {displayValue}<span className="text-xl">{unit}</span>
        </h3>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trend === 'up' ? 'bg-green-500/10 text-green-400' : trend === 'down' ? 'bg-red-500/10 text-red-400' : 'bg-muted text-muted-foreground'
            }`}
          >
            {trend === 'up' && <ArrowUp className="w-3 h-3" />}
            {trend === 'down' && <ArrowDown className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
