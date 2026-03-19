'use client';

import { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { DateRangeFilter, type DateRange } from './DateRangeFilter';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: {
    label: string;
    options: FilterOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
  }[];
  onReset?: () => void;
  onDateRangeChange?: (range: DateRange) => void;
  showDateFilter?: boolean;
  /** When true, Reset button shows even if only the date range is set */
  hasDateRangeActive?: boolean;
  /** Current date range (for DateRangeFilter display and sync on reset) */
  dateRange?: DateRange;
}

export function FilterBar({ filters, onReset, onDateRangeChange, showDateFilter = true, hasDateRangeActive = false, dateRange }: FilterBarProps) {
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = hasDateRangeActive || filters.some((f) => f.selected.length > 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (expandedFilter && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExpandedFilter(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedFilter]);

  const handleDateReset = () => {
    if (onDateRangeChange) {
      onDateRangeChange({ start: null, end: null });
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 ml-0.5">
          <Filter className="w-4 h-4 text-primary/70" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filters</span>
        </div>

        {showDateFilter && onDateRangeChange && (
          <DateRangeFilter
            onDateRangeChange={onDateRangeChange}
            onReset={handleDateReset}
            value={dateRange}
          />
        )}

        {filters.map((filter) => (
          <div key={filter.label} className="relative" ref={expandedFilter === filter.label ? dropdownRef : undefined}>
            <button
              type="button"
              onClick={() =>
                setExpandedFilter(expandedFilter === filter.label ? null : filter.label)
              }
              className="px-3 py-2 rounded-md text-sm bg-secondary border border-border text-foreground hover:bg-secondary/80 hover:border-primary/40 transition-all duration-200"
            >
              {filter.label}
              {filter.selected.length > 0 && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full font-semibold">
                  {filter.selected.length}
                </span>
              )}
            </button>

            {expandedFilter === filter.label && (
              <div
                className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg shadow-primary/5 z-10 min-w-52"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto">
                  {filter.options.map((option) => (
                    <label
                      key={String(option.value)}
                      className="flex items-center gap-2 cursor-pointer hover:bg-secondary p-2.5 rounded-md transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filter.selected.includes(String(option.value))}
                        onChange={(e) => {
                          const newSelected = e.target.checked
                            ? [...filter.selected, String(option.value)]
                            : filter.selected.filter((s) => s !== String(option.value));
                          filter.onChange(newSelected);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-destructive/30 transition-all duration-200"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
