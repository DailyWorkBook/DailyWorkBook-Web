import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Download, Filter, Search, FileText, CheckCircle2, Building2, User, CreditCard, ShieldCheck, Printer, ArrowRightLeft, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Sheet } from '../../../components/ui/Sheet';
import { INITIAL_CLIENTS } from '../../../mockData/clients';
import { INITIAL_PAYROLL_RUNS, PayrollRun, Payslip } from '../../../mockData/payroll';
import confetti from 'canvas-confetti';

export const PayrollPage: React.FC = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>(INITIAL_CLIENTS[0].id);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDisbursing, setIsDisbursing] = useState(false);

  const activeClient = INITIAL_CLIENTS.find(c => c.id === selectedClientId) || INITIAL_CLIENTS[0];
  const activeRun: PayrollRun = INITIAL_PAYROLL_RUNS.find(r => r.clientId === selectedClientId) || INITIAL_PAYROLL_RUNS[0];

  const filteredPayslips = activeRun.payslips.filter(p =>
    p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.siteName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportCSV = () => {
    let csv = 'Employee Code,Name,Role,Client,Site,Post,Present Days,Overtime Hrs,Base Wage,Basic Pay,OT Pay,Night Allowance,Gross Pay,PF (12%),ESI (0.75%),Net Payable,Bank Account,IFSC\n';
    filteredPayslips.forEach(p => {
      csv += `"${p.employeeCode}","${p.employeeName}","${p.role}","${p.clientName}","${p.siteName}","${p.postName}",${p.presentDays},${p.overtimeHours},${p.baseDailyWage},${p.basicSalary},${p.overtimePay},${p.nightAllowance},${p.grossSalary},${p.pfDeduction},${p.esiDeduction},${p.netPayableSalary},"${p.bankAccountNumber}","${p.bankIfsc}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${activeClient.code}_${selectedMonth}.csv`;
    a.click();

    confetti({ particleCount: 50, spread: 60 });
    triggerToast(`Exported payroll bank file for ${activeClient.name} to CSV!`);
  };

  const handleBatchDisbursal = () => {
    setIsDisbursing(true);
    setTimeout(() => {
      setIsDisbursing(false);
      confetti({ particleCount: 65, spread: 70 });
      triggerToast(`Batch salary disbursement processed! Direct bank transfer initiated for ${activeRun.totalGuards} guards.`);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-bg-surface via-bg-surface to-brand-primary-050/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-teal-050 text-brand-teal border border-brand-teal/20">
              Financial Control & Statutory Compliance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Payroll Management</h1>
          <p className="text-xs text-txt-secondary mt-1">Generate client-specific payroll registers, compute statutory PF/ESI deductions, and disburse guard salaries</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<Wallet className="w-4 h-4 text-brand-teal" />} isLoading={isDisbursing} onClick={handleBatchDisbursal}>
            Process Batch Disbursal
          </Button>
          <Button variant="primary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
            Export Payroll CSV
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-brand-teal-050 border border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Processed Guards</span>
            <div className="text-2xl font-extrabold text-txt-primary tracking-tight mt-0.5 tabular-nums">{activeRun.totalGuards} Guards</div>
            <span className="text-[11px] text-brand-primary font-semibold">{activeClient.name}</span>
          </div>
          <div className="p-3 bg-bg-surface-2 text-txt-primary rounded-xl">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Total Gross Salary</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">
              ₹{(activeRun.totalGrossAmount / 100000).toFixed(2)} Lakhs
            </div>
            <span className="text-[11px] text-txt-secondary">Includes OT & Night Allowance</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Statutory PF/ESI Deductions</span>
            <div className="text-2xl font-extrabold text-status-late tracking-tight mt-0.5 tabular-nums">
              ₹{(activeRun.totalDeductionsAmount / 1000).toFixed(1)}k
            </div>
            <span className="text-[11px] text-txt-secondary">12% PF + 0.75% ESI</span>
          </div>
          <div className="p-3 bg-status-late/10 text-status-late rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Net Payable Amount</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">
              ₹{(activeRun.totalNetPayableAmount / 100000).toFixed(2)} Lakhs
            </div>
            <span className="text-[11px] text-brand-teal font-semibold">Approved for Direct Deposit</span>
          </div>
          <div className="p-3 bg-brand-teal-050 text-brand-teal rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Selection Bar */}
      <div className="wt-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block font-bold text-txt-primary mb-1">Select Corporate Client</label>
          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
          >
            {INITIAL_CLIENTS.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-txt-primary mb-1">Select Payroll Month</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
          >
            <option value="2026-08">August 2026 (Current Cycle)</option>
            <option value="2026-07">July 2026 (Processed)</option>
            <option value="2026-06">June 2026 (Processed)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-txt-primary mb-1">Client Configured Pay Rate</label>
          <div className="p-2.5 bg-brand-primary-050 border border-brand-primary/20 rounded-btn text-brand-primary font-bold flex items-center justify-between">
            <span>Base Wage: ₹{activeClient.payrollConfig.baseDailyWage}/day</span>
            <span className="text-[11px]">OT: ₹{activeClient.payrollConfig.overtimeRatePerHour}/hr</span>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="wt-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-txt-primary">Payroll Register & Payslip Records</h3>
            <p className="text-xs text-txt-secondary">Calculated based on verified attendance check-ins and client wage parameters</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
            <input
              type="text"
              placeholder="Search guard name or code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left wt-table">
            <thead>
              <tr>
                <th>GUARD CODE & NAME</th>
                <th>DEPLOYED POST</th>
                <th>DAYS / OT</th>
                <th>DAILY WAGE</th>
                <th>GROSS PAY</th>
                <th>DEDUCTIONS (PF/ESI)</th>
                <th className="font-bold text-brand-teal">NET PAYABLE</th>
                <th>STATUS</th>
                <th className="text-right">PAYSLIP</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayslips.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={p.employeePhoto} alt={p.employeeName} className="w-8 h-8 rounded-full object-cover ring-2 ring-border" />
                      <div>
                        <div className="font-bold text-xs text-txt-primary">{p.employeeName}</div>
                        <div className="text-[11px] text-txt-secondary">{p.employeeCode} ({p.role})</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs text-txt-primary">{p.siteName} - <span className="text-txt-secondary">{p.postName}</span></td>
                  <td className="text-xs text-txt-primary tabular-nums">
                    <span className="font-bold text-brand-primary">{p.presentDays} P</span> • <span className="text-status-late">{p.overtimeHours}h OT</span>
                  </td>
                  <td className="text-xs font-semibold text-txt-secondary tabular-nums">₹{p.baseDailyWage}/day</td>
                  <td className="text-xs font-bold text-txt-primary tabular-nums">₹{p.grossSalary.toLocaleString()}</td>
                  <td className="text-xs font-medium text-status-absent tabular-nums">-₹{p.totalDeductions.toLocaleString()}</td>
                  <td className="text-xs font-extrabold text-brand-teal tabular-nums">₹{p.netPayableSalary.toLocaleString()}</td>
                  <td><Badge status={p.paymentStatus} /></td>
                  <td className="text-right">
                    <Button size="sm" variant="secondary" leftIcon={<FileText className="w-3.5 h-3.5" />} onClick={() => setSelectedPayslip(p)}>
                      Payslip
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Preview Drawer */}
      <Sheet isOpen={!!selectedPayslip} onClose={() => setSelectedPayslip(null)} title="Employee Salary Payslip">
        {selectedPayslip && (
          <div className="space-y-6 text-xs">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-brand-primary-050 to-brand-teal-050 border border-brand-primary/20 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">PAYSLIP FOR {selectedPayslip.month}</div>
                <div className="text-lg font-extrabold text-txt-primary mt-0.5">{selectedPayslip.employeeName}</div>
                <div className="text-xs text-txt-secondary">{selectedPayslip.employeeCode} • {selectedPayslip.role}</div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
                {selectedPayslip.paymentStatus}
              </span>
            </div>

            {/* Deployment & Bank info */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-bg-surface-2 border border-border rounded-xl">
              <div>
                <span className="text-txt-tertiary block">Client & Site</span>
                <span className="font-bold text-txt-primary">{selectedPayslip.clientName}</span>
                <span className="text-txt-secondary block">{selectedPayslip.siteName}</span>
              </div>
              <div>
                <span className="text-txt-tertiary block">Bank Transfer Account</span>
                <span className="font-mono text-txt-primary font-bold">{selectedPayslip.bankAccountNumber}</span>
                <span className="text-txt-secondary block">IFSC: {selectedPayslip.bankIfsc}</span>
              </div>
            </div>

            {/* Itemized Earnings & Deductions */}
            <div className="space-y-4">
              <h4 className="font-bold text-txt-primary text-sm border-b border-border pb-2">Salary Computation Breakup</h4>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-txt-secondary">Basic Pay ({selectedPayslip.presentDays} Days @ ₹{selectedPayslip.baseDailyWage}/day)</span>
                  <span className="font-bold text-txt-primary tabular-nums">₹{selectedPayslip.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-txt-secondary">Overtime Pay ({selectedPayslip.overtimeHours} Hours)</span>
                  <span className="font-bold text-brand-primary tabular-nums">+₹{selectedPayslip.overtimePay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-txt-secondary">Night Shift Allowance</span>
                  <span className="font-bold text-brand-teal tabular-nums">+₹{selectedPayslip.nightAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-txt-secondary">Monthly Performance Bonus</span>
                  <span className="font-bold text-brand-teal tabular-nums">+₹{selectedPayslip.bonusAllowance.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 font-bold text-txt-primary bg-bg-surface-2 px-3 rounded-lg">
                  <span>Gross Salary</span>
                  <span className="tabular-nums">₹{selectedPayslip.grossSalary.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="font-semibold text-txt-secondary">Statutory Deductions</h5>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-txt-secondary">PF Contribution (12%)</span>
                  <span className="font-bold text-status-absent tabular-nums">-₹{selectedPayslip.pfDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-txt-secondary">ESI Contribution (0.75%)</span>
                  <span className="font-bold text-status-absent tabular-nums">-₹{selectedPayslip.esiDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-txt-secondary">Uniform & Maintenance Fee</span>
                  <span className="font-bold text-status-absent tabular-nums">-₹{selectedPayslip.uniformDeduction.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 font-bold text-status-absent bg-status-absent/10 px-3 rounded-lg">
                  <span>Total Deductions</span>
                  <span className="tabular-nums">-₹{selectedPayslip.totalDeductions.toLocaleString()}</span>
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="p-4 bg-brand-teal-050 border border-brand-teal/30 rounded-2xl flex items-center justify-between text-brand-teal">
                <span className="font-bold text-sm">NET PAYABLE SALARY</span>
                <span className="text-2xl font-extrabold tabular-nums">₹{selectedPayslip.netPayableSalary.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-border">
              <Button variant="secondary" onClick={() => window.print()} leftIcon={<Printer className="w-4 h-4" />}>
                Print Payslip
              </Button>
              <Button variant="primary" onClick={() => setSelectedPayslip(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Sheet>
    </motion.div>
  );
};
