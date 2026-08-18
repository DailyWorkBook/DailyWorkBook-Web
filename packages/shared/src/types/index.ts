import {
  EmployeeStatus,
  EmployeeRole,
  AttendanceState,
  AttendanceMethod,
  AttendanceEventType,
  ApprovalStatus,
  ShiftType,
  LeaveType,
  LeaveStatus,
  HolidayScope
} from '../enums';

export interface Tenant {
  id: string;
  name: string;
  timezone: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: 'ORG_ADMIN';
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  photoUrl?: string | null;
  status: EmployeeStatus;
  dateOfJoining: string;
  role: EmployeeRole;
  currentSiteId?: string | null;
  currentPostId?: string | null;
  currentSite?: Site | null;
  currentPost?: Post | null;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string;
  tenantId: string;
  clientName: string;
  name: string;
  addressLine: string;
  city: string;
  latitude: number;
  longitude: number;
  geofenceRadiusM: number;
  timezone: string;
  isActive: boolean;
  postsCount?: number;
  guardsCount?: number;
  createdAt: string;
}

export interface Post {
  id: string;
  tenantId: string;
  siteId: string;
  siteName?: string;
  name: string;
  guardCountRequired: number;
  qrCodeId: string;
  isActive: boolean;
  createdAt: string;
}

export interface Shift {
  id: string;
  tenantId: string;
  name: string;
  type: ShiftType;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  graceMinutes: number;
  lateHalfDayAfterMin: number;
  weeklyOff: number[]; // 0=Sunday..6=Saturday
  isNightShift: boolean;
  createdAt: string;
}

export interface Assignment {
  id: string;
  tenantId: string;
  employeeId: string;
  siteId: string;
  postId: string;
  shiftId: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  employee?: Employee;
  site?: Site;
  post?: Post;
  shift?: Shift;
  createdAt: string;
}

export interface AttendanceEvent {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  siteId: string;
  siteName?: string;
  postId: string;
  postName?: string;
  shiftId: string;
  method: AttendanceMethod;
  eventType: AttendanceEventType;
  clientTimestamp: string;
  serverTimestamp: string;
  latitude?: number | null;
  longitude?: number | null;
  deviceId?: string | null;
  withinGeofence: boolean | null;
  state: AttendanceState;
  isException: boolean;
  approvalStatus: ApprovalStatus;
  approvedById?: string | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  note?: string | null;
  reason?: string | null;
  createdAt: string;
}

export interface DailyAttendance {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeCode?: string;
  employeeName?: string;
  date: string; // YYYY-MM-DD
  siteId?: string | null;
  siteName?: string | null;
  postId?: string | null;
  postName?: string | null;
  shiftId?: string | null;
  firstCheckInAt?: string | null;
  lastCheckOutAt?: string | null;
  workedMinutes?: number | null;
  state: AttendanceState;
  isLate: boolean;
  isEarlyExit: boolean;
  exceptionEventId?: string | null;
  role?: EmployeeRole;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  isHalfDay: boolean;
  reason: string;
  status: LeaveStatus;
  decidedById?: string | null;
  decidedByName?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export interface LeaveBalance {
  id: string;
  tenantId: string;
  employeeId: string;
  casual: number;
  earned: number;
  medical: number;
  updatedAt: string;
}

export interface Holiday {
  id: string;
  tenantId: string;
  date: string;
  name: string;
  scope: HolidayScope;
  siteId?: string | null;
  siteName?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface AttendanceConfig {
  id: string;
  tenantId: string;
  defaultGeofenceRadiusM: number;
  defaultGraceMinutes: number;
  lateHalfDayAfterMin: number;
  timezone: string;
  workingDaysPerMonth: number;
  autoApproveWithinGeofence: boolean;
  updatedAt: string;
}

export interface MetricDelta {
  value: number;
  change: number; // percentage or absolute difference
  trend: 'up' | 'down' | 'flat';
  periodLabel: string;
}

export interface DashboardMetrics {
  totalEmployees: MetricDelta;
  onTime: MetricDelta;
  absent: MetricDelta;
  late: MetricDelta;
  earlyDepartures: MetricDelta;
  timeOff: MetricDelta;
  realtimeCount: number;
  currentTime: string;
  todayDateStr: string;
}

export interface TrendPoint {
  label: string;
  value: number; // percentage
  timestamp: string;
  isHighlighted?: boolean;
}

export interface ClientBarPoint {
  clientName: string;
  rate: number; // percentage
  isPeak?: boolean;
}

export interface RosterConflict {
  type: 'OVERLAPPING_SHIFT' | 'EXCEEDED_HOURS' | 'INSUFFICIENT_REST' | 'ON_LEAVE' | 'UNSTAFFED_POST';
  severity: 'BLOCK' | 'WARN';
  employeeId?: string;
  employeeName?: string;
  postId?: string;
  postName?: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
