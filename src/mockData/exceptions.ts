export interface ExceptionItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  photoUrl: string;
  siteName: string;
  postName: string;
  shiftName: string;
  method: 'QR' | 'GPS' | 'MANUAL';
  capturedTime: string;
  latitude: number;
  longitude: number;
  distanceFromSiteM: number;
  withinGeofence: boolean;
  reason: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const INITIAL_EXCEPTIONS: ExceptionItem[] = [
  {
    id: 'exc-1',
    employeeId: 'emp-449',
    employeeCode: 'GRD-0449',
    employeeName: 'Vishal Chavan',
    photoUrl: 'https://i.pravatar.cc/150?u=GRD-0449',
    siteName: 'Pune Main Branch (HDFC Bank)',
    postName: 'Main Gate',
    shiftName: 'Morning Shift (07:00 - 15:00)',
    method: 'GPS',
    capturedTime: '07:14:02 AM',
    latitude: 18.5245,
    longitude: 73.8610,
    distanceFromSiteM: 480,
    withinGeofence: false,
    reason: 'Out of geofence radius (480m away from site center)',
    severity: 'HIGH'
  },
  {
    id: 'exc-2',
    employeeId: 'emp-450',
    employeeCode: 'GRD-0450',
    employeeName: 'Sandip Gaikwad',
    photoUrl: 'https://i.pravatar.cc/150?u=GRD-0450',
    siteName: 'Hinjawadi Phase 1 (Infosys)',
    postName: 'North Gate',
    shiftName: 'Morning Shift (07:00 - 15:00)',
    method: 'MANUAL',
    capturedTime: '07:22:15 AM',
    latitude: 18.5912,
    longitude: 73.7389,
    distanceFromSiteM: 20,
    withinGeofence: true,
    reason: 'Manual supervisor entry requested (Device battery died)',
    severity: 'MEDIUM'
  },
  {
    id: 'exc-3',
    employeeId: 'emp-451',
    employeeCode: 'GRD-0451',
    employeeName: 'Ketan Kulkarni',
    photoUrl: 'https://i.pravatar.cc/150?u=GRD-0451',
    siteName: 'Central Hospital (Ruby Hall)',
    postName: 'Emergency Entry',
    shiftName: 'Morning Shift (07:00 - 15:00)',
    method: 'GPS',
    capturedTime: '07:35:40 AM',
    latitude: 18.5360,
    longitude: 73.8790,
    distanceFromSiteM: 520,
    withinGeofence: false,
    reason: 'Out of geofence radius (520m away)',
    severity: 'HIGH'
  },
  {
    id: 'exc-4',
    employeeId: 'emp-452',
    employeeCode: 'GRD-0452',
    employeeName: 'Abhijit Joshi',
    photoUrl: 'https://i.pravatar.cc/150?u=GRD-0452',
    siteName: 'BKC Office (ICICI Bank)',
    postName: 'Tower A Gate',
    shiftName: 'Morning Shift (07:00 - 15:00)',
    method: 'MANUAL',
    capturedTime: '07:40:00 AM',
    latitude: 19.0657,
    longitude: 72.8687,
    distanceFromSiteM: 10,
    withinGeofence: true,
    reason: 'Manual override: Guard phone camera broken',
    severity: 'LOW'
  }
];
