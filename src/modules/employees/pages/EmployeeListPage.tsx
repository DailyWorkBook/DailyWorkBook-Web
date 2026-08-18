import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Filter, Phone, Mail, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Building2, UserPlus, CreditCard, Shield, Image, Upload, Radio, ExternalLink, ChevronRight, UserCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Sheet } from '../../../components/ui/Sheet';
import { INITIAL_EMPLOYEES, Employee, EmployeePositionRole } from '../../../mockData/employees';
import { INITIAL_CLIENTS } from '../../../mockData/clients';
import { INITIAL_SITES } from '../../../mockData/sites';
import confetti from 'canvas-confetti';

const POSITION_ROLES: { value: EmployeePositionRole; label: string }[] = [
  { value: 'SECURITY_GUARD', label: 'Security Guard (Unarmed)' },
  { value: 'HEAD_GUARD', label: 'Head Guard / Post Incharge' },
  { value: 'SECURITY_SUPERVISOR', label: 'Field Supervisor' },
  { value: 'GUNMAN', label: 'Armed Gunman (Licensed)' },
  { value: 'CCTV_OPERATOR', label: 'CCTV & Control Room Operator' },
  { value: 'FIELD_INSPECTOR', label: 'Field Patrol Inspector' }
];

export const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Add Employee Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<EmployeePositionRole>('SECURITY_GUARD');

  // Deployment Cascading State (Client -> Site -> Post)
  const [selectedClientId, setSelectedClientId] = useState(INITIAL_CLIENTS[0].id);
  const [selectedSiteId, setSelectedSiteId] = useState(INITIAL_SITES[0].id);
  const [selectedPostId, setSelectedPostId] = useState(INITIAL_SITES[0].posts[0].id);

  // KYC State & Photos
  const [aadhaar, setAadhaar] = useState('');
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState('');
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState('');
  const [pan, setPan] = useState('');
  const [panCardUrl, setPanCardUrl] = useState('');
  const [policeStatus, setPoliceStatus] = useState<'VERIFIED' | 'PENDING' | 'REJECTED'>('VERIFIED');
  const [policeDocNo, setPoliceDocNo] = useState('');
  const [policeDocUrl, setPoliceDocUrl] = useState('');

  // Bank Details State
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('HDFC0001234');
  const [branch, setBranch] = useState('Shivajinagar, Pune');

  const availableSites = INITIAL_SITES.filter(s => s.clientId === selectedClientId);
  const activeSite = availableSites.find(s => s.id === selectedSiteId) || availableSites[0] || INITIAL_SITES[0];
  const availablePosts = activeSite ? activeSite.posts : [];

  const handleClientChange = (cId: string) => {
    setSelectedClientId(cId);
    const sites = INITIAL_SITES.filter(s => s.clientId === cId);
    if (sites.length > 0) {
      setSelectedSiteId(sites[0].id);
      setSelectedPostId(sites[0].posts[0]?.id || '');
    }
  };

  const handleSiteChange = (sId: string) => {
    setSelectedSiteId(sId);
    const site = INITIAL_SITES.find(s => s.id === sId);
    if (site && site.posts.length > 0) {
      setSelectedPostId(site.posts[0].id);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const matchSearch =
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.currentSiteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !roleFilter || e.role === roleFilter;
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const activeCount = employees.filter(e => e.status === 'ACTIVE').length;
  const verifiedKycCount = employees.filter(e => e.kyc.policeVerificationStatus === 'VERIFIED').length;
  const avgAttendance = Math.round(employees.reduce((acc, e) => acc + e.attendanceRate, 0) / employees.length);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const displayedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;

    const client = INITIAL_CLIENTS.find(c => c.id === selectedClientId) || INITIAL_CLIENTS[0];
    const site = INITIAL_SITES.find(s => s.id === selectedSiteId) || INITIAL_SITES[0];
    const post = site.posts.find(p => p.id === selectedPostId) || site.posts[0];

    const idx = employees.length + 1;
    const code = `GRD-${String(idx).padStart(4, '0')}`;

    const newEmp: Employee = {
      id: `emp-${idx}`,
      employeeCode: code,
      firstName,
      lastName,
      phone: phone || '+91 98220 99887',
      email: email || `${firstName.toLowerCase()}@watchtower.dev`,
      photoUrl: `https://i.pravatar.cc/150?u=${code}`,
      status: 'ACTIVE',
      role,
      dateOfJoining: new Date().toISOString().split('T')[0],
      clientId: client.id,
      currentClientName: client.name,
      currentSiteId: site.id,
      currentSiteName: site.name,
      currentPostId: post.id,
      currentPostName: post.name,
      attendanceRate: 95,
      personalInfo: {
        dob: '1995-08-15',
        gender: 'MALE',
        bloodGroup: 'O+',
        emergencyContactName: `${firstName} Senior`,
        emergencyContactPhone: '+91 98000 11223',
        emergencyRelationship: 'Parent',
        permanentAddress: 'Shivajinagar, Pune',
        currentAddress: 'Hinjawadi, Pune'
      },
      kyc: {
        aadhaarNumber: aadhaar || '4521 9876 1234',
        aadhaarFrontUrl: aadhaarFrontUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
        aadhaarBackUrl: aadhaarBackUrl || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop',
        panNumber: pan || 'ABCDE1234F',
        panCardUrl: panCardUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop',
        policeVerificationStatus: policeStatus,
        policeVerificationDocNo: policeDocNo || `PV-2026-${idx}`,
        policeVerificationExpiry: '2028-12-31',
        policeVerificationDocUrl: policeDocUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop'
      },
      bankDetails: {
        accountHolderName: `${firstName} ${lastName}`,
        accountNumber: accountNo || '30987654321',
        bankName,
        ifscCode: ifsc,
        branchName: branch
      }
    };

    setEmployees(prev => [newEmp, ...prev]);
    setIsAddModalOpen(false);
    setActiveStep(1);
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-bg-surface via-bg-surface to-brand-primary-050/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
              Security Personnel Registry & KYC Verification
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Employees Directory</h1>
          <p className="text-xs text-txt-secondary mt-1">Manage security workforce profiles, Client → Site → Post assignments, KYC document pictures, and bank details</p>
        </div>

        <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          Onboard New Guard
        </Button>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Total Registered Staff</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">{employees.length} Guards</div>
            <span className="text-[11px] text-txt-secondary">100% Shift Assigned</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Active Duty Guards</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">{activeCount} Active</div>
            <span className="text-[11px] text-txt-secondary">Deployed at Client Sites</span>
          </div>
          <div className="p-3 bg-brand-teal-050 text-brand-teal rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Police Clearance KYC</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">{verifiedKycCount} Verified</div>
            <span className="text-[11px] text-txt-secondary">Document Photos Uploaded</span>
          </div>
          <div className="p-3 bg-brand-teal/10 text-brand-teal rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Average Attendance Rate</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">{avgAttendance}%</div>
            <span className="text-[11px] text-txt-secondary">Monthly On-time Rate</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <Radio className="w-6 h-6 text-brand-primary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="wt-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
          <input
            type="text"
            placeholder="Search by guard name, code, or site..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="p-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary font-bold"
          >
            <option value="">All Positions</option>
            {POSITION_ROLES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="p-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary font-bold"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <div className="flex items-center gap-1 bg-bg-surface-2 p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' ? 'bg-brand-primary text-white shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-brand-primary text-white shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEmployees.map(e => (
            <div key={e.id} className="wt-card wt-card-interactive p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={e.photoUrl} alt={e.firstName} className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-primary/20" />
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        e.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                    </div>
                    <div>
                      <Link to={`/employees/${e.id}`} className="font-bold text-sm text-txt-primary hover:text-brand-primary transition-colors">
                        {e.firstName} {e.lastName}
                      </Link>
                      <div className="text-[11px] text-txt-secondary font-mono">{e.employeeCode}</div>
                    </div>
                  </div>

                  <Badge status={e.status} />
                </div>

                <div className="mt-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
                    {e.role.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="mt-3 p-3 bg-bg-surface-2 rounded-xl border border-border text-xs space-y-1.5">
                  <div className="font-bold text-txt-primary text-[11px]">{e.currentClientName}</div>
                  <div className="text-[11px] text-txt-secondary">{e.currentSiteName} — <span className="text-brand-primary font-semibold">{e.currentPostName}</span></div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-txt-tertiary">Police KYC:</span>
                  <span className={`inline-flex items-center gap-1 font-bold ${
                    e.kyc.policeVerificationStatus === 'VERIFIED' ? 'text-brand-teal' : 'text-status-late'
                  }`}>
                    {e.kyc.policeVerificationStatus === 'VERIFIED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {e.kyc.policeVerificationStatus}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-txt-tertiary">Attendance Rate</span>
                    <span className="text-brand-teal">{e.attendanceRate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-teal rounded-full" style={{ width: `${e.attendanceRate}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-txt-tertiary">{e.phone}</span>
                <Button size="sm" variant="primary" rightIcon={<ChevronRight className="w-3.5 h-3.5" />} onClick={() => navigate(`/employees/${e.id}`)}>
                  Profile & KYC Docs
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="wt-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left wt-table">
              <thead>
                <tr>
                  <th>GUARD CODE & NAME</th>
                  <th>POSITION ROLE</th>
                  <th>CLIENT / SITE / POST ASSIGNMENT</th>
                  <th>POLICE KYC</th>
                  <th>ATTENDANCE RATE</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {displayedEmployees.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={e.photoUrl} alt={e.firstName} className="w-9 h-9 rounded-full object-cover ring-2 ring-border" />
                        <div>
                          <Link to={`/employees/${e.id}`} className="font-bold text-xs text-txt-primary hover:text-brand-primary">
                            {e.firstName} {e.lastName}
                          </Link>
                          <div className="text-[11px] text-txt-secondary font-mono">{e.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-brand-primary-050 text-brand-primary border border-brand-primary/20">
                        {e.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs font-bold text-txt-primary">{e.currentClientName}</div>
                      <div className="text-[11px] text-txt-secondary">{e.currentSiteName} - <span className="text-txt-tertiary">{e.currentPostName}</span></div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        e.kyc.policeVerificationStatus === 'VERIFIED' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-status-late/10 text-status-late'
                      }`}>
                        {e.kyc.policeVerificationStatus === 'VERIFIED' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {e.kyc.policeVerificationStatus}
                      </span>
                    </td>
                    <td>
                      <div className="font-bold text-xs text-brand-teal tabular-nums">{e.attendanceRate}%</div>
                      <div className="w-16 h-1.5 bg-bg-surface-2 rounded-full overflow-hidden mt-0.5">
                        <div className="h-full bg-brand-teal rounded-full" style={{ width: `${e.attendanceRate}%` }} />
                      </div>
                    </td>
                    <td><Badge status={e.status} /></td>
                    <td className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/employees/${e.id}`)}>
                        View Profile & Docs
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-txt-secondary">
            <span>Showing {displayedEmployees.length} of {filteredEmployees.length} guards</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-border rounded-btn disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-bold text-txt-primary">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-border rounded-btn disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Step Add Employee Drawer */}
      <Sheet isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Onboard New Employee / Guard">
        <div className="space-y-6 text-xs">
          {/* Step Indicator */}
          <div className="grid grid-cols-4 gap-2 border-b border-border pb-4">
            {[
              { num: 1, label: 'Personal & Role' },
              { num: 2, label: 'Deployment' },
              { num: 3, label: 'KYC Pictures' },
              { num: 4, label: 'Bank Account' }
            ].map(s => (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num as any)}
                className={`py-2 px-1 text-center rounded-lg border font-bold transition-all ${
                  activeStep === s.num
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-bg-surface-2 text-txt-secondary border-border'
                }`}
              >
                <div>Step {s.num}</div>
                <div className="text-[10px] truncate opacity-90">{s.label}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleAddEmployee} className="space-y-4">
            {/* STEP 1: Personal & Role */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <h4 className="font-bold text-txt-primary text-sm">Step 1: Personal Information & Position Role</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-txt-primary mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="e.g. Ramesh"
                      className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-txt-primary mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="e.g. Patil"
                      className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-txt-primary mb-1">Mobile Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98220 12345"
                      className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-txt-primary mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ramesh.patil@watchtower.dev"
                      className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">Position / Role Assignment</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                  >
                    {POSITION_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="button" variant="primary" onClick={() => setActiveStep(2)}>Next: Deployment Assignment →</Button>
                </div>
              </div>
            )}

            {/* STEP 2: Deployment Cascading Selection */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-bold text-txt-primary text-sm">Step 2: Cascading Deployment (Client → Site → Post)</h4>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">1. Select Corporate Client</label>
                  <select
                    value={selectedClientId}
                    onChange={e => handleClientChange(e.target.value)}
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                  >
                    {INITIAL_CLIENTS.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">2. Select Client Site Campus</label>
                  <select
                    value={selectedSiteId}
                    onChange={e => handleSiteChange(e.target.value)}
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                  >
                    {availableSites.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">3. Select Duty Post Station</label>
                  <select
                    value={selectedPostId}
                    onChange={e => setSelectedPostId(e.target.value)}
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                  >
                    {availablePosts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.guardCountRequired} Guards Req)</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="secondary" onClick={() => setActiveStep(1)}>← Back</Button>
                  <Button type="button" variant="primary" onClick={() => setActiveStep(3)}>Next: KYC Pictures →</Button>
                </div>
              </div>
            )}

            {/* STEP 3: KYC Details & Document Photos */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <h4 className="font-bold text-txt-primary text-sm">Step 3: KYC Numbers & Scanned Document Pictures</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-txt-primary mb-1">Aadhaar Card Number</label>
                    <input
                      type="text"
                      value={aadhaar}
                      onChange={e => setAadhaar(e.target.value)}
                      placeholder="4521 9876 1234"
                      className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-txt-primary mb-1">PAN Card Number</label>
                    <input
                      type="text"
                      value={pan}
                      onChange={e => setPan(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">Aadhaar Card Front Photo URL / File</label>
                  <input
                    type="text"
                    value={aadhaarFrontUrl}
                    onChange={e => setAadhaarFrontUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">Aadhaar Card Back Photo URL / File</label>
                  <input
                    type="text"
                    value={aadhaarBackUrl}
                    onChange={e => setAadhaarBackUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">PAN Card Photo URL / File</label>
                  <input
                    type="text"
                    value={panCardUrl}
                    onChange={e => setPanCardUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-txt-primary mb-1">Police Clearance Status</label>
                    <select
                      value={policeStatus}
                      onChange={e => setPoliceStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                    >
                      <option value="VERIFIED">Verified</option>
                      <option value="PENDING">Pending Check</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-txt-primary mb-1">Police Record Doc No.</label>
                    <input
                      type="text"
                      value={policeDocNo}
                      onChange={e => setPoliceDocNo(e.target.value)}
                      placeholder="PV-PN-2026-0042"
                      className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">Police Clearance Certificate Photo URL</label>
                  <input
                    type="text"
                    value={policeDocUrl}
                    onChange={e => setPoliceDocUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="secondary" onClick={() => setActiveStep(2)}>← Back</Button>
                  <Button type="button" variant="primary" onClick={() => setActiveStep(4)}>Next: Bank Details →</Button>
                </div>
              </div>
            )}

            {/* STEP 4: Bank Account Details */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <h4 className="font-bold text-txt-primary text-sm">Step 4: Bank Account & Direct Salary Deposit Info</h4>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="State Bank of India / HDFC Bank"
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-txt-primary mb-1">Account Number</label>
                  <input
                    type="text"
                    value={accountNo}
                    onChange={e => setAccountNo(e.target.value)}
                    placeholder="30987654321"
                    className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-txt-primary mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={e => setIfsc(e.target.value.toUpperCase())}
                      placeholder="SBIN0001234"
                      className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-txt-primary mb-1">Branch Name</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      placeholder="Shivajinagar Branch"
                      className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border">
                  <Button type="button" variant="secondary" onClick={() => setActiveStep(3)}>← Back</Button>
                  <Button type="submit" variant="primary">Save & Complete Onboarding</Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </Sheet>
    </motion.div>
  );
};
