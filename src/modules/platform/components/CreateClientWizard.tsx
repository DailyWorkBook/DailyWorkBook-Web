import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, Building2, CheckCircle2, CreditCard, Layers, UserRound } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { LoadingState } from '../../../components/feedback/States';
import { queryKeys } from '../../../core/query';
import { catalogApi, platformApi, type BillingQuote, type ClientDetail } from '../../../services';
import { describeApiError } from '../../../hooks/useApiErrorMessage';
import { useDebounced } from '../../../hooks';

/**
 * Client onboarding.
 *
 * The module list and every price come from the catalogue API, and the running
 * total is quoted by the same billing engine that will price the subscription —
 * so what the operator is shown here is exactly what gets stored.
 */

interface Props {
  onClose: () => void;
  onCreated: (client: ClientDetail) => void;
}

const PRICING_MODELS = [
  { value: 'MONTHLY', label: 'Flat monthly fee per module' },
  { value: 'PER_USER', label: 'Per user, per month' },
  { value: 'DAILY', label: 'Per user, per day' },
  { value: 'CUSTOM', label: 'Negotiated amount' },
];

const BILLING_CYCLES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half-yearly' },
  { value: 'ANNUAL', label: 'Annual' },
];

const todayIso = () => new Date().toISOString().slice(0, 10);
const inOneYear = () => {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

const money = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);

export const CreateClientWizard: React.FC<Props> = ({ onClose, onCreated }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [taxId, setTaxId] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [moduleCodes, setModuleCodes] = useState<string[]>([]);
  const [planName, setPlanName] = useState('');
  const [pricingModel, setPricingModel] = useState('MONTHLY');
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const [maxUsers, setMaxUsers] = useState('50');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [customAmount, setCustomAmount] = useState('');
  const [startDate, setStartDate] = useState(todayIso());
  const [expiryDate, setExpiryDate] = useState(inOneYear());

  const catalog = useQuery({
    queryKey: queryKeys.catalogModules,
    queryFn: () => catalogApi.modules(),
    staleTime: 5 * 60_000,
  });

  // Mandatory modules are always part of the plan and cannot be unticked. They
  // are seeded once, during render, as soon as the catalogue arrives.
  const [hasSeededModules, setHasSeededModules] = useState(false);
  if (catalog.data && !hasSeededModules) {
    setHasSeededModules(true);
    setModuleCodes(catalog.data.filter((module) => module.isMandatory).map((module) => module.code));
  }

  const sellable = useMemo(() => (catalog.data ?? []).filter((module) => !module.isMandatory), [catalog.data]);
  const mandatory = useMemo(() => (catalog.data ?? []).filter((module) => module.isMandatory), [catalog.data]);

  const quoteInput = {
    moduleCodes,
    pricingModel,
    billingCycle,
    maxUsers: Number(maxUsers) || 1,
    discountPercent: Number(discountPercent) || 0,
    customAmount: pricingModel === 'CUSTOM' ? Number(customAmount) || 0 : null,
  };
  const debouncedQuoteInput = useDebounced(JSON.stringify(quoteInput), 400);

  // The preview is priced by the server, not recomputed in the browser, so it
  // cannot drift from what will actually be stored.
  const quote = useQuery<BillingQuote>({
    queryKey: ['platform', 'quote', debouncedQuoteInput],
    queryFn: () => platformApi.quote(JSON.parse(debouncedQuoteInput)),
    enabled:
      step >= 3 &&
      moduleCodes.length > 0 &&
      (pricingModel !== 'CUSTOM' || Number(customAmount) > 0),
    retry: false,
  });

  const create = useMutation({
    mutationFn: () =>
      platformApi.createClient({
        name,
        industry: industry || undefined,
        taxId: taxId || undefined,
        billingAddress,
        city,
        state: stateName || undefined,
        postalCode: postalCode || undefined,
        contactPerson,
        contactEmail,
        contactPhone,
        adminName,
        adminEmail,
        adminPhone: adminPhone || undefined,
        adminPassword,
        moduleCodes,
        subscription: {
          planName,
          pricingModel,
          billingCycle,
          maxUsers: Number(maxUsers),
          discountPercent: Number(discountPercent),
          customAmount: pricingModel === 'CUSTOM' ? Number(customAmount) : undefined,
          startDate,
          expiryDate,
          autoRenew: true,
        },
      }),
    onSuccess: onCreated,
    onError: (caught) => setError(describeApiError(caught)),
  });

  const toggleModule = (code: string) => {
    setModuleCodes((current) =>
      current.includes(code) ? current.filter((value) => value !== code) : [...current, code],
    );
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (adminPassword !== confirmPassword) {
      setError('The administrator passwords do not match.');
      setStep(2);
      return;
    }
    if (moduleCodes.length === 0) {
      setError('Assign at least one module.');
      setStep(3);
      return;
    }
    create.mutate();
  };

  const fieldClass =
    'w-full px-3 py-2 min-h-[38px] bg-bg-surface-2 border border-border rounded-xl text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40';

  const steps = [
    { number: 1 as const, label: 'Company', icon: Building2 },
    { number: 2 as const, label: 'Administrator', icon: UserRound },
    { number: 3 as const, label: 'Modules', icon: Layers },
    { number: 4 as const, label: 'Billing', icon: CreditCard },
  ];

  const priceFor = (module: { pricing: { monthly: number; perUser: number; daily: number } }) => {
    if (pricingModel === 'PER_USER') return `${money(module.pricing.perUser)} / user / mo`;
    if (pricingModel === 'DAILY') return `${money(module.pricing.daily)} / user / day`;
    return `${money(module.pricing.monthly)} / mo`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-bg-surface border border-border rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-txt-primary">Create a client</h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            Step {step} of 4 — {steps[step - 1].label}
          </p>
        </div>

        <div className="flex items-center justify-between px-3 py-2 bg-bg-surface-2 rounded-xl border border-border/80 text-xs overflow-x-auto">
          {steps.map((entry, index) => (
            <React.Fragment key={entry.number}>
              <button
                type="button"
                onClick={() => setStep(entry.number)}
                className={`flex items-center gap-2 font-semibold whitespace-nowrap ${
                  step === entry.number ? 'text-brand-primary' : 'text-txt-secondary'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                    step === entry.number ? 'bg-brand-primary text-white' : 'bg-border text-txt-secondary'
                  }`}
                >
                  {entry.number}
                </span>
                <span className="hidden sm:inline">{entry.label}</span>
              </button>
              {index < steps.length - 1 && <span className="h-px w-4 sm:w-8 bg-border flex-shrink-0" aria-hidden />}
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
                <label className="block sm:col-span-2">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Company name <span className="text-status-absent">*</span>
                  </span>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Industry</span>
                  <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Facility security" className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Tax / GST number</span>
                  <input value={taxId} onChange={(e) => setTaxId(e.target.value.toUpperCase())} className={`${fieldClass} font-mono`} />
                </label>
              </div>

              <label className="block">
                <span className="block text-xs font-bold text-txt-secondary mb-1">
                  Billing address <span className="text-status-absent">*</span>
                </span>
                <input required value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} className={fieldClass} />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    City <span className="text-status-absent">*</span>
                  </span>
                  <input required value={city} onChange={(e) => setCity(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">State</span>
                  <input value={stateName} onChange={(e) => setStateName(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Postal code</span>
                  <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={fieldClass} />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/60">
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Billing contact <span className="text-status-absent">*</span>
                  </span>
                  <input required value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Contact email <span className="text-status-absent">*</span>
                  </span>
                  <input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Contact phone <span className="text-status-absent">*</span>
                  </span>
                  <input required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={fieldClass} />
                </label>
              </div>

              <div className="flex justify-end pt-3 border-t border-border">
                <Button type="button" onClick={() => setStep(2)}>
                  Next: administrator
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-txt-secondary bg-bg-surface-2 border border-border rounded-xl p-3 leading-relaxed">
                This is the first person who can sign into the client's workspace. They start with full access to every
                module you assign, and will be asked to replace this password on first sign-in.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Full name <span className="text-status-absent">*</span>
                  </span>
                  <input required value={adminName} onChange={(e) => setAdminName(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Email <span className="text-status-absent">*</span>
                  </span>
                  <input required type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className={`${fieldClass} font-mono`} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Phone</span>
                  <input value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} className={fieldClass} />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Password <span className="text-status-absent">*</span>
                  </span>
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className={fieldClass}
                  />
                  <span className="block text-[11px] text-txt-tertiary mt-1 leading-relaxed">
                    At least 10 characters with an uppercase letter, a lowercase letter, a digit and a symbol. No default
                    is ever assigned.
                  </span>
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Confirm password <span className="text-status-absent">*</span>
                  </span>
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="flex justify-between pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(3)}>
                  Next: modules
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {catalog.isLoading ? (
                <LoadingState label="Loading the module catalogue…" />
              ) : (
                <>
                  {mandatory.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-txt-secondary">Always included</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mandatory.map((module) => (
                          <div key={module.code} className="p-3 rounded-xl border border-border bg-bg-surface-2 text-xs">
                            <div className="font-bold text-txt-primary">{module.name}</div>
                            <div className="text-[11px] text-txt-secondary mt-0.5">{module.description}</div>
                            <div className="text-[10px] font-mono text-brand-teal mt-1">Included at no charge</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-txt-secondary">
                      Sellable modules ({moduleCodes.filter((code) => sellable.some((m) => m.code === code)).length} selected)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {sellable.map((module) => {
                        const isSelected = moduleCodes.includes(module.code);
                        return (
                          <button
                            key={module.code}
                            type="button"
                            onClick={() => toggleModule(module.code)}
                            aria-pressed={isSelected}
                            className={`text-left p-3 rounded-xl border text-xs transition-colors ${
                              isSelected
                                ? 'border-brand-primary bg-brand-primary/10'
                                : 'border-border bg-bg-surface hover:border-brand-primary/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className={`font-bold ${isSelected ? 'text-brand-primary' : 'text-txt-primary'}`}>
                                  {module.name}
                                </div>
                                <div className="text-[11px] text-txt-secondary mt-0.5 leading-relaxed">
                                  {module.description}
                                </div>
                                <div className="text-[10px] font-mono text-txt-secondary mt-1">{priceFor(module)}</div>
                              </div>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" aria-hidden />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="button" onClick={() => setStep(4)} disabled={moduleCodes.length === 0}>
                  Next: billing
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">
                    Plan name <span className="text-status-absent">*</span>
                  </span>
                  <input required value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="Standard plan" className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Pricing model</span>
                  <select value={pricingModel} onChange={(e) => setPricingModel(e.target.value)} className={fieldClass}>
                    {PRICING_MODELS.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Billing cycle</span>
                  <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className={fieldClass}>
                    {BILLING_CYCLES.map((cycle) => (
                      <option key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">User allowance</span>
                  <input type="number" min={1} value={maxUsers} onChange={(e) => setMaxUsers(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Discount (%)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className={fieldClass}
                  />
                </label>
                {pricingModel === 'CUSTOM' && (
                  <label className="block">
                    <span className="block text-xs font-bold text-txt-secondary mb-1">
                      Negotiated monthly amount <span className="text-status-absent">*</span>
                    </span>
                    <input
                      required
                      type="number"
                      min={1}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className={fieldClass}
                    />
                  </label>
                )}
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Start date</span>
                  <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={fieldClass} />
                </label>
                <label className="block">
                  <span className="block text-xs font-bold text-txt-secondary mb-1">Expiry date</span>
                  <input required type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={fieldClass} />
                </label>
              </div>

              <div className="p-4 rounded-xl border border-border bg-bg-surface-2 space-y-2">
                <h3 className="text-xs font-bold text-txt-primary">Quote</h3>

                {quote.isLoading ? (
                  <p className="text-xs text-txt-secondary">Pricing this plan…</p>
                ) : quote.isError ? (
                  <p className="text-xs text-status-absent">{describeApiError(quote.error)}</p>
                ) : quote.data ? (
                  <>
                    <ul className="space-y-1 text-[11px]">
                      {quote.data.lines.map((line) => (
                        <li key={line.moduleCode} className="flex items-center justify-between gap-3">
                          <span className="text-txt-secondary min-w-0">
                            <span className="text-txt-primary font-semibold">{line.moduleName}</span>
                            <span className="block text-[10px] opacity-80">{line.basis}</span>
                          </span>
                          <span className="font-bold text-txt-primary tabular-nums flex-shrink-0">{money(line.amount)}</span>
                        </li>
                      ))}
                    </ul>

                    <dl className="pt-2 border-t border-border space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <dt className="text-txt-secondary">Subtotal</dt>
                        <dd className="tabular-nums text-txt-primary">{money(quote.data.subtotalAmount)}</dd>
                      </div>
                      {quote.data.discountAmount > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-txt-secondary">Discount</dt>
                          <dd className="tabular-nums text-brand-teal">−{money(quote.data.discountAmount)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-txt-secondary">Tax</dt>
                        <dd className="tabular-nums text-txt-primary">{money(quote.data.taxAmount)}</dd>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-border">
                        <dt className="font-bold text-txt-primary">Monthly</dt>
                        <dd className="tabular-nums font-black text-brand-primary">{money(quote.data.monthlyAmount)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-txt-secondary">
                          Billed every {quote.data.cycleMonths} month{quote.data.cycleMonths === 1 ? '' : 's'}
                        </dt>
                        <dd className="tabular-nums font-bold text-txt-primary">{money(quote.data.cycleAmount)}</dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <p className="text-xs text-txt-secondary">Select modules to see the price.</p>
                )}
              </div>

              <div className="flex justify-between pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setStep(3)} disabled={create.isPending}>
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={create.isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={create.isPending}>
                    Create client
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
