import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, FileText, Phone, Mail, MapPin, AlertTriangle, Building2, User, Edit3, Save, Eye, Upload, Image, X, Radio, Battery, Clock, Navigation, Camera } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Sheet } from '../../../components/ui/Sheet';
import { Dialog } from '../../../components/ui/Dialog';
import { INITIAL_EMPLOYEES, Employee, EmployeePositionRole } from '../../../mockData/employees';
import { INITIAL_CLIENTS } from '../../../mockData/clients';
import { INITIAL_SITES } from '../../../mockData/sites';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const POSITION_ROLES: { value: EmployeePositionRole; label: string }[] = [
  { value: 'SECURITY_GUARD', label: 'Security Guard (Unarmed)' },
  { value: 'HEAD_GUARD', label: 'Head Guard / Post Incharge' },
  { value: 'SECURITY_SUPERVISOR', label: 'Field Supervisor' },
  { value: 'GUNMAN', label: 'Armed Gunman (Licensed)' },
  { value: 'CCTV_OPERATOR', label: 'CCTV & Control Room Operator' },
  { value: 'FIELD_INSPECTOR', label: 'Field Patrol Inspector' }
];

export const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const initialEmp = INITIAL_EMPLOYEES.find(e => e.id === id) || INITIAL_EMPLOYEES[0];
  const [employee, setEmployee] = useState<Employee>(initialEmp);
  const [activeTab, setActiveTab] = useState<'tracker' | 'kyc' | 'overview' | 'bank' | 'attendance'>('tracker');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState(employee.photoUrl);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Live Location Data for single guard
  const site = INITIAL_SITES.find(s => s.id === employee.currentSiteId) || INITIAL_SITES[0];
  const liveLat = site.latitude + 0.0003;
  const liveLng = site.longitude + 0.0002;

  // Edit Employee Form State
  const [firstName, setFirstName] = useState(employee.firstName);
  const [lastName, setLastName] = useState(employee.lastName);
  const [photoUrl, setPhotoUrl] = useState(employee.photoUrl);
  const [phone, setPhone] = useState(employee.phone);
  const [email, setEmail] = useState(employee.email);
  const [role, setRole] = useState<EmployeePositionRole>(employee.role);
  const [status, setStatus] = useState<Employee['status']>(employee.status);

  // Deployment State
  const [selectedClientId, setSelectedClientId] = useState(employee.clientId);
  const [selectedSiteId, setSelectedSiteId] = useState(employee.currentSiteId);
  const [selectedPostId, setSelectedPostId] = useState(employee.currentPostId);

  // Personal Info State
  const [dob, setDob] = useState(employee.personalInfo.dob);
  const [gender, setGender] = useState(employee.personalInfo.gender);
  const [bloodGroup, setBloodGroup] = useState(employee.personalInfo.bloodGroup);
  const [emergencyName, setEmergencyName] = useState(employee.personalInfo.emergencyContactName);
  const [emergencyPhone, setEmergencyPhone] = useState(employee.personalInfo.emergencyContactPhone);
  const [emergencyRel, setEmergencyRel] = useState(employee.personalInfo.emergencyRelationship);
  const [currentAddr, setCurrentAddr] = useState(employee.personalInfo.currentAddress);
  const [permAddr, setPermAddr] = useState(employee.personalInfo.permanentAddress);

  // KYC State & Photo URLs
  const [aadhaar, setAadhaar] = useState(employee.kyc.aadhaarNumber);
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState(employee.kyc.aadhaarFrontUrl || '');
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState(employee.kyc.aadhaarBackUrl || '');
  const [pan, setPan] = useState(employee.kyc.panNumber);
  const [panCardUrl, setPanCardUrl] = useState(employee.kyc.panCardUrl || '');
  const [policeStatus, setPoliceStatus] = useState(employee.kyc.policeVerificationStatus);
  const [policeDocNo, setPoliceDocNo] = useState(employee.kyc.policeVerificationDocNo);
  const [policeExpiry, setPoliceExpiry] = useState(employee.kyc.policeVerificationExpiry);
  const [policeDocUrl, setPoliceDocUrl] = useState(employee.kyc.policeVerificationDocUrl || '');

  // Bank Details State
  const [accountHolder, setAccountHolder] = useState(employee.bankDetails.accountHolderName);
  const [accountNo, setAccountNo] = useState(employee.bankDetails.accountNumber);
  const [bankName, setBankName] = useState(employee.bankDetails.bankName);
  const [ifsc, setIfsc] = useState(employee.bankDetails.ifscCode);
  const [branch, setBranch] = useState(employee.bankDetails.branchName);

  const availableSites = INITIAL_SITES.filter(s => s.clientId === selectedClientId);
  const activeSite = availableSites.find(s => s.id === selectedSiteId) || availableSites[0] || INITIAL_SITES[0];
  const availablePosts = activeSite ? activeSite.posts : [];

  const openEditModal = () => {
    setFirstName(employee.firstName);
    setLastName(employee.lastName);
    setPhotoUrl(employee.photoUrl);
    setPhone(employee.phone);
    setEmail(employee.email);
    setRole(employee.role);
    setStatus(employee.status);
    setSelectedClientId(employee.clientId);
    setSelectedSiteId(employee.currentSiteId);
    setSelectedPostId(employee.currentPostId);
    setDob(employee.personalInfo.dob);
    setGender(employee.personalInfo.gender);
    setBloodGroup(employee.personalInfo.bloodGroup);
    setEmergencyName(employee.personalInfo.emergencyContactName);
    setEmergencyPhone(employee.personalInfo.emergencyContactPhone);
    setEmergencyRel(employee.personalInfo.emergencyRelationship);
    setCurrentAddr(employee.personalInfo.currentAddress);
    setPermAddr(employee.personalInfo.permanentAddress);
    setAadhaar(employee.kyc.aadhaarNumber);
    setAadhaarFrontUrl(employee.kyc.aadhaarFrontUrl || '');
    setAadhaarBackUrl(employee.kyc.aadhaarBackUrl || '');
    setPan(employee.kyc.panNumber);
    setPanCardUrl(employee.kyc.panCardUrl || '');
    setPoliceStatus(employee.kyc.policeVerificationStatus);
    setPoliceDocNo(employee.kyc.policeVerificationDocNo);
    setPoliceExpiry(employee.kyc.policeVerificationExpiry);
    setPoliceDocUrl(employee.kyc.policeVerificationDocUrl || '');
    setAccountHolder(employee.bankDetails.accountHolderName);
    setAccountNo(employee.bankDetails.accountNumber);
    setBankName(employee.bankDetails.bankName);
    setIfsc(employee.bankDetails.ifscCode);
    setBranch(employee.bankDetails.branchName);
    setIsEditModalOpen(true);
  };

  const handleUpdateAvatarPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) return;
    setEmployee(prev => ({ ...prev, photoUrl: newPhotoUrl }));
    setPhotoUrl(newPhotoUrl);
    setIsPhotoModalOpen(false);
    setToastMsg('Employee profile picture updated!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const client = INITIAL_CLIENTS.find(c => c.id === selectedClientId) || INITIAL_CLIENTS[0];
    const site = INITIAL_SITES.find(s => s.id === selectedSiteId) || INITIAL_SITES[0];
    const post = site.posts.find(p => p.id === selectedPostId) || site.posts[0];

    const updated: Employee = {
      ...employee,
      firstName,
      lastName,
      photoUrl,
      phone,
      email,
      role,
      status,
      clientId: client.id,
      currentClientName: client.name,
      currentSiteId: site.id,
      currentSiteName: site.name,
      currentPostId: post.id,
      currentPostName: post.name,
      personalInfo: {
        dob,
        gender,
        bloodGroup,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        emergencyRelationship: emergencyRel,
        currentAddress: currentAddr,
        permanentAddress: permAddr
      },
      kyc: {
        aadhaarNumber: aadhaar,
        aadhaarFrontUrl,
        aadhaarBackUrl,
        panNumber: pan,
        panCardUrl,
        policeVerificationStatus: policeStatus,
        policeVerificationDocNo: policeDocNo,
        policeVerificationExpiry: policeExpiry,
        policeVerificationDocUrl: policeDocUrl
      },
      bankDetails: {
        accountHolderName: accountHolder,
        accountNumber: accountNo,
        bankName,
        ifscCode: ifsc,
        branchName: branch
      }
    };

    setEmployee(updated);
    setIsEditModalOpen(false);
    setToastMsg('Guard profile updated successfully!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/employees')}>
            Back to Directory
          </Button>
          <span className="text-txt-tertiary text-xs">/</span>
          <span className="text-xs font-bold text-txt-primary">{employee.firstName} {employee.lastName}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" leftIcon={<Camera className="w-4 h-4" />} onClick={() => setIsPhotoModalOpen(true)}>
            Change Profile Photo
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Edit3 className="w-4 h-4" />} onClick={openEditModal}>
            Edit Full Profile & Docs
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-brand-teal-050 border border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Profile Card with Direct Camera Trigger */}
      <div className="wt-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => setIsPhotoModalOpen(true)}>
            <img src={employee.photoUrl} alt={employee.firstName} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-primary/20 shadow-md group-hover:opacity-90 transition-opacity" />
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 bg-brand-primary text-white rounded-full border-2 border-white shadow">
              <Camera className="w-3 h-3" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-txt-primary tracking-tight">{employee.firstName} {employee.lastName}</h1>
              <Badge status={employee.status} />
            </div>
            <p className="text-xs text-txt-secondary mt-1 flex items-center gap-3">
              <span>Code: <strong className="font-mono text-brand-primary">{employee.employeeCode}</strong></span>
              <span>•</span>
              <span className="font-semibold text-brand-teal">{employee.role.replace(/_/g, ' ')}</span>
              <span>•</span>
              <span>Joined: {employee.dateOfJoining}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-txt-tertiary block">Live GPS Location</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-teal/10 text-brand-teal border border-brand-teal/20 inline-flex items-center gap-1.5 mt-1">
              <Radio className="w-3.5 h-3.5 text-brand-teal animate-pulse" /> Active Tracking
            </span>
          </div>
          <div className="text-right">
            <span className="text-txt-tertiary block">Attendance Rate</span>
            <span className="text-2xl font-extrabold text-brand-teal tabular-nums">{employee.attendanceRate}%</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-border gap-6 text-xs">
        {(['tracker', 'kyc', 'overview', 'bank', 'attendance'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold capitalize transition-all border-b-2 ${
              activeTab === tab
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-txt-secondary hover:text-txt-primary'
            }`}
          >
            {tab === 'tracker' ? '📍 Live GPS Tracker Map' :
             tab === 'kyc' ? 'KYC & Document Pictures' :
             tab === 'overview' ? 'Overview & Deployment' :
             tab === 'bank' ? 'Bank Account & Payroll Info' :
             'Attendance Register'}
          </button>
        ))}
      </div>

      {/* TAB 1: LIVE GPS TRACKER MAP */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Leaflet Map (2/3 width) */}
          <div className="lg:col-span-2 wt-card overflow-hidden h-[450px] relative flex flex-col">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between text-xs z-20">
              <div className="flex items-center gap-2 font-bold">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>REALTIME GPS PATROL TRACKER</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-slate-300">Accuracy: ±4 meters</span>
                <span className="text-emerald-400 font-bold">● Inside Site Geofence</span>
              </div>
            </div>

            <div className="flex-1 w-full h-full relative">
              <MapContainer
                center={[liveLat, liveLng]}
                zoom={16}
                scrollWheelZoom={false}
                className="w-full h-full z-10"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Circle
                  center={[site.latitude, site.longitude]}
                  radius={site.geofenceRadiusM}
                  pathOptions={{
                    color: '#2F6BFF',
                    fillColor: '#2F6BFF',
                    fillOpacity: 0.15,
                    weight: 2
                  }}
                />

                <Marker position={[liveLat, liveLng]}>
                  <Popup>
                    <div className="text-xs font-bold">{employee.firstName} {employee.lastName}</div>
                    <div className="text-[11px] text-gray-600">Assigned Post: {employee.currentPostName}</div>
                    <div className="text-[11px] text-emerald-600 font-bold">Live GPS Ping Active</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Live Telemetry Panel */}
          <div className="wt-card p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-txt-primary flex items-center gap-2">
              <Navigation className="w-4 h-4 text-brand-teal" />
              <span>Guard GPS Telemetry</span>
            </h3>

            <div className="p-4 bg-bg-surface-2 border border-border rounded-xl space-y-3">
              <div>
                <span className="text-txt-tertiary block text-[11px]">Deployed Site & Post</span>
                <span className="font-bold text-txt-primary">{employee.currentSiteName}</span>
                <span className="text-brand-primary font-semibold block">{employee.currentPostName}</span>
              </div>

              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="text-txt-tertiary">GPS Coordinates</span>
                <span className="font-mono font-bold text-txt-primary">{liveLat.toFixed(4)}, {liveLng.toFixed(4)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-txt-tertiary">Distance from Duty Post</span>
                <span className="font-bold text-emerald-600">12 meters (Inside Boundary)</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-txt-tertiary">Device Battery</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Battery className="w-4 h-4" /> 88% Charged
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-txt-tertiary">Last Signal Ping</span>
                <span className="font-semibold text-txt-primary">Just now (2 sec ago)</span>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full"
              leftIcon={<MapPin className="w-4 h-4" />}
              onClick={() => navigate(`/sites/${site.id}`)}
            >
              Open Full Site Live Map
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: KYC & DOCUMENT PICTURES */}
      {activeTab === 'kyc' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-txt-primary">Government Identity & KYC Document Pictures</h3>
              <p className="text-xs text-txt-secondary mt-0.5">Verified scanned pictures of Aadhaar, PAN, and Police Verification certificates</p>
            </div>
            <Button size="sm" variant="secondary" leftIcon={<Upload className="w-3.5 h-3.5" />} onClick={openEditModal}>
              Upload / Update Document Pictures
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Aadhaar Card Front */}
            <div className="wt-card overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-txt-primary">Aadhaar Card (Front)</h4>
                  <span className="font-mono text-[11px] text-txt-secondary">{employee.kyc.aadhaarNumber}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/10 text-brand-teal">Verified</span>
              </div>
              <div className="h-44 bg-bg-surface-2 relative group overflow-hidden flex items-center justify-center">
                <img
                  src={employee.kyc.aadhaarFrontUrl}
                  alt="Aadhaar Front"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => setPreviewImage({ url: employee.kyc.aadhaarFrontUrl, title: 'Aadhaar Card (Front)' })}
                  className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs gap-1.5 transition-opacity"
                >
                  <Eye className="w-4 h-4" /> View Full Photo
                </button>
              </div>
              <div className="p-3 bg-bg-surface text-center border-t border-border">
                <span className="text-[11px] text-txt-tertiary">Scanned Front Photo</span>
              </div>
            </div>

            {/* Aadhaar Card Back */}
            <div className="wt-card overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-txt-primary">Aadhaar Card (Back)</h4>
                  <span className="font-mono text-[11px] text-txt-secondary">Address Proof</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/10 text-brand-teal">Verified</span>
              </div>
              <div className="h-44 bg-bg-surface-2 relative group overflow-hidden flex items-center justify-center">
                <img
                  src={employee.kyc.aadhaarBackUrl}
                  alt="Aadhaar Back"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => setPreviewImage({ url: employee.kyc.aadhaarBackUrl, title: 'Aadhaar Card (Back)' })}
                  className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs gap-1.5 transition-opacity"
                >
                  <Eye className="w-4 h-4" /> View Full Photo
                </button>
              </div>
              <div className="p-3 bg-bg-surface text-center border-t border-border">
                <span className="text-[11px] text-txt-tertiary">Scanned Back Photo</span>
              </div>
            </div>

            {/* PAN Card */}
            <div className="wt-card overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-txt-primary">PAN Card Picture</h4>
                  <span className="font-mono text-[11px] text-txt-secondary">{employee.kyc.panNumber}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/10 text-brand-teal">Verified</span>
              </div>
              <div className="h-44 bg-bg-surface-2 relative group overflow-hidden flex items-center justify-center">
                <img
                  src={employee.kyc.panCardUrl}
                  alt="PAN Card"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => setPreviewImage({ url: employee.kyc.panCardUrl, title: 'PAN Card Photo' })}
                  className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs gap-1.5 transition-opacity"
                >
                  <Eye className="w-4 h-4" /> View Full Photo
                </button>
              </div>
              <div className="p-3 bg-bg-surface text-center border-t border-border">
                <span className="text-[11px] text-txt-tertiary">Scanned PAN Photo</span>
              </div>
            </div>

            {/* Police Verification Certificate */}
            <div className="wt-card overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-txt-primary">Police Verification Certificate</h4>
                  <span className="font-mono text-[11px] text-txt-secondary">{employee.kyc.policeVerificationDocNo}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  employee.kyc.policeVerificationStatus === 'VERIFIED' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-status-late/10 text-status-late'
                }`}>
                  {employee.kyc.policeVerificationStatus}
                </span>
              </div>
              <div className="h-44 bg-bg-surface-2 relative group overflow-hidden flex items-center justify-center">
                <img
                  src={employee.kyc.policeVerificationDocUrl}
                  alt="Police Clearance Document"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => setPreviewImage({ url: employee.kyc.policeVerificationDocUrl, title: 'Police Clearance Certificate' })}
                  className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs gap-1.5 transition-opacity"
                >
                  <Eye className="w-4 h-4" /> View Full Certificate
                </button>
              </div>
              <div className="p-3 bg-bg-surface text-center border-t border-border">
                <span className="text-[11px] text-txt-tertiary">Expires: {employee.kyc.policeVerificationExpiry}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OVERVIEW & DEPLOYMENT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="wt-card p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-txt-primary">Deployment Assignment (Client → Site → Post)</h3>
              <button onClick={openEditModal} className="text-brand-primary font-bold hover:underline">Edit</button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-txt-tertiary block">Corporate Client</span>
                <span className="font-bold text-txt-primary text-sm">{employee.currentClientName}</span>
              </div>
              <div>
                <span className="text-txt-tertiary block">Deployed Site Campus</span>
                <span className="font-semibold text-brand-primary">{employee.currentSiteName}</span>
              </div>
              <div>
                <span className="text-txt-tertiary block">Duty Post Station</span>
                <span className="font-semibold text-brand-teal">{employee.currentPostName}</span>
              </div>
            </div>
          </div>

          <div className="wt-card p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-txt-primary">Personal Details & Emergency Contact</h3>
              <button onClick={openEditModal} className="text-brand-primary font-bold hover:underline">Edit</button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-txt-tertiary block">Phone & Email</span>
                <span className="font-bold text-txt-primary">{employee.phone} • {employee.email}</span>
              </div>
              <div>
                <span className="text-txt-tertiary block">DOB / Gender / Blood Group</span>
                <span className="font-semibold text-txt-primary">{employee.personalInfo.dob} • {employee.personalInfo.gender} • Blood Group: {employee.personalInfo.bloodGroup}</span>
              </div>
              <div>
                <span className="text-txt-tertiary block">Emergency Contact</span>
                <span className="font-semibold text-txt-primary">{employee.personalInfo.emergencyContactName} ({employee.personalInfo.emergencyRelationship}) — {employee.personalInfo.emergencyContactPhone}</span>
              </div>
              <div>
                <span className="text-txt-tertiary block">Current Address</span>
                <span className="text-txt-primary">{employee.personalInfo.currentAddress}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BANK ACCOUNT */}
      {activeTab === 'bank' && (
        <div className="wt-card p-6 space-y-4 text-xs max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-txt-primary">Bank Account Details for Direct Salary Transfer</h3>
            <Button size="sm" variant="secondary" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={openEditModal}>
              Edit Bank Info
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-txt-tertiary block">Account Holder Name</span>
              <span className="font-bold text-txt-primary text-sm">{employee.bankDetails.accountHolderName}</span>
            </div>
            <div>
              <span className="text-txt-tertiary block">Bank Name & Branch</span>
              <span className="font-semibold text-txt-primary">{employee.bankDetails.bankName} ({employee.bankDetails.branchName})</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-bg-surface-2 border border-border rounded-xl">
                <span className="text-txt-tertiary block">Account Number</span>
                <span className="font-mono text-sm font-bold text-txt-primary">{employee.bankDetails.accountNumber}</span>
              </div>
              <div className="p-3 bg-bg-surface-2 border border-border rounded-xl">
                <span className="text-txt-tertiary block">IFSC Code</span>
                <span className="font-mono text-sm font-bold text-brand-primary">{employee.bankDetails.ifscCode}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Profile Avatar Photo Modal */}
      <Dialog isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title={`Change Profile Photo: ${employee.firstName} ${employee.lastName}`}>
        <form onSubmit={handleUpdateAvatarPhoto} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-txt-primary mb-1">Profile Avatar Photo URL / File</label>
            <input
              type="text"
              required
              value={newPhotoUrl}
              onChange={e => setNewPhotoUrl(e.target.value)}
              placeholder="https://i.pravatar.cc/150..."
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          {newPhotoUrl && (
            <div className="flex items-center justify-center p-3 bg-bg-surface-2 rounded-xl border border-border">
              <img src={newPhotoUrl} alt="Preview Avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-primary/30" />
            </div>
          )}

          <div className="pt-3 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsPhotoModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" leftIcon={<Camera className="w-4 h-4" />}>
              Update Profile Photo
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Photo Lightbox Modal */}
      <Dialog isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title={previewImage?.title || 'Document Photo'}>
        {previewImage && (
          <div className="space-y-4">
            <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-slate-950">
              <img src={previewImage.url} alt={previewImage.title} className="max-h-[65vh] w-auto object-contain" />
            </div>
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setPreviewImage(null)}>Close</Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Complete Field Edit Employee & KYC Photos Modal */}
      <Sheet isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Profile & KYC Pictures: ${employee.firstName} ${employee.lastName}`}>
        <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
          {/* Basic & Role */}
          <div className="space-y-3">
            <h4 className="font-bold text-txt-primary text-sm border-b border-border pb-1">Basic Profile & Role</h4>
            <div>
              <label className="block font-semibold text-txt-primary mb-1">Profile Photo Avatar URL</label>
              <input
                type="text"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-txt-primary mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-txt-primary mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-txt-primary mb-1">Position Role</label>
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
              <div>
                <label className="block font-semibold text-txt-primary mb-1">Employee Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          {/* KYC Numbers & Picture URLs */}
          <div className="space-y-3 border-t border-border pt-3">
            <h4 className="font-bold text-txt-primary text-sm border-b border-border pb-1">KYC Records & Document Photo Uploads</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-txt-primary mb-1">Aadhaar Card Number</label>
                <input
                  type="text"
                  value={aadhaar}
                  onChange={e => setAadhaar(e.target.value)}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
                />
              </div>
              <div>
                <label className="block font-semibold text-txt-primary mb-1">PAN Card Number</label>
                <input
                  type="text"
                  value={pan}
                  onChange={e => setPan(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono uppercase text-txt-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-txt-primary mb-1">Aadhaar Card Front Photo URL / File</label>
              <input
                type="text"
                value={aadhaarFrontUrl}
                onChange={e => setAadhaarFrontUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-txt-primary mb-1">Aadhaar Card Back Photo URL / File</label>
              <input
                type="text"
                value={aadhaarBackUrl}
                onChange={e => setAadhaarBackUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>

            <div>
              <label className="block font-semibold text-txt-primary mb-1">PAN Card Photo URL / File</label>
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
                <label className="block font-semibold text-txt-primary mb-1">Police Clearance Status</label>
                <select
                  value={policeStatus}
                  onChange={e => setPoliceStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                >
                  <option value="VERIFIED">Verified</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-txt-primary mb-1">Clearance Doc No.</label>
                <input
                  type="text"
                  value={policeDocNo}
                  onChange={e => setPoliceDocNo(e.target.value)}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono text-txt-primary"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-txt-primary mb-1">Police Verification Document Photo URL</label>
              <input
                type="text"
                value={policeDocUrl}
                onChange={e => setPoliceDocUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" leftIcon={<Save className="w-4 h-4" />}>
              Save Profile & Photo Changes
            </Button>
          </div>
        </form>
      </Sheet>
    </motion.div>
  );
};
