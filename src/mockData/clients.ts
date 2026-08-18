export interface ClientPayrollConfig {
  baseDailyWage: number;
  overtimeRatePerHour: number;
  nightShiftAllowancePerShift: number;
  pfDeductionPercentage: number;
  esiDeductionPercentage: number;
  bonusAllowanceMonthly: number;
  uniformDeductionMonthly: number;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  logoUrl: string;
  industry: string;
  contractStartDate: string;
  contractEndDate: string;
  contractStatus: 'ACTIVE' | 'PENDING_RENEWAL' | 'EXPIRED';
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  city: string;
  sitesCount: number;
  guardsCount: number;
  monthlyBillingAmount: number;
  payrollConfig: ClientPayrollConfig;
}

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'HDFC Bank Limited',
    code: 'CL-HDFC',
    logoUrl: 'https://images.unsplash.com/photo-1541359927273-d76820fc43f9?w=150',
    industry: 'Banking & Financial Services',
    contractStartDate: '2024-01-01',
    contractEndDate: '2027-12-31',
    contractStatus: 'ACTIVE',
    contactPerson: 'Rajesh Malhotra (Chief Security Officer)',
    contactEmail: 'security@hdfcbank.com',
    contactPhone: '+91 98230 11223',
    billingAddress: 'HDFC Bank House, Senapati Bapat Marg, Lower Parel',
    city: 'Mumbai',
    sitesCount: 4,
    guardsCount: 120,
    monthlyBillingAmount: 1850000,
    payrollConfig: {
      baseDailyWage: 750,
      overtimeRatePerHour: 120,
      nightShiftAllowancePerShift: 150,
      pfDeductionPercentage: 12,
      esiDeductionPercentage: 0.75,
      bonusAllowanceMonthly: 500,
      uniformDeductionMonthly: 200
    }
  },
  {
    id: 'client-2',
    name: 'Infosys Limited',
    code: 'CL-INFY',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150',
    industry: 'Information Technology',
    contractStartDate: '2023-06-01',
    contractEndDate: '2026-05-31',
    contractStatus: 'ACTIVE',
    contactPerson: 'Sunil Kulkarni (Head of Facilities)',
    contactEmail: 'facilities.pune@infosys.com',
    contactPhone: '+91 98901 44556',
    billingAddress: 'Plot No. 1, Rajiv Gandhi Infotech Park, Hinjawadi Phase 1',
    city: 'Pune',
    sitesCount: 3,
    guardsCount: 160,
    monthlyBillingAmount: 2400000,
    payrollConfig: {
      baseDailyWage: 820,
      overtimeRatePerHour: 140,
      nightShiftAllowancePerShift: 200,
      pfDeductionPercentage: 12,
      esiDeductionPercentage: 0.75,
      bonusAllowanceMonthly: 750,
      uniformDeductionMonthly: 250
    }
  },
  {
    id: 'client-3',
    name: 'Ruby Hall Clinic',
    code: 'CL-RUBY',
    logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150',
    industry: 'Healthcare & Hospitals',
    contractStartDate: '2024-03-15',
    contractEndDate: '2026-03-14',
    contractStatus: 'PENDING_RENEWAL',
    contactPerson: 'Dr. Anita Deshmukh (Admin Director)',
    contactEmail: 'admin@rubyhall.com',
    contactPhone: '+91 97654 33211',
    billingAddress: '40 Sassoon Road, Opposite Pune Railway Station',
    city: 'Pune',
    sitesCount: 2,
    guardsCount: 95,
    monthlyBillingAmount: 1420000,
    payrollConfig: {
      baseDailyWage: 700,
      overtimeRatePerHour: 110,
      nightShiftAllowancePerShift: 180,
      pfDeductionPercentage: 12,
      esiDeductionPercentage: 0.75,
      bonusAllowanceMonthly: 400,
      uniformDeductionMonthly: 150
    }
  },
  {
    id: 'client-4',
    name: 'ICICI Bank Limited',
    code: 'CL-ICICI',
    logoUrl: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=150',
    industry: 'Banking & Financial Services',
    contractStartDate: '2023-11-01',
    contractEndDate: '2026-10-31',
    contractStatus: 'ACTIVE',
    contactPerson: 'Venkatesh Rao (Security Ops Manager)',
    contactEmail: 'security.bkc@icicibank.com',
    contactPhone: '+91 98199 88776',
    billingAddress: 'ICICI Bank Towers, Bandra Kurla Complex',
    city: 'Mumbai',
    sitesCount: 2,
    guardsCount: 77,
    monthlyBillingAmount: 1180000,
    payrollConfig: {
      baseDailyWage: 780,
      overtimeRatePerHour: 130,
      nightShiftAllowancePerShift: 160,
      pfDeductionPercentage: 12,
      esiDeductionPercentage: 0.75,
      bonusAllowanceMonthly: 600,
      uniformDeductionMonthly: 200
    }
  }
];
