import React, { useState, useEffect } from 'react';
import { DollarSign, Download, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { payrollApi } from '../../../services/payrollApi';

export const PayrollPage: React.FC = () => {
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayroll() {
      try {
        setLoading(true);
        const data = await payrollApi.getSummary();
        setPayrollData(data || []);
      } catch (err) {
        console.error('Error loading payroll summary:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayroll();
  }, []);

  const totalPayrollCost = payrollData.reduce((sum, p) => sum + p.netSalary, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 font-mono text-xs font-bold flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-emerald-500" /> AUTOMATED WORKFORCE PAYROLL
            </span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Payroll Ledger & Pay Slips
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] text-txt-secondary font-mono">Total Monthly Payroll</div>
            <div className="text-lg font-black text-emerald-600">₹{totalPayrollCost.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> Calculating monthly guard payroll...
        </div>
      )}

      {!loading && (
        <div className="bg-bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-surface-2 border-b border-border/80 text-txt-secondary font-mono uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Guard Name</th>
                  <th className="px-4 py-3">Site / Unit</th>
                  <th className="px-4 py-3">Days Worked</th>
                  <th className="px-4 py-3">Gross Salary</th>
                  <th className="px-4 py-3">PF & ESI Deductions</th>
                  <th className="px-4 py-3 text-right">Net Payable Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payrollData.map((p, i) => (
                  <tr key={i} className="hover:bg-bg-surface-2/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-txt-primary">{p.name}</td>
                    <td className="px-4 py-3 text-txt-secondary">{p.siteName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-txt-primary">
                      {p.presentDays} Days ({p.overtimeHours}h OT)
                    </td>
                    <td className="px-4 py-3 font-mono">₹{p.grossSalary.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-mono text-rose-500">
                      -₹{(p.pfDeduction + p.esiDeduction).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-emerald-600">
                      ₹{p.netSalary.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
