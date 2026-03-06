'use client';

import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  rowClassName?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  rowClassName = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  let displayData = [...data];

  if (sortKey) {
    displayData.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/20">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3.5 text-left font-semibold text-foreground uppercase text-xs tracking-wide ${col.className || ''}`}
              >
                <div className="flex items-center gap-2">
                  <span>{col.label}</span>
                  {col.sortable && (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="p-0.5 hover:text-primary hover:bg-primary/10 rounded transition-all duration-200"
                      title="Click to sort"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-border hover:bg-secondary/30 transition-all duration-150 ${
                onRowClick ? 'cursor-pointer' : ''
              } ${rowClassName}`}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className={`px-4 py-3 text-foreground ${col.className || ''}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
