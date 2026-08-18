import { INITIAL_EMPLOYEES } from './employees';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  photoUrl: string;
  role: string;
  department: string;
  siteName: string;
  postName: string;
  date: string;
  status: 'PRESENT' | 'LATE_IN' | 'LATE_IN_HALF_DAY' | 'ABSENT' | 'ON_LEAVE' | 'HALF_DAY_LEAVE';
  checkIn: string;
  checkOut: string;
  workHours: string;
  workedMinutes: number;
  isLate: boolean;
  isEarlyExit: boolean;
}

const todayStr = '2026-08-18';

export const INITIAL_ATTENDANCE: AttendanceRecord[] = INITIAL_EMPLOYEES.map((emp, i) => {
  let status: AttendanceRecord['status'] = 'PRESENT';
  let checkIn = '08:52 AM';
  let checkOut = '05:00 PM';
  let workHours = '8h 08m';
  let workedMinutes = 488;
  let lateFlag = false;

  if (i % 7 === 0) {
    status = 'LATE_IN';
    checkIn = '09:35 AM';
    checkOut = '05:00 PM';
    workHours = '7h 25m';
    workedMinutes = 445;
    lateFlag = true;
  } else if (i % 13 === 0) {
    status = 'LATE_IN_HALF_DAY';
    checkIn = '10:45 AM';
    checkOut = '05:00 PM';
    workHours = '6h 15m';
    workedMinutes = 375;
    lateFlag = true;
  } else if (i % 17 === 0) {
    status = 'ABSENT';
    checkIn = '--:--';
    checkOut = '--:--';
    workHours = '0h 00m';
    workedMinutes = 0;
  } else if (i % 23 === 0) {
    status = 'ON_LEAVE';
    checkIn = '--:--';
    checkOut = '--:--';
    workHours = '0h 00m';
    workedMinutes = 0;
  } else if (i % 5 === 0) {
    checkIn = '07:15 AM';
    checkOut = '--:--';
    workHours = 'Pending';
    workedMinutes = 0;
  }

  return {
    id: `att-${i + 1}`,
    employeeId: emp.id,
    employeeCode: emp.employeeCode,
    employeeName: `${emp.firstName} ${emp.lastName}`,
    photoUrl: emp.photoUrl,
    role: emp.role.replace(/_/g, ' '),
    department: emp.currentClientName,
    siteName: emp.currentSiteName,
    postName: emp.currentPostName,
    date: todayStr,
    status,
    checkIn,
    checkOut,
    workHours,
    workedMinutes,
    isLate: lateFlag,
    isEarlyExit: i % 40 === 0
  };
});
