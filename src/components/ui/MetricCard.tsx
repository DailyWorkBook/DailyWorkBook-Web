import React from 'react';
import { CountUp } from './CountUp';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor?: string;
  deltaValue: string;
  deltaType?: 'up' | 'down' | 'flat';
  suffix?: string;
  trend?: 'positive-up' | 'positive-down' | 'negative-up' | 'negative-down';
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  iconBgColor = 'bg-brand-primary-050 text-brand-primary',
  deltaValue,
  deltaType = 'up',
  suffix,
  accentColor = '#2F6BFF'
}) => {
  const deltaColor =
    deltaType === 'up' ? 'text-status-present' :
    deltaType === 'down' ? 'text-status-absent' :
    'text-txt-tertiary';

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="wt-metric-card p-5 flex flex-col gap-4"
    >
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="text-[36px] font-extrabold tracking-tight text-txt-primary leading-none tabular-nums">
        <CountUp end={value} suffix={suffix} duration={900} />
      </div>

      {/* Delta row */}
      <div className="pt-3 border-t border-border/60">
        <div className={`flex items-center gap-1 text-xs font-semibold ${deltaColor}`}>
          {deltaType === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
          {deltaType === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
          {deltaType === 'flat' && <Minus className="w-3.5 h-3.5 text-txt-tertiary" />}
          <span>{deltaValue}</span>
        </div>
      </div>
    </motion.div>
  );
};
