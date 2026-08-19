import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export interface SortableHeaderProps {
  field: string;
  label: string;
  currentSort?: string;
  currentOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  label,
  currentSort,
  currentOrder,
  onSort,
  className = '',
}) => {
  const isActive = currentSort === field;
  const Icon = !isActive ? ArrowUpDown : currentOrder === 'asc' ? ArrowUp : ArrowDown;

  return (
    <th className={`px-4 py-3 font-mono uppercase text-[10px] tracking-wide ${className}`} scope="col">
      <button
        onClick={() => onSort(field)}
        aria-label={`Sort by ${label}`}
        aria-sort={isActive ? (currentOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={`inline-flex items-center gap-1 hover:text-txt-primary transition-colors ${
          isActive ? 'text-brand-primary font-bold' : ''
        }`}
      >
        {label}
        <Icon className="w-3 h-3" aria-hidden />
      </button>
    </th>
  );
};
