export interface ShiftTemplate {
  id: string;
  name: string;
  code: string;
  type: 'FIXED' | 'NIGHT' | 'ROTATIONAL';
  startTime: string;
  endTime: string;
  graceMinutes: number;
  lateHalfDayAfterMin: number;
  isNightShift: boolean;
  colorClass: string;
  bgColorClass: string;
}

export interface RosterAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  photoUrl: string;
  clientId: string;
  clientName: string;
  siteId: string;
  siteName: string;
  postId: string;
  postName: string;
  shiftId: string;
  shiftName: string;
  shiftCode: string;
  date: string; // YYYY-MM-DD
}

export interface RosterConflict {
  id: string;
  type: 'OVERLAPPING_SHIFT' | 'EXCEEDED_HOURS' | 'INSUFFICIENT_REST' | 'ON_LEAVE' | 'UNSTAFFED_POST';
  severity: 'BLOCK' | 'WARN';
  employeeName?: string;
  siteName?: string;
  postName?: string;
  message: string;
  recommendedAction: string;
}

export const INITIAL_SHIFTS: ShiftTemplate[] = [
  {
    id: 'shift-morn',
    name: 'Morning Shift',
    code: 'MORN',
    type: 'FIXED',
    startTime: '07:00',
    endTime: '15:00',
    graceMinutes: 15,
    lateHalfDayAfterMin: 60,
    isNightShift: false,
    colorClass: 'text-amber-600 border-amber-300',
    bgColorClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
  },
  {
    id: 'shift-eve',
    name: 'Evening Shift',
    code: 'EVE',
    type: 'FIXED',
    startTime: '15:00',
    endTime: '23:00',
    graceMinutes: 15,
    lateHalfDayAfterMin: 60,
    isNightShift: false,
    colorClass: 'text-brand-primary border-brand-primary/30',
    bgColorClass: 'bg-brand-primary-050 dark:bg-brand-primary/10 text-brand-primary'
  },
  {
    id: 'shift-night',
    name: 'Night Shift',
    code: 'NIGHT',
    type: 'NIGHT',
    startTime: '23:00',
    endTime: '07:00',
    graceMinutes: 15,
    lateHalfDayAfterMin: 60,
    isNightShift: true,
    colorClass: 'text-indigo-600 border-indigo-300',
    bgColorClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-400'
  },
  {
    id: 'shift-general',
    name: 'General Day Duty',
    code: 'GEN',
    type: 'FIXED',
    startTime: '09:00',
    endTime: '18:00',
    graceMinutes: 20,
    lateHalfDayAfterMin: 90,
    isNightShift: false,
    colorClass: 'text-emerald-600 border-emerald-300',
    bgColorClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
  }
];

export const WEEK_DAYS = [
  { dayName: 'Mon', date: '2026-08-17', isToday: false },
  { dayName: 'Tue', date: '2026-08-18', isToday: true },
  { dayName: 'Wed', date: '2026-08-19', isToday: false },
  { dayName: 'Thu', date: '2026-08-20', isToday: false },
  { dayName: 'Fri', date: '2026-08-21', isToday: false },
  { dayName: 'Sat', date: '2026-08-22', isToday: false },
  { dayName: 'Sun', date: '2026-08-23', isToday: false }
];

export const INITIAL_ROSTER: RosterAssignment[] = [
  { id: 'ros-1', employeeId: 'emp-1', employeeName: 'Ramesh Kumar', employeeCode: 'GRD-0001', photoUrl: 'https://i.pravatar.cc/150?u=GRD-0001', clientId: 'cli-hdfc', clientName: 'HDFC Bank Corporate HQ', siteId: 'site-1', siteName: 'HDFC Bank HQ Campus', postId: 'post-1', postName: 'Main Gate 1', shiftId: 'shift-morn', shiftName: 'Morning Shift', shiftCode: 'MORN', date: '2026-08-18' },
  { id: 'ros-2', employeeId: 'emp-2', employeeName: 'Suresh Singh', employeeCode: 'GRD-0002', photoUrl: 'https://i.pravatar.cc/150?u=GRD-0002', clientId: 'cli-hdfc', clientName: 'HDFC Bank Corporate HQ', siteId: 'site-1', siteName: 'HDFC Bank HQ Campus', postId: 'post-1', postName: 'Main Gate 1', shiftId: 'shift-morn', shiftName: 'Morning Shift', shiftCode: 'MORN', date: '2026-08-18' },
  { id: 'ros-3', employeeId: 'emp-3', employeeName: 'Rajesh Patil', employeeCode: 'GRD-0003', photoUrl: 'https://i.pravatar.cc/150?u=GRD-0003', clientId: 'cli-hdfc', clientName: 'HDFC Bank Corporate HQ', siteId: 'site-1', siteName: 'HDFC Bank HQ Campus', postId: 'post-2', postName: 'Cash Vault Entrance', shiftId: 'shift-eve', shiftName: 'Evening Shift', shiftCode: 'EVE', date: '2026-08-18' },
  { id: 'ros-4', employeeId: 'emp-4', employeeName: 'Vikram Pawar', employeeCode: 'GRD-0004', photoUrl: 'https://i.pravatar.cc/150?u=GRD-0004', clientId: 'cli-hdfc', clientName: 'HDFC Bank Corporate HQ', siteId: 'site-1', siteName: 'HDFC Bank HQ Campus', postId: 'post-3', postName: 'ATM Kiosk Gate', shiftId: 'shift-night', shiftName: 'Night Shift', shiftCode: 'NIGHT', date: '2026-08-18' },
  { id: 'ros-5', employeeId: 'emp-5', employeeName: 'Amit Shinde', employeeCode: 'GRD-0005', photoUrl: 'https://i.pravatar.cc/150?u=GRD-0005', clientId: 'cli-infy', clientName: 'Infosys IT Park', siteId: 'site-2', siteName: 'Infosys Hinjawadi Phase 1', postId: 'post-4', postName: 'Server Room Gate', shiftId: 'shift-morn', shiftName: 'Morning Shift', shiftCode: 'MORN', date: '2026-08-18' }
];

export const INITIAL_CONFLICTS: RosterConflict[] = [
  {
    id: 'conf-1',
    type: 'UNSTAFFED_POST',
    severity: 'WARN',
    siteName: 'HDFC Bank HQ Campus',
    postName: 'Cash Vault Entrance (Night Shift)',
    message: 'Cash Vault Night Shift requires 2 guards, but only 1 guard is scheduled.',
    recommendedAction: 'Assign 1 additional gunman guard to Cash Vault Night Shift.'
  },
  {
    id: 'conf-2',
    type: 'INSUFFICIENT_REST',
    severity: 'WARN',
    employeeName: 'Vikram Pawar (GRD-0004)',
    message: 'Guard Vikram Pawar is scheduled for Evening Shift followed immediately by Night Shift without an 8-hour rest break.',
    recommendedAction: 'Swap Evening Shift with an available standby guard.'
  }
];
