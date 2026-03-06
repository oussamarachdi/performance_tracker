import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, description, children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-card border border-border rounded-lg p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
        )}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
