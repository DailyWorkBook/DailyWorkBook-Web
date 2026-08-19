import React from 'react';

export interface PageHeaderProps {
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, eyebrowIcon, title, description, actions }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/80 pb-4">
    <div className="min-w-0">
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 p-1 rounded-lg bg-brand-primary/10 text-brand-primary font-mono text-[11px] font-bold uppercase tracking-wide">
          {eyebrowIcon}
          {eyebrow}
        </span>
      )}
      <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1.5">{title}</h1>
      {description && <p className="text-xs text-txt-secondary mt-1 max-w-2xl leading-relaxed">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
  </div>
);
