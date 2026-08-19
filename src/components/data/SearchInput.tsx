import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
  label = 'Search',
}) => (
  <div className={`relative ${className}`}>
    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary" aria-hidden />
    <input
      type="search"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-8 py-2 min-h-[38px] bg-bg-surface border border-border rounded-xl text-xs text-txt-primary placeholder:text-txt-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        aria-label="Clear search"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-txt-tertiary hover:text-txt-primary rounded"
      >
        <X className="w-3.5 h-3.5" aria-hidden />
      </button>
    )}
  </div>
);
