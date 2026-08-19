import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PageMeta } from '../../services';

export interface PaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  label?: string;
}

const PAGE_SIZES = [10, 25, 50, 100];

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange, onPageSizeChange, label = 'records' }) => {
  if (meta.total === 0) return null;

  const first = (meta.page - 1) * meta.pageSize + 1;
  const last = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/70 text-xs">
      <p className="text-txt-secondary tabular-nums">
        Showing <span className="font-bold text-txt-primary">{first}</span>–
        <span className="font-bold text-txt-primary">{last}</span> of{' '}
        <span className="font-bold text-txt-primary">{meta.total}</span> {label}
      </p>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5 text-txt-secondary">
            <span className="hidden sm:inline">Rows</span>
            <select
              value={meta.pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="px-2 py-1 bg-bg-surface-2 border border-border rounded-lg text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              aria-label="Rows per page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(meta.page - 1)}
            disabled={!meta.hasPrevious}
            aria-label="Previous page"
            className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg border border-border text-txt-secondary hover:text-txt-primary hover:border-brand-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden />
          </button>
          <span className="px-2 text-txt-secondary tabular-nums">
            {meta.page} / {meta.totalPages}
          </span>
          <button
            onClick={() => onPageChange(meta.page + 1)}
            disabled={!meta.hasNext}
            aria-label="Next page"
            className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg border border-border text-txt-secondary hover:text-txt-primary hover:border-brand-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};
