interface FunnelData {
  name: string;
  value: number;
}

interface FunnelChartProps {
  data: FunnelData[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-muted-foreground">No data available</div>;
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {data.map((item, index) => {
        const width = (item.value / maxValue) * 100;
        const percentage = ((item.value / data[0].value) * 100).toFixed(1);

        return (
          <div key={index} className="w-full">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-foreground">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{item.value.toLocaleString()}</span>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">{percentage}%</span>
              </div>
            </div>
            <div className="h-10 bg-secondary/40 rounded-full overflow-hidden border border-border/50">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-lg hover:shadow-xl"
                style={{
                  width: `${width}%`,
                  backgroundColor: colors[index % colors.length],
                  opacity: 0.9,
                }}
              >
                {width > 15 && (
                  <span className="text-xs font-bold text-white tracking-tight">
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
