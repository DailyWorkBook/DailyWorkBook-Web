/** Response shapes the API returns. Kept in one place so screens share them. */

export type ActorType = 'SUPER_ADMIN' | 'CLIENT_USER';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  actorType: ActorType;
  roleCode: string | null;
  roleName: string | null;
  isPrimaryAdmin: boolean;
  clientId: string | null;
  clientName: string | null;
  clientStatus: string | null;
  avatarUrl: string | null;
  permissions: string[];
  modules: string[];
  mustChangePassword: boolean;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SessionUser;
}

export interface ModulePricing {
  monthly: number;
  perUser: number;
  daily: number;
}

export interface CatalogPermission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isReadOnly: boolean;
}

export interface CatalogModule {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  isMandatory: boolean;
  pricing: ModulePricing;
  permissions: CatalogPermission[];
}

export interface PermissionGroup {
  moduleCode: string;
  moduleName: string;
  category: string;
  permissions: CatalogPermission[];
}

export interface BillingLine {
  moduleCode: string;
  moduleName: string;
  basis: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

export interface BillingQuote {
  lines: BillingLine[];
  subtotalAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  monthlyAmount: number;
  cycleMonths: number;
  cycleAmount: number;
  modules: { code: string; name: string }[];
}

export type PricingModel = 'DAILY' | 'MONTHLY' | 'PER_USER' | 'CUSTOM';
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL';
export type ClientStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface Subscription {
  planName: string;
  pricingModel: PricingModel;
  billingCycle: BillingCycle;
  maxUsers: number;
  discountPercent: number;
  taxPercent: number;
  customAmount: number | null;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  monthlyAmount: number;
  cycleAmount: number;
  currency: string;
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
  status: string;
}

export interface ClientSummary {
  id: string;
  name: string;
  code: string;
  industry: string | null;
  taxId: string | null;
  logoUrl: string | null;
  billingAddress: string;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  status: ClientStatus;
  createdAt: string;
  modules: { code: string; name: string; category: string; unitPrice: number }[];
  subscription: Subscription | null;
  primaryAdmin: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    lastLoginAt: string | null;
  } | null;
  counts: { sites: number; employees: number; users: number; roles?: number };
}

export interface ClientDetail extends ClientSummary {
  users: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    isPrimaryAdmin: boolean;
    roleName: string | null;
    lastLoginAt: string | null;
  }[];
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  outstanding: number;
  currency: string;
  dueDate: string;
  paidAt: string | null;
  status: string;
  paymentMethod: string | null;
  transactionRef: string | null;
  notes: string | null;
  lineItems: BillingLine[];
  isSystemGenerated: boolean;
  createdAt: string;
}

export interface PlatformDashboard {
  clients: { total: number; active: number; suspended: number };
  accounts: { workspaceUsers: number; employees: number; sites: number };
  subscriptions: {
    byStatus: { status: string; count: number; monthlyAmount: number }[];
    expiringWithinDays: number;
    expiringSoon: number;
  };
  revenue: {
    currency: string;
    monthlyRecurring: number;
    annualRunRate: number;
    collected: number;
    outstanding: number;
    overdueInvoices: number;
  };
  pricingSpread: { pricingModel: string; clients: number; monthlyAmount: number }[];
  moduleUptake: { code: string; name: string; clients: number; monthlyPrice: number }[];
  recentClients: {
    id: string;
    name: string;
    code: string;
    status: string;
    createdAt: string;
    monthlyAmount: number;
    employees: number;
    sites: number;
  }[];
}

export interface PlatformAuditEntry {
  id: string;
  action: string;
  category: string;
  details: string;
  actorName: string;
  actorEmail: string;
  targetClientId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  permissions: { code: string; name: string; moduleCode: string; moduleName: string }[];
  permissionCodes: string[];
  usage: { employees: number; users: number };
}

export interface EmployeeSummary {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string | null;
  photoUrl: string | null;
  gender: string;
  designation: string;
  department: string;
  employmentType: string;
  dateOfJoining: string;
  dateOfExit: string | null;
  monthlySalary: number;
  status: string;
  role: { id: string; name: string; code: string };
  currentSite: { id: string; name: string } | null;
  currentPost: { id: string; name: string } | null;
  kycStatus: string | null;
  hasBankAccount: boolean;
  bankVerified: boolean;
  createdAt: string;
}

export interface EmployeeKyc {
  status: string;
  aadhaarNumber: string | null;
  panNumber: string | null;
  passportNumber: string | null;
  drivingLicence: string | null;
  hasAadhaar: boolean;
  hasPan: boolean;
  policeVerified: boolean;
  remarks: string | null;
  verifiedAt: string | null;
  updatedAt: string;
}

export interface EmployeeBankAccount {
  accountHolderName: string;
  bankName: string;
  accountNumber: string | null;
  ifscCode: string;
  branchName: string | null;
  accountType: string;
  isVerified: boolean;
  verifiedAt: string | null;
  updatedAt: string;
}

export interface EmployeeDetail extends EmployeeSummary {
  dateOfBirth: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  overtimeHourlyRate: number;
  kyc: EmployeeKyc | null;
  bankAccount: EmployeeBankAccount | null;
  leaveBalance: { casual: number; earned: number; medical: number; compOff: number } | null;
  loginAccount: { id: string; email: string; status: string } | null;
}

export interface Post {
  id: string;
  siteId: string;
  name: string;
  code: string;
  description: string | null;
  guardCountRequired: number;
  qrCodeId: string;
  isActive: boolean;
  createdAt: string;
  shiftCount: number;
  employeeCount: number;
}

export interface Site {
  id: string;
  name: string;
  code: string;
  addressLine: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  latitude: number;
  longitude: number;
  geofenceRadiusM: number;
  timezone: string;
  contactPerson: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  postCount: number;
  guardsRequired: number;
  employeeCount: number;
  posts: Post[] | { id: string; name: string; code: string; guardCountRequired: number; qrCodeId: string; isActive: boolean }[];
  rosterCount?: number;
}

export interface Shift {
  id: string;
  name: string;
  code: string;
  type: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  lateHalfDayAfterMin: number;
  weeklyOff: number[];
  isNightShift: boolean;
  isActive: boolean;
  site: { id: string; name: string };
  post: { id: string; name: string; guardCountRequired: number };
  rosterCount: number;
  createdAt: string;
}

export interface RosterEntry {
  id: string;
  rosterDate: string;
  startAt: string;
  endAt: string;
  status: string;
  notes: string | null;
  publishedAt: string | null;
  employee: { id: string; name: string; employeeCode: string; status: string };
  site: { id: string; name: string };
  post: { id: string; name: string; guardCountRequired: number };
  shift: { id: string; name: string; startTime: string; endTime: string; isNightShift: boolean };
  createdAt: string;
}

export interface RosterConflict {
  type: string;
  severity: 'BLOCK' | 'WARN';
  message: string;
  employeeId?: string;
  postId?: string;
  rosterId?: string;
}

export interface RosterValidation {
  date: string;
  entries: number;
  conflicts: RosterConflict[];
  blocking: RosterConflict[];
  warnings: RosterConflict[];
  canPublish: boolean;
}

export interface RegisterRow {
  id: string;
  date: string;
  employee: {
    id: string;
    name: string;
    employeeCode: string;
    photoUrl: string | null;
    designation: string;
    department: string;
  };
  site: { id: string; name: string } | null;
  post: { id: string; name: string } | null;
  shift: { id: string; name: string; startTime: string; endTime: string } | null;
  firstCheckInAt: string | null;
  lastCheckOutAt: string | null;
  workedMinutes: number;
  overtimeMinutes: number;
  state: string;
  isLate: boolean;
  isEarlyExit: boolean;
  lateByMinutes: number;
}

export interface AttendanceEvent {
  id: string;
  employee: { id: string; name: string; employeeCode: string; photoUrl: string | null };
  site: { id: string; name: string };
  post: { id: string; name: string };
  shift: { id: string; name: string; startTime: string; endTime: string };
  method: string;
  eventType: string;
  occurredAt: string;
  recordedAt: string;
  latitude: number | null;
  longitude: number | null;
  distanceMeters: number | null;
  withinGeofence: boolean | null;
  state: string;
  isException: boolean;
  exceptionReason: string | null;
  approvalStatus: string;
  approvedAt: string | null;
  note: string | null;
}

export interface LeaveRequest {
  id: string;
  employee: { id: string; name: string; employeeCode: string; photoUrl: string | null };
  type: string;
  fromDate: string;
  toDate: string;
  isHalfDay: boolean;
  totalDays: number;
  reason: string;
  status: string;
  decisionNote: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  casual: number;
  earned: number;
  medical: number;
  compOff: number;
  updatedAt: string;
}

export interface DashboardOverview {
  date: string;
  hasData: boolean;
  workforce: { totalEmployees: number; activeEmployees: number; byStatus: Record<string, number> };
  deployment: { sites: number; posts: number; shifts: number; roles: number; rosteredToday: number };
  today: {
    expected: number;
    present: number;
    absent: number;
    late: number;
    earlyExit: number;
    onLeave: number;
    awaitingReview: number;
    attendanceRate: number | null;
    attendanceRateDelta: number | null;
  };
  queues: { pendingExceptions: number; pendingLeave: number };
}

export interface TrendPoint {
  date: string;
  present: number;
  expected: number;
  rate: number | null;
}

export interface SiteCoverage {
  siteId: string;
  siteName: string;
  city: string;
  required: number;
  rostered: number;
  present: number;
  coverage: number | null;
}

export interface PayrollRow {
  employeeId: string;
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  site: { id: string; name: string } | null;
  monthlySalary: number;
  attendance: {
    presentDays: number;
    halfDays: number;
    paidLeaveDays: number;
    holidayDays: number;
    absentDays: number;
    unresolvedDays: number;
    overtimeMinutes: number;
  };
  perDayRate: number;
  payableDays: number;
  basicEarnings: number;
  overtimeEarnings: number;
  grossEarnings: number;
  providentFund: number;
  stateInsurance: number;
  totalDeductions: number;
  netPayable: number;
  lossOfPayDays: number;
  bank: { bankName: string; isVerified: boolean } | null;
  payrollReady: boolean;
}

export interface WorkspaceConfig {
  defaultGeofenceRadiusM: number;
  defaultGraceMinutes: number;
  lateHalfDayAfterMin: number;
  timezone: string;
  workingDaysPerMonth: number;
  standardShiftHours: number;
  autoApproveWithinGeofence: boolean;
  weeklyOffDays: number[];
  annualCasualLeave: number;
  annualEarnedLeave: number;
  annualMedicalLeave: number;
  updatedAt: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  code: string;
  industry: string | null;
  city: string;
  country: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  status: string;
  logoUrl: string | null;
  modules: { code: string; name: string; category: string; description: string | null }[];
  subscription: {
    planName: string;
    pricingModel: string;
    billingCycle: string;
    maxUsers: number;
    monthlyAmount: number;
    currency: string;
    startDate: string;
    expiryDate: string;
    status: string;
  } | null;
}

export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorId: string | null;
  actorName: string | null;
  actorType: string;
  before: unknown;
  after: unknown;
  ipAddress: string | null;
  createdAt: string;
}

export interface AttendanceSummaryReport {
  rows: {
    employeeId: string;
    employeeCode: string;
    name: string;
    designation: string;
    department: string;
    site: { id: string; name: string } | null;
    status: string;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    leaveDays: number;
    holidayDays: number;
    pendingDays: number;
    workedHours: number;
    overtimeHours: number;
    attendanceRate: number | null;
  }[];
  totals: {
    employees: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
    leaveDays: number;
    workedHours: number;
    averageAttendanceRate: number;
  } | null;
  period: { from: string; to: string };
}
