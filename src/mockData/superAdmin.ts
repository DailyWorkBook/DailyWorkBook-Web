export type PricingModel = 'DAILY' | 'MONTHLY' | 'PER_USER' | 'CUSTOM';

export type SubscriptionStatus = 'ACTIVE' | 'PENDING_RENEWAL' | 'EXPIRED' | 'SUSPENDED';

export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'FAILED' | 'REFUNDED';

export type BillingCycle = 'DAILY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'CUSTOM';

export interface SubscriptionDetails {
  planName: string;
  pricingModel: PricingModel;
  unitRate: number; // Rate per day, month, user, or custom fixed fee
  billingCycle: BillingCycle;
  monthlyEstimatedAmount: number;
  startDate: string;
  expiryDate: string;
  status: SubscriptionStatus;
  maxUsersAllowed: number;
  activeUsersCount: number;
  autoRenew: boolean;
}

export interface ClientAdminAccount {
  adminId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  lastLoginAt: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  billingPeriod: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  status: PaymentStatus;
  paymentMethod: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'UPI' | 'ACH' | 'PENDING';
  transactionReference?: string;
  notes?: string;
}

export interface BypassAuditLog {
  id: string;
  superAdminName: string;
  superAdminEmail: string;
  targetAdminId: string;
  targetAdminName: string;
  targetAdminEmail: string;
  clientId: string;
  clientName: string;
  reason: string;
  startTime: string;
  endTime?: string;
  sessionStatus: 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  ipAddress: string;
  userAgent: string;
}

export interface SuperAdminActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  action: 'CLIENT_CREATED' | 'CLIENT_UPDATED' | 'STATUS_CHANGED' | 'SUBSCRIPTION_UPDATED' | 'PAYMENT_RECORDED' | 'BYPASS_LOGIN_STARTED' | 'BYPASS_LOGIN_ENDED';
  category: 'CLIENT' | 'SUBSCRIPTION' | 'PAYMENT' | 'SECURITY';
  details: string;
  targetClient?: string;
}

export interface SuperAdminClient {
  id: string;
  name: string;
  code: string;
  taxId: string;
  industry: string;
  billingAddress: string;
  city: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  logoUrl: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  adminAccount: ClientAdminAccount;
  subscription: SubscriptionDetails;
  totalPaidToDate: number;
  sitesCount: number;
  employeesCount: number;
}

export const INITIAL_SUPERADMIN_CLIENTS: SuperAdminClient[] = [
  {
    id: 'client-1',
    name: 'HDFC Bank Limited',
    code: 'CL-HDFC',
    taxId: '27AAACH1122R1Z5',
    industry: 'Banking & Financial Services',
    billingAddress: 'HDFC Bank House, Senapati Bapat Marg, Lower Parel',
    city: 'Mumbai',
    contactPerson: 'Rajesh Malhotra',
    contactPhone: '+91 98230 11223',
    contactEmail: 'security@hdfcbank.com',
    logoUrl: 'https://images.unsplash.com/photo-1541359927273-d76820fc43f9?w=150',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    adminAccount: {
      adminId: 'adm-hdfc-1',
      name: 'Rajesh Malhotra',
      email: 'admin.hdfc@watchtower.dev',
      phone: '+91 98230 11223',
      role: 'Client Security Admin',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-18 09:30 AM',
      createdAt: '2024-01-01'
    },
    subscription: {
      planName: 'Enterprise Security Suite',
      pricingModel: 'PER_USER',
      unitRate: 150,
      billingCycle: 'MONTHLY',
      monthlyEstimatedAmount: 18500,
      startDate: '2024-01-01',
      expiryDate: '2027-12-31',
      status: 'ACTIVE',
      maxUsersAllowed: 200,
      activeUsersCount: 120,
      autoRenew: true
    },
    totalPaidToDate: 555000,
    sitesCount: 4,
    employeesCount: 120
  },
  {
    id: 'client-2',
    name: 'Infosys Limited',
    code: 'CL-INFY',
    taxId: '29AAACI0987K1Z8',
    industry: 'Information Technology',
    billingAddress: 'Plot No. 1, Rajiv Gandhi Infotech Park, Hinjawadi Phase 1',
    city: 'Pune',
    contactPerson: 'Sunil Kulkarni',
    contactPhone: '+91 98901 44556',
    contactEmail: 'facilities.pune@infosys.com',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150',
    status: 'ACTIVE',
    createdAt: '2023-06-01',
    adminAccount: {
      adminId: 'adm-infy-1',
      name: 'Sunil Kulkarni',
      email: 'admin.infosys@watchtower.dev',
      phone: '+91 98901 44556',
      role: 'Client Security Admin',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-17 04:15 PM',
      createdAt: '2023-06-01'
    },
    subscription: {
      planName: 'Campus Guard Unlimited',
      pricingModel: 'MONTHLY',
      unitRate: 45000,
      billingCycle: 'ANNUAL',
      monthlyEstimatedAmount: 45000,
      startDate: '2023-06-01',
      expiryDate: '2026-11-30',
      status: 'ACTIVE',
      maxUsersAllowed: 500,
      activeUsersCount: 160,
      autoRenew: true
    },
    totalPaidToDate: 1350000,
    sitesCount: 3,
    employeesCount: 160
  },
  {
    id: 'client-3',
    name: 'Ruby Hall Clinic',
    code: 'CL-RUBY',
    taxId: '27AAACR4411D1Z2',
    industry: 'Healthcare & Hospitals',
    billingAddress: '40 Sassoon Road, Opposite Pune Railway Station',
    city: 'Pune',
    contactPerson: 'Dr. Anita Deshmukh',
    contactPhone: '+91 97654 33211',
    contactEmail: 'admin@rubyhall.com',
    logoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150',
    status: 'ACTIVE',
    createdAt: '2024-03-15',
    adminAccount: {
      adminId: 'adm-ruby-1',
      name: 'Dr. Anita Deshmukh',
      email: 'admin.rubyhall@watchtower.dev',
      phone: '+91 97654 33211',
      role: 'Hospital Admin',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-10 11:00 AM',
      createdAt: '2024-03-15'
    },
    subscription: {
      planName: 'Healthcare Care-Guard Plan',
      pricingModel: 'DAILY',
      unitRate: 45,
      billingCycle: 'MONTHLY',
      monthlyEstimatedAmount: 28350,
      startDate: '2024-03-15',
      expiryDate: '2026-09-14',
      status: 'PENDING_RENEWAL',
      maxUsersAllowed: 150,
      activeUsersCount: 95,
      autoRenew: false
    },
    totalPaidToDate: 680000,
    sitesCount: 2,
    employeesCount: 95
  },
  {
    id: 'client-4',
    name: 'ICICI Bank Limited',
    code: 'CL-ICICI',
    taxId: '27AAACI7722P1Z0',
    industry: 'Banking & Financial Services',
    billingAddress: 'ICICI Bank Towers, Bandra Kurla Complex',
    city: 'Mumbai',
    contactPerson: 'Venkatesh Rao',
    contactPhone: '+91 98199 88776',
    contactEmail: 'security.bkc@icicibank.com',
    logoUrl: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=150',
    status: 'ACTIVE',
    createdAt: '2023-11-01',
    adminAccount: {
      adminId: 'adm-icici-1',
      name: 'Venkatesh Rao',
      email: 'admin.icici@watchtower.dev',
      phone: '+91 98199 88776',
      role: 'Regional Security Manager',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-18 10:45 AM',
      createdAt: '2023-11-01'
    },
    subscription: {
      planName: 'BFSI Tier-1 Plan',
      pricingModel: 'CUSTOM',
      unitRate: 35000,
      billingCycle: 'QUARTERLY',
      monthlyEstimatedAmount: 35000,
      startDate: '2023-11-01',
      expiryDate: '2026-10-31',
      status: 'ACTIVE',
      maxUsersAllowed: 120,
      activeUsersCount: 77,
      autoRenew: true
    },
    totalPaidToDate: 1050000,
    sitesCount: 2,
    employeesCount: 77
  },
  {
    id: 'client-5',
    name: 'Amanora Town Centre',
    code: 'CL-AMANORA',
    taxId: '27AAACA5533M1Z9',
    industry: 'Real Estate & Retail',
    billingAddress: 'Hadapsar, Kharadi Bypass Road',
    city: 'Pune',
    contactPerson: 'Vikram Joshi',
    contactPhone: '+91 98222 34100',
    contactEmail: 'security@amanoratm.com',
    logoUrl: 'https://images.unsplash.com/photo-1567449303078-57ad995bd301?w=150',
    status: 'INACTIVE',
    createdAt: '2024-05-10',
    adminAccount: {
      adminId: 'adm-amanora-1',
      name: 'Vikram Joshi',
      email: 'admin.amanora@watchtower.dev',
      phone: '+91 98222 34100',
      role: 'Facilities Admin',
      status: 'INACTIVE',
      lastLoginAt: '2026-06-01 02:00 PM',
      createdAt: '2024-05-10'
    },
    subscription: {
      planName: 'Commercial Retail Basic',
      pricingModel: 'MONTHLY',
      unitRate: 20000,
      billingCycle: 'MONTHLY',
      monthlyEstimatedAmount: 20000,
      startDate: '2024-05-10',
      expiryDate: '2026-05-09',
      status: 'EXPIRED',
      maxUsersAllowed: 50,
      activeUsersCount: 40,
      autoRenew: false
    },
    totalPaidToDate: 480000,
    sitesCount: 1,
    employeesCount: 40
  }
];

export const INITIAL_PAYMENT_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx-101',
    clientId: 'client-1',
    clientName: 'HDFC Bank Limited',
    invoiceNumber: 'INV-2026-08-01',
    billingPeriod: 'Aug 2026',
    amount: 18500,
    paymentDate: '2026-08-05',
    dueDate: '2026-08-10',
    status: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    transactionReference: 'NEFT-HDFC-9918231',
    notes: 'Monthly billing for 120 guards'
  },
  {
    id: 'tx-102',
    clientId: 'client-2',
    clientName: 'Infosys Limited',
    invoiceNumber: 'INV-2026-07-02',
    billingPeriod: 'Q3 2026 (Jul-Sep)',
    amount: 135000,
    paymentDate: '2026-07-01',
    dueDate: '2026-07-15',
    status: 'PAID',
    paymentMethod: 'ACH',
    transactionReference: 'ACH-INFY-2026-Q3',
    notes: 'Quarterly payment received'
  },
  {
    id: 'tx-103',
    clientId: 'client-3',
    clientName: 'Ruby Hall Clinic',
    invoiceNumber: 'INV-2026-08-03',
    billingPeriod: 'Aug 2026',
    amount: 28350,
    paymentDate: '2026-08-18',
    dueDate: '2026-08-20',
    status: 'PENDING',
    paymentMethod: 'PENDING',
    notes: 'Invoice generated, awaiting wire transfer'
  },
  {
    id: 'tx-104',
    clientId: 'client-4',
    clientName: 'ICICI Bank Limited',
    invoiceNumber: 'INV-2026-08-04',
    billingPeriod: 'Aug 2026',
    amount: 35000,
    paymentDate: '2026-08-02',
    dueDate: '2026-08-07',
    status: 'PAID',
    paymentMethod: 'UPI',
    transactionReference: 'UPI-ICICI-8827361',
    notes: 'Custom quarterly installment'
  },
  {
    id: 'tx-105',
    clientId: 'client-5',
    clientName: 'Amanora Town Centre',
    invoiceNumber: 'INV-2026-06-05',
    billingPeriod: 'Jun 2026',
    amount: 20000,
    paymentDate: '-',
    dueDate: '2026-06-15',
    status: 'OVERDUE',
    paymentMethod: 'PENDING',
    notes: 'Account suspended due to non-payment'
  }
];

export const INITIAL_BYPASS_AUDIT_LOGS: BypassAuditLog[] = [
  {
    id: 'bpl-501',
    superAdminName: 'Alex Morgan',
    superAdminEmail: 'superadmin@watchtower.dev',
    targetAdminId: 'adm-ruby-1',
    targetAdminName: 'Dr. Anita Deshmukh',
    targetAdminEmail: 'admin.rubyhall@watchtower.dev',
    clientId: 'client-3',
    clientName: 'Ruby Hall Clinic',
    reason: 'Investigating shift roster sync mismatch on Night Shift Site A',
    startTime: '2026-08-15 14:22:10',
    endTime: '2026-08-15 14:48:35',
    sessionStatus: 'COMPLETED',
    ipAddress: '103.21.124.89',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  },
  {
    id: 'bpl-502',
    superAdminName: 'Alex Morgan',
    superAdminEmail: 'superadmin@watchtower.dev',
    targetAdminId: 'adm-hdfc-1',
    targetAdminName: 'Rajesh Malhotra',
    targetAdminEmail: 'admin.hdfc@watchtower.dev',
    clientId: 'client-1',
    clientName: 'HDFC Bank Limited',
    reason: 'Assisting client with setting up new Branch Site geofence boundaries',
    startTime: '2026-08-12 10:11:04',
    endTime: '2026-08-12 10:35:19',
    sessionStatus: 'COMPLETED',
    ipAddress: '103.21.124.89',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  }
];

export const INITIAL_SUPERADMIN_ACTIVITY_LOGS: SuperAdminActivityLog[] = [
  {
    id: 'sal-901',
    timestamp: '2026-08-18 09:15:00',
    actorName: 'Alex Morgan',
    actorEmail: 'superadmin@watchtower.dev',
    action: 'CLIENT_CREATED',
    category: 'CLIENT',
    details: 'Onboarded new client HDFC Bank Limited (CL-HDFC) with Enterprise Plan',
    targetClient: 'HDFC Bank Limited'
  },
  {
    id: 'sal-902',
    timestamp: '2026-08-16 16:40:12',
    actorName: 'Alex Morgan',
    actorEmail: 'superadmin@watchtower.dev',
    action: 'PAYMENT_RECORDED',
    category: 'PAYMENT',
    details: 'Recorded payment of ₹1,35,000 for Infosys Limited (INV-2026-07-02)',
    targetClient: 'Infosys Limited'
  },
  {
    id: 'sal-903',
    timestamp: '2026-08-15 14:22:10',
    actorName: 'Alex Morgan',
    actorEmail: 'superadmin@watchtower.dev',
    action: 'BYPASS_LOGIN_STARTED',
    category: 'SECURITY',
    details: 'Initiated Login-as-Admin bypass for Dr. Anita Deshmukh (Ruby Hall Clinic)',
    targetClient: 'Ruby Hall Clinic'
  },
  {
    id: 'sal-904',
    timestamp: '2026-08-15 14:48:35',
    actorName: 'Alex Morgan',
    actorEmail: 'superadmin@watchtower.dev',
    action: 'BYPASS_LOGIN_ENDED',
    category: 'SECURITY',
    details: 'Exited Login-as-Admin session for Dr. Anita Deshmukh (Ruby Hall Clinic)',
    targetClient: 'Ruby Hall Clinic'
  },
  {
    id: 'sal-905',
    timestamp: '2026-08-10 11:30:45',
    actorName: 'Alex Morgan',
    actorEmail: 'superadmin@watchtower.dev',
    action: 'SUBSCRIPTION_UPDATED',
    category: 'SUBSCRIPTION',
    details: 'Updated ICICI Bank pricing model to CUSTOM (₹35,000 / Quarter)',
    targetClient: 'ICICI Bank Limited'
  }
];
