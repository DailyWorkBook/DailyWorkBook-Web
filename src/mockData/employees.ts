import { INITIAL_SITES } from './sites';
import { INITIAL_CLIENTS } from './clients';

export type EmployeePositionRole =
  | 'SECURITY_GUARD'
  | 'HEAD_GUARD'
  | 'SECURITY_SUPERVISOR'
  | 'GUNMAN'
  | 'CCTV_OPERATOR'
  | 'FIELD_INSPECTOR';

export interface EmployeePersonalInfo {
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelationship: string;
  permanentAddress: string;
  currentAddress: string;
}

export interface EmployeeKYC {
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  panNumber: string;
  panCardUrl: string;
  policeVerificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  policeVerificationDocNo: string;
  policeVerificationExpiry: string;
  policeVerificationDocUrl: string;
  drivingLicense?: string;
  gunLicenseNo?: string;
}

export interface EmployeeBankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  upiId?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  photoUrl: string;
  status: 'ONBOARDING' | 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'TERMINATED';
  role: EmployeePositionRole;
  dateOfJoining: string;
  clientId: string;
  currentClientName: string;
  currentSiteId: string;
  currentSiteName: string;
  currentPostId: string;
  currentPostName: string;
  attendanceRate: number;
  personalInfo: EmployeePersonalInfo;
  kyc: EmployeeKYC;
  bankDetails: EmployeeBankDetails;
}

const firstNames = [
  'Ramesh', 'Suresh', 'Rajesh', 'Vikram', 'Amit', 'Sunil', 'Vijay', 'Anil', 'Manoj', 'Sanjay',
  'Deepak', 'Dinesh', 'Prakash', 'Mahesh', 'Ganesh', 'Rakesh', 'Ashok', 'Ajay', 'Santosh', 'Pravin',
  'Rahul', 'Sachin', 'Nilesh', 'Prashant', 'Vishal', 'Sandip', 'Ketan', 'Abhijit', 'Amol', 'Kiran'
];

const lastNames = [
  'Kumar', 'Singh', 'Patil', 'Pawar', 'Shinde', 'Jadhav', 'Deshmukh', 'Kadam', 'Chavan', 'Gaikwad',
  'More', 'Surve', 'Kulkarni', 'Joshi', 'Sharma', 'Verma', 'Gupta', 'Yadav', 'Rathod', 'Thakur'
];

const rolesPool: EmployeePositionRole[] = [
  'SECURITY_GUARD',
  'SECURITY_GUARD',
  'SECURITY_GUARD',
  'HEAD_GUARD',
  'SECURITY_SUPERVISOR',
  'GUNMAN',
  'CCTV_OPERATOR',
  'FIELD_INSPECTOR'
];

export const INITIAL_EMPLOYEES: Employee[] = Array.from({ length: 452 }).map((_, i) => {
  const idx = i + 1;
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const code = `GRD-${String(idx).padStart(4, '0')}`;
  const site = INITIAL_SITES[i % INITIAL_SITES.length];
  const client = INITIAL_CLIENTS.find(c => c.id === site.clientId) || INITIAL_CLIENTS[0];
  const post = site.posts[i % site.posts.length];

  let status: Employee['status'] = 'ACTIVE';
  if (idx > 430) status = 'ON_LEAVE';
  if (idx > 445) status = 'INACTIVE';

  const role = rolesPool[i % rolesPool.length];

  const aadhaar = `${4000 + (i * 17) % 5000} ${5000 + (i * 23) % 4000} ${1000 + (i * 31) % 8000}`;
  const pan = `ABCDE${1000 + (i * 7) % 8999}F`;
  const isVerified = idx % 9 !== 0;

  return {
    id: `emp-${idx}`,
    employeeCode: code,
    firstName: fn,
    lastName: ln,
    phone: `+91 98${Math.floor(10000000 + (i * 1234567) % 90000000)}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${idx}@watchtower.dev`,
    photoUrl: `https://i.pravatar.cc/150?u=${code}`,
    status,
    role,
    dateOfJoining: '2024-01-15',
    clientId: client.id,
    currentClientName: client.name,
    currentSiteId: site.id,
    currentSiteName: site.name,
    currentPostId: post.id,
    currentPostName: post.name,
    attendanceRate: 88 + ((i * 7) % 11),
    personalInfo: {
      dob: '1992-05-14',
      gender: 'MALE',
      bloodGroup: i % 2 === 0 ? 'O+' : 'B+',
      emergencyContactName: `${fn} Senior`,
      emergencyContactPhone: `+91 97${Math.floor(10000000 + (i * 7654321) % 90000000)}`,
      emergencyRelationship: 'Father',
      permanentAddress: `Flat ${idx * 4}, Galaxy Heights, Sector 12, Pimple Saudagar, Pune`,
      currentAddress: `Room 12, Chawl No. 3, Near Hinjawadi Station, Pune`
    },
    kyc: {
      aadhaarNumber: aadhaar,
      aadhaarFrontUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
      aadhaarBackUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop',
      panNumber: pan,
      panCardUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop',
      policeVerificationStatus: isVerified ? 'VERIFIED' : 'PENDING',
      policeVerificationDocNo: `PV-PN-2025-${String(idx).padStart(4, '0')}`,
      policeVerificationExpiry: '2027-12-31',
      policeVerificationDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop',
      drivingLicense: role === 'FIELD_INSPECTOR' ? `MH12 2020${String(idx).padStart(5, '0')}` : undefined,
      gunLicenseNo: role === 'GUNMAN' ? `GL-ARM-2024-${String(idx).padStart(4, '0')}` : undefined
    },
    bankDetails: {
      accountHolderName: `${fn} ${ln}`,
      accountNumber: `309${String(100000000 + (i * 987654) % 899999999)}`,
      bankName: i % 2 === 0 ? 'State Bank of India' : 'HDFC Bank',
      ifscCode: i % 2 === 0 ? 'SBIN0001234' : 'HDFC0005678',
      branchName: 'Shivajinagar Branch, Pune',
      upiId: `${fn.toLowerCase()}@sbi`
    }
  };
});
