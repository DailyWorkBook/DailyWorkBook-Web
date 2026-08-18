import { INITIAL_EMPLOYEES, Employee } from './employees';
import { INITIAL_CLIENTS, Client } from './clients';

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeePhoto: string;
  role: string;
  clientName: string;
  siteName: string;
  postName: string;
  month: string; // e.g. "2026-08"
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeHours: number;
  baseDailyWage: number;
  basicSalary: number;
  overtimePay: number;
  nightAllowance: number;
  bonusAllowance: number;
  grossSalary: number;
  pfDeduction: number;
  esiDeduction: number;
  uniformDeduction: number;
  totalDeductions: number;
  netPayableSalary: number;
  paymentStatus: 'PAID' | 'PENDING' | 'HOLD';
  bankAccountNumber: string;
  bankIfsc: string;
}

export interface PayrollRun {
  id: string;
  clientId: string;
  clientName: string;
  month: string;
  totalGuards: number;
  totalGrossAmount: number;
  totalDeductionsAmount: number;
  totalNetPayableAmount: number;
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'DISBURSED';
  generatedDate: string;
  approvedBy?: string;
  payslips: Payslip[];
}

// Helper generator function to compute realistic payroll for a given client & month
export function generatePayrollRunForClient(clientId: string, month: string = '2026-08'): PayrollRun {
  const client = INITIAL_CLIENTS.find(c => c.id === clientId) || INITIAL_CLIENTS[0];
  const guards = INITIAL_EMPLOYEES.filter(e => e.clientId === client.id).slice(0, 30);
  const cfg = client.payrollConfig;

  const payslips: Payslip[] = guards.map((g, idx) => {
    const presentDays = 22 - (idx % 3);
    const absentDays = idx % 3;
    const leaveDays = idx % 2 === 0 ? 1 : 0;
    const overtimeHours = (idx % 4) * 6;

    const basicSalary = presentDays * cfg.baseDailyWage;
    const overtimePay = overtimeHours * cfg.overtimeRatePerHour;
    const nightAllowance = (idx % 2 === 0 ? 5 : 2) * cfg.nightShiftAllowancePerShift;
    const bonusAllowance = cfg.bonusAllowanceMonthly;

    const grossSalary = basicSalary + overtimePay + nightAllowance + bonusAllowance;

    const pfDeduction = Math.round(basicSalary * (cfg.pfDeductionPercentage / 100));
    const esiDeduction = Math.round(grossSalary * (cfg.esiDeductionPercentage / 100));
    const uniformDeduction = cfg.uniformDeductionMonthly;

    const totalDeductions = pfDeduction + esiDeduction + uniformDeduction;
    const netPayableSalary = grossSalary - totalDeductions;

    return {
      id: `ps-${client.id}-${g.id}`,
      payrollRunId: `pr-${client.id}-${month}`,
      employeeId: g.id,
      employeeCode: g.employeeCode,
      employeeName: `${g.firstName} ${g.lastName}`,
      employeePhoto: g.photoUrl,
      role: g.role.replace('_', ' '),
      clientName: client.name,
      siteName: g.currentSiteName,
      postName: g.currentPostName,
      month,
      presentDays,
      absentDays,
      leaveDays,
      overtimeHours,
      baseDailyWage: cfg.baseDailyWage,
      basicSalary,
      overtimePay,
      nightAllowance,
      bonusAllowance,
      grossSalary,
      pfDeduction,
      esiDeduction,
      uniformDeduction,
      totalDeductions,
      netPayableSalary,
      paymentStatus: 'PAID',
      bankAccountNumber: g.bankDetails.accountNumber,
      bankIfsc: g.bankDetails.ifscCode
    };
  });

  const totalGrossAmount = payslips.reduce((acc, p) => acc + p.grossSalary, 0);
  const totalDeductionsAmount = payslips.reduce((acc, p) => acc + p.totalDeductions, 0);
  const totalNetPayableAmount = payslips.reduce((acc, p) => acc + p.netPayableSalary, 0);

  return {
    id: `pr-${client.id}-${month}`,
    clientId: client.id,
    clientName: client.name,
    month,
    totalGuards: payslips.length,
    totalGrossAmount,
    totalDeductionsAmount,
    totalNetPayableAmount,
    status: 'APPROVED',
    generatedDate: '2026-08-18',
    approvedBy: 'Olivia Chen (Org Admin)',
    payslips
  };
}

export const INITIAL_PAYROLL_RUNS: PayrollRun[] = INITIAL_CLIENTS.map(c =>
  generatePayrollRunForClient(c.id, '2026-08')
);
