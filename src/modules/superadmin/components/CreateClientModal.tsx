import React, { useState } from 'react';
import { X, Building2, User, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SuperAdminClient, PricingModel, BillingCycle } from '../types';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClient: (newClient: SuperAdminClient) => void;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onCreateClient
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [code, setCode] = useState('');
  const [taxId, setTaxId] = useState('');
  const [industry, setIndustry] = useState('Banking & Financial Services');
  const [billingAddress, setBillingAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Admin Details
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('WatchTower@2026');

  // Subscription Details
  const [planName, setPlanName] = useState('Standard Guard Suite');
  const [pricingModel, setPricingModel] = useState<PricingModel>('MONTHLY');
  const [unitRate, setUnitRate] = useState<number>(25000);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY');
  const [maxUsersAllowed, setMaxUsersAllowed] = useState<number>(100);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactEmail || !adminEmail) return;

    const generatedId = 'client-' + Date.now();
    const generatedCode = code || ('CL-' + companyName.substring(0, 4).toUpperCase());

    let estMonthly = unitRate;
    if (pricingModel === 'DAILY') estMonthly = unitRate * 30 * (maxUsersAllowed || 10);
    else if (pricingModel === 'PER_USER') estMonthly = unitRate * (maxUsersAllowed || 10);

    const newClient: SuperAdminClient = {
      id: generatedId,
      name: companyName,
      code: generatedCode,
      taxId: taxId || '27AAACX1234F1Z0',
      industry,
      billingAddress: billingAddress || 'Corporate Office Address',
      city,
      contactPerson: contactPerson || adminName || 'Chief Security Officer',
      contactPhone: contactPhone || adminPhone || '+91 98000 00000',
      contactEmail: contactEmail || adminEmail,
      logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      adminAccount: {
        adminId: 'adm-' + Date.now(),
        name: adminName || contactPerson || 'Admin User',
        email: adminEmail,
        phone: adminPhone || contactPhone || '+91 98000 00000',
        role: 'Client Security Admin',
        status: 'ACTIVE',
        lastLoginAt: 'Never',
        createdAt: new Date().toISOString().split('T')[0]
      },
      subscription: {
        planName,
        pricingModel,
        unitRate,
        billingCycle,
        monthlyEstimatedAmount: estMonthly,
        startDate,
        expiryDate,
        status: 'ACTIVE',
        maxUsersAllowed,
        activeUsersCount: 0,
        autoRenew: true
      },
      totalPaidToDate: 0,
      sitesCount: 0,
      employeesCount: 0
    };

    onCreateClient(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-bold text-txt-primary leading-tight">
              Create New Client & Admin Account
            </h3>
            <p className="text-xs text-txt-secondary mt-0.5">
              Step {step} of 3 — {step === 1 ? 'Company Profile' : step === 2 ? 'Admin User' : 'Subscription & Pricing'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-txt-secondary hover:text-txt-primary p-1 rounded-lg hover:bg-bg-surface-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-4 py-2 bg-bg-surface-2 rounded-xl border border-border/80 text-xs">
          <div className={`flex items-center gap-2 font-semibold ${step === 1 ? 'text-brand-primary' : 'text-txt-secondary'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-brand-primary text-white' : 'bg-border text-txt-secondary'}`}>1</span>
            Company Profile
          </div>
          <div className="h-[1px] w-8 bg-border" />
          <div className={`flex items-center gap-2 font-semibold ${step === 2 ? 'text-brand-primary' : 'text-txt-secondary'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-brand-primary text-white' : 'bg-border text-txt-secondary'}`}>2</span>
            Admin Account
          </div>
          <div className="h-[1px] w-8 bg-border" />
          <div className={`flex items-center gap-2 font-semibold ${step === 3 ? 'text-brand-primary' : 'text-txt-secondary'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-brand-primary text-white' : 'bg-border text-txt-secondary'}`}>3</span>
            Pricing & Plan
          </div>
        </div>

        {/* Form Body */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">
                  Company Name <span className="text-status-absent">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Tata Consultancy Services"
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">
                  Client Code (Optional)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CL-TCS"
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm font-mono text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Industry Sector</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <option value="Banking & Financial Services">Banking & Financial Services</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Healthcare & Hospitals">Healthcare & Hospitals</option>
                  <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
                  <option value="Real Estate & Retail">Real Estate & Retail</option>
                  <option value="Education & Campus">Education & Campus</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Tax ID / GST Number</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="e.g. 27AAACT1234F1Z0"
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm font-mono text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 98220 11223"
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Billing Address</label>
              <textarea
                rows={2}
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="Full official office & billing address"
                className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-600 rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                Next: Admin Account Setup &rarr;
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-4">
            <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs text-txt-secondary flex items-start gap-2">
              <User className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <span>
                Each client organization must have a primary Admin user account. This Admin will have full access to manage sites, shifts, guards, and rosters for their company.
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">
                  Admin Full Name <span className="text-status-absent">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">
                  Admin Email Address <span className="text-status-absent">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="e.g. admin@tcs.com"
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm font-mono text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Admin Contact Phone</label>
                <input
                  type="text"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Temporary Initial Password</label>
                <input
                  type="text"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm font-mono text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
                <p className="text-[11px] text-txt-secondary mt-1">Admin will be prompted to reset password upon first login.</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-txt-secondary hover:text-txt-primary bg-bg-surface-2 rounded-xl"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-600 rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                Next: Pricing & Subscription &rarr;
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Subscription Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Pricing Model Model</label>
                <select
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value as PricingModel)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <option value="DAILY">Daily-based (₹ / active guard / day)</option>
                  <option value="MONTHLY">Monthly-based (Flat monthly fee)</option>
                  <option value="PER_USER">Per-user-based (₹ / user / month)</option>
                  <option value="CUSTOM">Custom Enterprise Pricing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">
                  Unit Rate / Amount (₹)
                </label>
                <input
                  type="number"
                  value={unitRate}
                  onChange={(e) => setUnitRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Billing Cycle</label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <option value="DAILY">Daily</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="CUSTOM">Custom Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Max Authorized Users/Guards</label>
                <input
                  type="number"
                  value={maxUsersAllowed}
                  onChange={(e) => setMaxUsersAllowed(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Subscription Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Ready to Onboard Client
              </div>
              <p className="text-txt-secondary">
                Client <span className="font-bold text-txt-primary">{companyName || 'New Client'}</span> will be activated with plan <span className="font-bold text-txt-primary">{planName}</span> ({pricingModel}). Admin account for <span className="font-bold text-txt-primary">{adminEmail || 'Admin'}</span> will be created instantly.
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-txt-secondary hover:text-txt-primary bg-bg-surface-2 rounded-xl"
              >
                &larr; Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Create Client & Activate Subscription
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
