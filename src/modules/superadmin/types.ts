export type PricingModel = 'DAILY' | 'MONTHLY' | 'PER_USER' | 'CUSTOM';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'TRIAL' | 'PENDING_RENEWAL';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'FAILED' | 'PARTIAL';
export type BillingCycle = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'CUSTOM';

export interface SubscriptionDetails {
  planName: string;
  pricingModel: PricingModel;
  unitRate: number;
  billingCycle: BillingCycle;
  monthlyEstimatedAmount: number;
  startDate: string;
  expiryDate: string;
  status: SubscriptionStatus;
  maxUsersAllowed?: number;
  activeUsersCount?: number;
  autoRenew: boolean;
}

export interface ClientAdminAccount {
  id: string;
  adminId?: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLoginAt?: string;
}

export interface PaymentTransaction {
  id: string;
  clientId?: string;
  clientName?: string;
  invoiceNumber: string;
  billingPeriod: string;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionReference?: string;
  notes?: string;
}

export interface BypassAuditLog {
  id: string;
  timestamp: string;
  superAdminId: string;
  superAdminName: string;
  superAdminEmail: string;
  clientId: string;
  clientName: string;
  adminId: string;
  adminEmail: string;
  targetAdminName?: string;
  reason: string;
  ipAddress: string;
  durationMinutes: number;
  actionsTaken: string[];
  startTime?: string;
  sessionStatus?: 'ACTIVE' | 'ENDED' | 'EXPIRED';
}

export interface SuperAdminActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  actorName?: string;
  action: string;
  category: 'CLIENT' | 'SUBSCRIPTION' | 'BILLING' | 'CONTROL' | 'SECURITY' | 'PAYMENT';
  targetClient?: string;
  details: string;
}

export interface SuperAdminClient {
  id: string;
  companyName: string;
  name?: string;
  clientCode: string;
  code?: string;
  industry: string;
  logoUrl: string;
  taxId?: string;
  contactPerson?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  billingAddress?: string;
  city: string;
  country: string;
  createdAt: string;
  status: SubscriptionStatus;
  totalPaidToDate?: number;
  sitesCount?: number;
  employeesCount?: number;
  adminAccount: ClientAdminAccount;
  subscription: SubscriptionDetails;
  payments: PaymentTransaction[];
}
