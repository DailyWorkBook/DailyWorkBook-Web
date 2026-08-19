import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Building2, CreditCard, IdCard, UserRound } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { employeesApi, type EmployeeDetail, type Role, type Site } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';

/**
 * Employee onboarding, in the four parts the business actually thinks in:
 * who they are, how to reach them, what they do, and the records payroll needs.
 *
 * KYC and bank details are optional here — they are often collected after the
 * person starts — but the fields exist so the workflow does not have to leave
 * the screen to complete them.
 */

interface Props {
  roles: Role[];
  sites: Site[];
  onClose: () => void;
  onSaved: (employee: EmployeeDetail) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const EmployeeFormDialog: React.FC<Props> = ({ roles, sites, onClose, onSaved }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('UNDISCLOSED');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [emergencyContactName, setEmergencyName] = useState('');
  const [emergencyContactPhone, setEmergencyPhone] = useState('');

  const [roleId, setRoleId] = useState(roles[0]?.id ?? '');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [dateOfJoining, setDateOfJoining] = useState(today());
  const [monthlySalary, setMonthlySalary] = useState('');
  const [overtimeHourlyRate, setOvertimeRate] = useState('');
  const [currentSiteId, setCurrentSiteId] = useState('');
  const [currentPostId, setCurrentPostId] = useState('');

  const [aadhaarNumber, setAadhaar] = useState('');
  const [panNumber, setPan] = useState('');
  const [policeVerified, setPoliceVerified] = useState(false);
  const [accountHolderName, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfsc] = useState('');
  const [branchName, setBranchName] = useState('');

  const selectedSite = sites.find((site) => site.id === currentSiteId);
  const availablePosts = (selectedSite?.posts ?? []) as { id: string; name: string }[];

  const save = useMutation({
    mutationFn: () => {
      const kycProvided = aadhaarNumber || panNumber || policeVerified;
      const bankProvided = accountNumber && ifscCode && bankName && accountHolderName;

      return employeesApi.create({
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || undefined,
        gender,
        phone,
        email: email || undefined,
        addressLine: addressLine || undefined,
        city: city || undefined,
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactPhone: emergencyContactPhone || undefined,
        roleId,
        designation,
        department,
        employmentType,
        dateOfJoining,
        monthlySalary: monthlySalary ? Number(monthlySalary) : 0,
        overtimeHourlyRate: overtimeHourlyRate ? Number(overtimeHourlyRate) : 0,
        currentSiteId: currentSiteId || undefined,
        currentPostId: currentPostId || undefined,
        ...(kycProvided
          ? {
              kyc: {
                aadhaarNumber: aadhaarNumber || undefined,
                panNumber: panNumber || undefined,
                policeVerified,
                status: 'SUBMITTED',
              },
            }
          : {}),
        ...(bankProvided
          ? {
              bankAccount: {
                accountHolderName,
                bankName,
                accountNumber,
                ifscCode,
                branchName: branchName || undefined,
                accountType: 'SAVINGS',
              },
            }
          : {}),
      });
    },
    onSuccess: onSaved,
    onError: (caught) => setError(describeApiError(caught)),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!roleId) {
      setError('Select the role this employee will hold.');
      setStep(2);
      return;
    }
    save.mutate();
  };

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  const steps = [
    { number: 1 as const, label: 'Personal', icon: UserRound },
    { number: 2 as const, label: 'Employment', icon: Building2 },
    { number: 3 as const, label: 'KYC & bank', icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">Onboard an employee</h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            Step {step} of 3 — {steps[step - 1].label}
          </p>
        </div>

        <div className="flex items-center justify-between px-3 py-2 bg-bg-surface-2 rounded-xl border border-border/80 text-xs">
          {steps.map((entry, index) => (
            <React.Fragment key={entry.number}>
              <button
                type="button"
                onClick={() => setStep(entry.number)}
                className={`flex items-center gap-2 font-semibold ${step === entry.number ? 'text-brand-primary' : 'text-txt-secondary'}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    step === entry.number ? 'bg-brand-primary text-white' : 'bg-border text-txt-secondary'
                  }`}
                >
                  {entry.number}
                </span>
                <span className="hidden sm:inline">{entry.label}</span>
              </button>
              {index < steps.length - 1 && <span className="h-px w-6 bg-border" aria-hidden />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-status-absent/10 border border-status-absent/25 text-status-absent text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    First name <span className="text-status-absent">*</span>
                  </span>
                  <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Last name <span className="text-status-absent">*</span>
                  </span>
                  <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Date of birth</span>
                  <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Gender</span>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className={fieldClass}>
                    <option value="UNDISCLOSED">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Phone <span className="text-status-absent">*</span>
                  </span>
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
                </label>
              </div>

              <label className="block">
                <span className="block text-xs font-bold text-txt-secondary mb-1">Address</span>
                <input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className={fieldClass} />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">City</span>
                  <input value={city} onChange={(e) => setCity(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Emergency contact</span>
                  <input value={emergencyContactName} onChange={(e) => setEmergencyName(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Emergency phone</span>
                  <input value={emergencyContactPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className={fieldClass} />
                </label>
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <Button type="button" onClick={() => setStep(2)}>
                  Next: employment
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Role <span className="text-status-absent">*</span>
                  </span>
                  <select required value={roleId} onChange={(e) => setRoleId(e.target.value)} className={fieldClass}>
                    <option value="">Select a role…</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} ({role.code})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Designation <span className="text-status-absent">*</span>
                  </span>
                  <input required value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Security Officer" className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Department <span className="text-status-absent">*</span>
                  </span>
                  <input required value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Field Operations" className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Employment type</span>
                  <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={fieldClass}>
                    <option value="FULL_TIME">Full time</option>
                    <option value="PART_TIME">Part time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="TEMPORARY">Temporary</option>
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Joining date <span className="text-status-absent">*</span>
                  </span>
                  <input type="date" required value={dateOfJoining} onChange={(e) => setDateOfJoining(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Monthly salary</span>
                  <input
                    type="number"
                    min={0}
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    placeholder="0"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Overtime rate / hour</span>
                  <input
                    type="number"
                    min={0}
                    value={overtimeHourlyRate}
                    onChange={(e) => setOvertimeRate(e.target.value)}
                    placeholder="0"
                    className={fieldClass}
                  />
                </label>
              </div>

              {sites.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
                  <label className="block">
                    <span className="block text-xs font-bold text-txt-secondary mb-1">Deploy to site</span>
                    <select
                      value={currentSiteId}
                      onChange={(e) => {
                        setCurrentSiteId(e.target.value);
                        setCurrentPostId('');
                      }}
                      className={fieldClass}
                    >
                      <option value="">Not deployed yet</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs font-bold text-txt-secondary mb-1">Post</span>
                    <select
                      value={currentPostId}
                      onChange={(e) => setCurrentPostId(e.target.value)}
                      disabled={!currentSiteId || availablePosts.length === 0}
                      className={`${fieldClass} disabled:opacity-50`}
                    >
                      <option value="">
                        {!currentSiteId
                          ? 'Select a site first'
                          : availablePosts.length === 0
                            ? 'This site has no posts yet'
                            : 'No post assigned'}
                      </option>
                      {availablePosts.map((post) => (
                        <option key={post.id} value={post.id}>
                          {post.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(3)}>
                  Next: KYC & bank
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-txt-secondary bg-bg-surface-2 border border-border rounded-xl p-3 leading-relaxed">
                These records can be added now or later from the employee's profile. Leave them blank to skip.
              </p>

              <fieldset className="space-y-3">
                <legend className="text-xs font-bold text-txt-primary flex items-center gap-1.5 mb-1">
                  <IdCard className="w-4 h-4 text-brand-primary" aria-hidden /> Identity documents
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-semibold text-txt-secondary mb-1">Aadhaar number</span>
                    <input
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaar(e.target.value)}
                      placeholder="12 digits"
                      inputMode="numeric"
                      className={`${fieldClass} font-mono`}
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-txt-secondary mb-1">PAN</span>
                    <input
                      value={panNumber}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className={`${fieldClass} font-mono`}
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2 text-xs text-txt-secondary">
                  <input type="checkbox" checked={policeVerified} onChange={(e) => setPoliceVerified(e.target.checked)} />
                  Police verification completed
                </label>
              </fieldset>

              <fieldset className="space-y-3 pt-3 border-t border-border/60">
                <legend className="text-xs font-bold text-txt-primary flex items-center gap-1.5 mb-1">
                  <CreditCard className="w-4 h-4 text-brand-primary" aria-hidden /> Salary account
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-semibold text-txt-secondary mb-1">Account holder</span>
                    <input value={accountHolderName} onChange={(e) => setAccountHolder(e.target.value)} className={fieldClass} />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-txt-secondary mb-1">Bank</span>
                    <input value={bankName} onChange={(e) => setBankName(e.target.value)} className={fieldClass} />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-txt-secondary mb-1">Account number</span>
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      inputMode="numeric"
                      className={`${fieldClass} font-mono`}
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-semibold text-txt-secondary mb-1">IFSC</span>
                    <input
                      value={ifscCode}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      placeholder="HDFC0000240"
                      className={`${fieldClass} font-mono`}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="block text-xs font-semibold text-txt-secondary mb-1">Branch</span>
                    <input value={branchName} onChange={(e) => setBranchName(e.target.value)} className={fieldClass} />
                  </label>
                </div>
              </fieldset>

              <div className="flex justify-between pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={save.isPending}>
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={save.isPending}>
                    Onboard employee
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
