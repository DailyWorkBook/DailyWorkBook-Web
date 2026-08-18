export interface AttendanceConfig {
  defaultGeofenceRadiusM: number;
  defaultGraceMinutes: number;
  lateHalfDayAfterMin: number;
  timezone: string;
  workingDaysPerMonth: number;
  autoApproveWithinGeofence: boolean;
  gpsTelemetryPingIntervalSec: number;
  overtimeThresholdHours: number;
  unattendedPostAlertMinutes: number;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  scope: 'NATIONAL' | 'STATE' | 'SITE';
  siteName?: string;
}

export interface OrgProfile {
  name: string;
  registrationNo: string;
  psaraLicenseNo: string;
  psaraExpiryDate: string;
  gstin: string;
  contactEmail: string;
  contactPhone: string;
  chiefSecurityOfficer: string;
  registeredAddress: string;
  city: string;
  state: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  timezone: string;
}

export const INITIAL_CONFIG: AttendanceConfig = {
  defaultGeofenceRadiusM: 100,
  defaultGraceMinutes: 15,
  lateHalfDayAfterMin: 60,
  timezone: 'Asia/Kolkata',
  workingDaysPerMonth: 26,
  autoApproveWithinGeofence: true,
  gpsTelemetryPingIntervalSec: 10,
  overtimeThresholdHours: 8,
  unattendedPostAlertMinutes: 15
};

export const INITIAL_HOLIDAYS: Holiday[] = [
  { id: 'hol-1', date: '2026-01-26', name: 'Republic Day', scope: 'NATIONAL' },
  { id: 'hol-2', date: '2026-08-15', name: 'Independence Day', scope: 'NATIONAL' },
  { id: 'hol-3', date: '2026-10-02', name: 'Gandhi Jayanti', scope: 'NATIONAL' },
  { id: 'hol-4', date: '2026-11-08', name: 'Diwali Laxmi Pujan', scope: 'NATIONAL' },
  { id: 'hol-5', date: '2026-09-17', name: 'Ganesh Chaturthi', scope: 'STATE' },
  { id: 'hol-6', date: '2026-05-01', name: 'Maharashtra Day', scope: 'STATE' }
];

export const INITIAL_ORG_PROFILE: OrgProfile = {
  name: 'WatchTower Security & Workforce Solutions Pvt Ltd',
  registrationNo: 'CIN-U74999MH2018PTC304890',
  psaraLicenseNo: 'PSARA-MH-2024-8849',
  psaraExpiryDate: '2029-12-31',
  gstin: '27AABCW1234F1Z5',
  contactEmail: 'support@watchtower.dev',
  contactPhone: '+91 20 2553 4000',
  chiefSecurityOfficer: 'Col. Rajeshwar Singh (Retd)',
  registeredAddress: 'Suite 401, Cyber Heights, Sector 5, Hinjawadi',
  city: 'Pune',
  state: 'Maharashtra',
  adminName: 'Olivia Chen',
  adminEmail: 'admin@watchtower.dev',
  adminRole: 'Organization Admin',
  timezone: 'Asia/Kolkata (IST)'
};
