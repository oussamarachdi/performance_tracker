export type FilterType = {
  dateRange?: {
    from: Date;
    to: Date;
  };
  products?: string[];
  universities?: string[];
  departments?: string[];
  members?: string[];
};

export type ConversionMetric = {
  label: string;
  value: number;
  percentage: string;
  trend?: number;
};
