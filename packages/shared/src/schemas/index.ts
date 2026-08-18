import { z } from 'zod';
import {
  EmployeeStatus,
  EmployeeRole,
  AttendanceMethod,
  ShiftType,
  LeaveType,
  HolidayScope,
  ApprovalStatus
} from '../enums';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createEmployeeSchema = z.object({
  employeeCode: z.string().min(2, 'Employee code is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  status: z.nativeEnum(EmployeeStatus).default(EmployeeStatus.ACTIVE),
  role: z.nativeEnum(EmployeeRole).default(EmployeeRole.SECURITY_GUARD),
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  currentSiteId: z.string().optional().nullable(),
  currentPostId: z.string().optional().nullable()
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const createSiteSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  name: z.string().min(1, 'Site name is required'),
  addressLine: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  latitude: z.number(),
  longitude: z.number(),
  geofenceRadiusM: z.number().min(10).max(5000).default(100),
  timezone: z.string().default('Asia/Kolkata')
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;

export const createPostSchema = z.object({
  siteId: z.string().min(1),
  name: z.string().min(1, 'Post name is required'),
  guardCountRequired: z.number().min(1).default(1),
  qrCodeId: z.string().min(1, 'QR code ID is required')
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createShiftSchema = z.object({
  name: z.string().min(1, 'Shift name is required'),
  type: z.nativeEnum(ShiftType).default(ShiftType.FIXED),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:mm'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:mm'),
  graceMinutes: z.number().min(0).default(15),
  lateHalfDayAfterMin: z.number().min(0).default(60),
  weeklyOff: z.array(z.number()).default([0]),
  isNightShift: z.boolean().default(false)
});

export type CreateShiftInput = z.infer<typeof createShiftSchema>;

export const createAssignmentSchema = z.object({
  employeeId: z.string().min(1),
  siteId: z.string().min(1),
  postId: z.string().min(1),
  shiftId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable()
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const manualAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  siteId: z.string().min(1, 'Select a site'),
  postId: z.string().min(1, 'Select a post'),
  shiftId: z.string().min(1, 'Select a shift'),
  method: z.nativeEnum(AttendanceMethod).default(AttendanceMethod.MANUAL),
  eventType: z.enum(['CHECK_IN', 'CHECK_OUT']),
  timestamp: z.string().min(1, 'Select timestamp'),
  note: z.string().optional()
});

export type ManualAttendanceInput = z.infer<typeof manualAttendanceSchema>;

export const createLeaveSchema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  type: z.nativeEnum(LeaveType),
  fromDate: z.string().min(1, 'Select start date'),
  toDate: z.string().min(1, 'Select end date'),
  isHalfDay: z.boolean().default(false),
  reason: z.string().min(3, 'Provide a reason for leave')
});

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;

export const decisionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().optional()
});

export type DecisionInput = z.infer<typeof decisionSchema>;

export const bulkDecisionSchema = z.object({
  eventIds: z.array(z.string()).min(1, 'Select at least one event'),
  action: z.enum(['approve', 'reject']),
  note: z.string().optional()
});

export type BulkDecisionInput = z.infer<typeof bulkDecisionSchema>;

export const updateConfigSchema = z.object({
  defaultGeofenceRadiusM: z.number().min(10).max(5000),
  defaultGraceMinutes: z.number().min(0).max(120),
  lateHalfDayAfterMin: z.number().min(0).max(360),
  timezone: z.string(),
  workingDaysPerMonth: z.number().min(1).max(31),
  autoApproveWithinGeofence: z.boolean()
});

export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
