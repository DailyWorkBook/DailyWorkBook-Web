export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  photoUrl: string;
  type: 'CASUAL' | 'EARNED' | 'MEDICAL' | 'UNPAID' | 'COMP_OFF';
  fromDate: string;
  toDate: string;
  isHalfDay: boolean;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  appliedOn: string;
}

export interface LeaveBalance {
  employeeId: string;
  employeeName: string;
  casual: number;
  earned: number;
  medical: number;
}

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-431',
    employeeCode: 'GRD-0431',
    employeeName: 'Sunil Jadhav',
    photoUrl: 'https://i.pravatar.cc/150?u=GRD-0431',
    type: 'CASUAL',
    fromDate: '2026-08-20',
    toDate: '2026-08-22',
    isHalfDay: false,
    reason: 'Family ceremony at hometown in Satara',
    status: 'PENDING',
    appliedOn: '2026-08-17'
  },
  {
    id: 'leave-2',
    employeeId: 'emp-432',
    employeeCode: 'GRD-0432',
    employeeName: 'Vijay Deshmukh',
    photoUrl: 'https://i.pravatar.cc/150?u=GRD-0432',
    type: 'MEDICAL',
    fromDate: '2026-08-15',
    toDate: '2026-08-18',
    isHalfDay: false,
    reason: 'Severe viral fever and doctor advised rest',
    status: 'APPROVED',
    appliedOn: '2026-08-14'
  },
  {
    id: 'leave-3',
    employeeId: 'emp-433',
    employeeCode: 'GRD-0433',
    employeeName: 'Anil Kadam',
    photoUrl: 'https://i.pravatar.cc/150?u=GRD-0433',
    type: 'EARNED',
    fromDate: '2026-08-25',
    toDate: '2026-08-30',
    isHalfDay: false,
    reason: 'Annual family holiday trip',
    status: 'PENDING',
    appliedOn: '2026-08-16'
  }
];

export const INITIAL_LEAVE_BALANCES: LeaveBalance[] = [
  { employeeId: 'emp-431', employeeName: 'Sunil Jadhav', casual: 10, earned: 14, medical: 10 },
  { employeeId: 'emp-432', employeeName: 'Vijay Deshmukh', casual: 12, earned: 15, medical: 7 },
  { employeeId: 'emp-433', employeeName: 'Anil Kadam', casual: 12, earned: 15, medical: 10 }
];
