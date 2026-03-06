'use client';

import { useState } from 'react';
import { Calendar, X } from 'lucide-react';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void;
  onReset: () => void;
}

export function DateRangeFilter({ onDateRangeChange, onReset }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [hasSelection, setHasSelection] = useState(false);

  const handleApply = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start || end) {
      onDateRangeChange({ start, end });
      setHasSelection(true);
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setHasSelection(false);
    onReset();
  };

  const getDisplayText = () => {
    if (!hasSelection) return 'Date Range';
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    }
    if (startDate) return `From ${startDate}`;
    if (endDate) return `Until ${endDate}`;
    return 'Date Range';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground hover:bg-secondary/80 hover:border-primary/40 transition-all duration-200 flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        {getDisplayText()}
        {hasSelection && (
          <span className="ml-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
            Active
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-card border border-border rounded-lg shadow-lg shadow-primary/5 z-20 p-4 min-w-80">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-foreground hover:border-primary/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-foreground hover:border-primary/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleApply}
                className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors duration-200"
              >
                Apply
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 bg-secondary border border-border text-foreground rounded-md text-sm font-semibold hover:bg-secondary/80 transition-colors duration-200"
              >
                Close
              </button>
            </div>
            {hasSelection && (
              <button
                onClick={handleReset}
                className="w-full px-3 py-2 bg-destructive/10 border border-destructive/30 text-destructive rounded-md text-sm font-semibold hover:bg-destructive/20 transition-colors duration-200 flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear Dates
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
