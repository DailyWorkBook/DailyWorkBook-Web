import React, { useState } from 'react';
import { X, User, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { PricingModel, BillingCycle } from '../types';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClient: (clientData: any) => Promise<void>;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onCreateClient
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [code, setCode] = useState('');
  const [taxId, setTaxId] = useState('');
  const [industry, setIndustry] = useState('Banking & Financial Services');
  const [billingAddress, setBillingAddress] = useState('Corporate Headquarters, BKC Complex');
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
    setErrorMsg('');
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!companyName) {
      setErrorMsg('Company Name is required');
      setStep(1);
      return;
    }

    if (!adminEmail || !adminName) {
      setErrorMsg('Admin Name and Email are required');
      setStep(2);
      return;
    }

    const payload = {
      name: companyName,
      code: code || undefined,
      taxId: taxId || undefined,
      industry: industry || 'Banking & Financial Services',
      billingAddress: billingAddress || 'Corporate Headquarters, BKC Complex',
      city: city || 'Mumbai',
      contactPerson: contactPerson || adminName || 'Chief Security Officer',
      contactPhone: contactPhone || adminPhone || '+91 98000 00000',
      contactEmail: contactEmail || adminEmail,
      adminName: adminName || contactPerson || 'Admin User',
      adminEmail: adminEmail,
      adminPhone: adminPhone || contactPhone || '+91 98000 00000',
      adminPassword: adminPassword || 'WatchTower@2026',
      planName: planName || 'Standard Guard Suite',
      pricingModel: pricingModel || 'MONTHLY',
      unitRate: Number(unitRate) || 25000,
      billingCycle: billingCycle || 'MONTHLY',
      maxUsersAllowed: Number(maxUsersAllowed) || 100,
      startDate: startDate || new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || '2027-12-31'
    };

    try {
      setIsSubmitting(true);
      await onCreateClient(payload);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to create client organization');
    }
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

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

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
                <label className="block text-xs font-bold text-txt-primary mb-1">Initial Password</label>
                <input
                  type="text"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-sm font-mono text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                />
                <p className="text-[11px] text-txt-secondary mt-1">Admin will use this password to log in.</p>
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
                <label className="block text-xs font-bold text-txt-primary mb-1">Pricing Model</label>
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
                disabled={isSubmitting}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Onboarding Client...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Create Client & Activate Subscription
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
