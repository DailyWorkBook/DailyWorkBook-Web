import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Plus, Search, MapPin, Users, Phone, Mail, Calendar, ExternalLink, ShieldCheck, DollarSign, Edit3, CheckCircle2, TrendingUp, Briefcase } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Sheet } from '../../../components/ui/Sheet';
import { INITIAL_CLIENTS, Client } from '../../../mockData/clients';
import confetti from 'canvas-confetti';

export const ClientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Client Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [industry, setIndustry] = useState('Banking & Financial Services');
  const [logoUrl, setLogoUrl] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [city, setCity] = useState('Pune');
  const [contractStartDate, setContractStartDate] = useState('2026-01-01');
  const [contractEndDate, setContractEndDate] = useState('2028-12-31');
  const [contractStatus, setContractStatus] = useState<Client['contractStatus']>('ACTIVE');
  const [monthlyBillingAmount, setMonthlyBillingAmount] = useState(1500000);

  // Payroll Config State
  const [baseDailyWage, setBaseDailyWage] = useState(750);
  const [overtimeRate, setOvertimeRate] = useState(120);
  const [nightAllowance, setNightAllowance] = useState(150);
  const [pfDeduction, setPfDeduction] = useState(12);
  const [esiDeduction, setEsiDeduction] = useState(0.75);
  const [bonusAllowance, setBonusAllowance] = useState(500);
  const [uniformDeduction, setUniformDeduction] = useState(200);

  const totalBilling = clients.reduce((acc, c) => acc + c.monthlyBillingAmount, 0);
  const totalClientSites = clients.reduce((acc, c) => acc + c.sitesCount, 0);
  const totalClientGuards = clients.reduce((acc, c) => acc + c.guardsCount, 0);

  const openCreateModal = () => {
    setEditingClient(null);
    setName('');
    setCode('');
    setIndustry('Banking & Financial Services');
    setLogoUrl('https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=150');
    setContactPerson('');
    setContactEmail('');
    setContactPhone('');
    setBillingAddress('');
    setCity('Pune');
    setContractStartDate('2026-01-01');
    setContractEndDate('2028-12-31');
    setContractStatus('ACTIVE');
    setMonthlyBillingAmount(1500000);
    setBaseDailyWage(750);
    setOvertimeRate(120);
    setNightAllowance(150);
    setPfDeduction(12);
    setEsiDeduction(0.75);
    setBonusAllowance(500);
    setUniformDeduction(200);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCode(client.code);
    setIndustry(client.industry);
    setLogoUrl(client.logoUrl);
    setContactPerson(client.contactPerson);
    setContactEmail(client.contactEmail);
    setContactPhone(client.contactPhone);
    setBillingAddress(client.billingAddress);
    setCity(client.city);
    setContractStartDate(client.contractStartDate);
    setContractEndDate(client.contractEndDate);
    setContractStatus(client.contractStatus);
    setMonthlyBillingAmount(client.monthlyBillingAmount);
    setBaseDailyWage(client.payrollConfig.baseDailyWage);
    setOvertimeRate(client.payrollConfig.overtimeRatePerHour);
    setNightAllowance(client.payrollConfig.nightShiftAllowancePerShift);
    setPfDeduction(client.payrollConfig.pfDeductionPercentage);
    setEsiDeduction(client.payrollConfig.esiDeductionPercentage);
    setBonusAllowance(client.payrollConfig.bonusAllowanceMonthly);
    setUniformDeduction(client.payrollConfig.uniformDeductionMonthly);
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const payload: Client = {
      id: editingClient ? editingClient.id : `client-${Date.now()}`,
      name,
      code: code || `CL-${name.substring(0, 4).toUpperCase()}`,
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=150',
      industry,
      contractStartDate,
      contractEndDate,
      contractStatus,
      contactPerson: contactPerson || 'Operations Manager',
      contactEmail: contactEmail || 'contact@client.com',
      contactPhone: contactPhone || '+91 98000 11223',
      billingAddress: billingAddress || 'Corporate Office',
      city,
      sitesCount: editingClient ? editingClient.sitesCount : 1,
      guardsCount: editingClient ? editingClient.guardsCount : 15,
      monthlyBillingAmount: Number(monthlyBillingAmount),
      payrollConfig: {
        baseDailyWage: Number(baseDailyWage),
        overtimeRatePerHour: Number(overtimeRate),
        nightShiftAllowancePerShift: Number(nightAllowance),
        pfDeductionPercentage: Number(pfDeduction),
        esiDeductionPercentage: Number(esiDeduction),
        bonusAllowanceMonthly: Number(bonusAllowance),
        uniformDeductionMonthly: Number(uniformDeduction)
      }
    };

    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? payload : c));
      setToastMsg(`Updated client "${name}" successfully!`);
    } else {
      setClients(prev => [payload, ...prev]);
      setToastMsg(`Onboarded new client "${name}" successfully!`);
      confetti({ particleCount: 50, spread: 60 });
    }

    setIsModalOpen(false);
    setTimeout(() => setToastMsg(null), 3000);
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
              Corporate Accounts & Contract Management
            </span>
          </div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">Corporate Clients Directory</h1>
          <p className="text-xs text-txt-secondary mt-1">Manage corporate client portfolios, contracts, billing accounts, and client-specific payroll structures</p>
        </div>

        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Onboard Corporate Client
        </Button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-brand-teal-050 border border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Corporate Accounts</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">{clients.length} Clients</div>
            <span className="text-[11px] text-txt-secondary">100% Active Contracts</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Monthly Portfolio Revenue</span>
            <div className="text-2xl font-extrabold text-brand-teal tracking-tight mt-0.5 tabular-nums">
              ₹{(totalBilling / 100000).toFixed(1)} Lakhs
            </div>
            <span className="text-[11px] text-txt-secondary">Total Monthly Billing</span>
          </div>
          <div className="p-3 bg-brand-teal-050 text-brand-teal rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Contracted Site Campuses</span>
            <div className="text-2xl font-extrabold text-txt-primary tracking-tight mt-0.5 tabular-nums">{totalClientSites} Sites</div>
            <span className="text-[11px] text-txt-secondary">Across 4 Sectors</span>
          </div>
          <div className="p-3 bg-bg-surface-2 text-txt-primary rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="wt-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-tertiary block font-medium">Deployed Security Staff</span>
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight mt-0.5 tabular-nums">{totalClientGuards} Guards</div>
            <span className="text-[11px] text-txt-secondary">Assigned & Roster Active</span>
          </div>
          <div className="p-3 bg-brand-primary-050 text-brand-primary rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="wt-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
          <input
            type="text"
            placeholder="Search by client name, code, or city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-surface-2 border border-border rounded-btn text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>

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

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClients.map(c => (
            <div key={c.id} className="wt-card wt-card-interactive p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={c.logoUrl} alt={c.name} className="w-12 h-12 rounded-2xl object-cover border border-border shadow-sm ring-2 ring-brand-primary/10" />
                    <div>
                      <h3 className="text-base font-bold text-txt-primary flex items-center gap-2">
                        <Link to={`/clients/${c.id}`} className="hover:text-brand-primary transition-colors">
                          {c.name}
                        </Link>
                      </h3>
                      <span className="font-mono text-xs font-semibold text-brand-primary px-2 py-0.5 rounded bg-brand-primary-050 border border-brand-primary/20">
                        {c.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge status={c.contractStatus} />
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-txt-secondary hover:text-brand-primary hover:bg-bg-surface-2 rounded-lg transition-colors"
                      title="Edit Client Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-txt-tertiary block text-[11px]">Industry Sector</span>
                    <span className="font-semibold text-txt-primary">{c.industry}</span>
                  </div>
                  <div>
                    <span className="text-txt-tertiary block text-[11px]">City / Location</span>
                    <span className="font-semibold text-txt-primary">{c.city}</span>
                  </div>
                  <div>
                    <span className="text-txt-tertiary block text-[11px]">Active Sites</span>
                    <span className="font-extrabold text-brand-primary text-sm tabular-nums">{c.sitesCount} Sites</span>
                  </div>
                  <div>
                    <span className="text-txt-tertiary block text-[11px]">Deployed Guards</span>
                    <span className="font-extrabold text-brand-teal text-sm tabular-nums">{c.guardsCount} Guards</span>
                  </div>
                </div>

                <div className="mt-3 p-3.5 bg-bg-surface-2 rounded-xl border border-border text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-txt-secondary">
                    <span className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-txt-tertiary" />
                      <span>{c.contactPerson}</span>
                    </span>
                    <span className="font-mono text-txt-tertiary text-[11px]">{c.contactPhone}</span>
                  </div>
                  <div className="flex items-center justify-between text-txt-secondary pt-1 border-t border-border/60">
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Monthly Billing</span>
                    </span>
                    <strong className="text-txt-primary font-bold text-sm">₹{(c.monthlyBillingAmount / 100000).toFixed(2)} Lakhs</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-txt-tertiary">Daily Wage: <strong className="text-txt-primary font-bold">₹{c.payrollConfig.baseDailyWage}/day</strong></span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => openEditModal(c)}>
                    Edit Client
                  </Button>
                  <Button size="sm" variant="primary" rightIcon={<ExternalLink className="w-3.5 h-3.5" />} onClick={() => navigate(`/clients/${c.id}`)}>
                    Manage Sites & Posts
                  </Button>
                </div>
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
                  <th>CLIENT NAME & CODE</th>
                  <th>INDUSTRY SECTOR</th>
                  <th>SITES / POSTS</th>
                  <th>DEPLOYED GUARDS</th>
                  <th>DAILY WAGE BASE</th>
                  <th>MONTHLY BILLING</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={c.logoUrl} alt={c.name} className="w-9 h-9 rounded-xl object-cover border border-border" />
                        <div>
                          <Link to={`/clients/${c.id}`} className="font-bold text-xs text-txt-primary hover:text-brand-primary">
                            {c.name}
                          </Link>
                          <div className="font-mono text-[11px] text-brand-primary">{c.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-txt-secondary">{c.industry}</td>
                    <td className="font-bold text-brand-primary tabular-nums">{c.sitesCount} Sites</td>
                    <td className="font-bold text-brand-teal tabular-nums">{c.guardsCount} Guards</td>
                    <td className="font-semibold text-txt-primary tabular-nums">₹{c.payrollConfig.baseDailyWage}/day</td>
                    <td className="font-bold text-txt-primary tabular-nums">₹{(c.monthlyBillingAmount / 100000).toFixed(2)}L</td>
                    <td><Badge status={c.contractStatus} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => openEditModal(c)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/clients/${c.id}`)}>
                          Manage
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Field Create / Edit Client Drawer */}
      <Sheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? `Edit Corporate Client: ${editingClient.name}` : 'Onboard Corporate Client'}
      >
        <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-txt-primary mb-1">Company / Organization Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Tata Motors Limited"
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Company Logo Picture URL / File</label>
            <input
              type="text"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Client Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="CL-TATA"
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">Industry Sector</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              >
                <option value="Banking & Financial Services">Banking & Financial Services</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Healthcare & Hospitals">Healthcare & Hospitals</option>
                <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                <option value="Commercial Real Estate">Commercial Real Estate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Contact Person & Designation</label>
            <input
              type="text"
              value={contactPerson}
              onChange={e => setContactPerson(e.target.value)}
              placeholder="e.g. Anand Shinde (Chief Security Officer)"
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="security@tata.com"
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+91 98220 12345"
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Billing Address & City</label>
              <input
                type="text"
                value={billingAddress}
                onChange={e => setBillingAddress(e.target.value)}
                placeholder="Official billing address"
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-txt-primary mb-1">Contract Start Date</label>
              <input
                type="date"
                value={contractStartDate}
                onChange={e => setContractStartDate(e.target.value)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">Contract End Date</label>
              <input
                type="date"
                value={contractEndDate}
                onChange={e => setContractEndDate(e.target.value)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-txt-primary mb-1">Contract Status</label>
              <select
                value={contractStatus}
                onChange={e => setContractStatus(e.target.value as any)}
                className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
              >
                <option value="ACTIVE">Active</option>
                <option value="PENDING_RENEWAL">Pending Renewal</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-txt-primary mb-1">Estimated Monthly Billing (₹)</label>
            <input
              type="number"
              value={monthlyBillingAmount}
              onChange={e => setMonthlyBillingAmount(Number(e.target.value))}
              className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
            />
          </div>

          {/* Payroll Rules Setup */}
          <div className="pt-3 border-t border-border space-y-3">
            <h4 className="font-bold text-txt-primary text-sm">Client-Specific Payroll Structure</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-txt-primary mb-1">Base Daily Wage (₹/day)</label>
                <input
                  type="number"
                  value={baseDailyWage}
                  onChange={e => setBaseDailyWage(Number(e.target.value))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-txt-primary mb-1">Overtime Rate (₹/hr)</label>
                <input
                  type="number"
                  value={overtimeRate}
                  onChange={e => setOvertimeRate(Number(e.target.value))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-txt-primary mb-1">Night Shift Allowance (₹/shift)</label>
                <input
                  type="number"
                  value={nightAllowance}
                  onChange={e => setNightAllowance(Number(e.target.value))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-txt-primary mb-1">Monthly Bonus (₹)</label>
                <input
                  type="number"
                  value={bonusAllowance}
                  onChange={e => setBonusAllowance(Number(e.target.value))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-txt-primary mb-1">PF (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={pfDeduction}
                  onChange={e => setPfDeduction(Number(e.target.value))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-txt-primary mb-1">ESI (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={esiDeduction}
                  onChange={e => setEsiDeduction(Number(e.target.value))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-txt-primary mb-1">Uniform Fee (₹)</label>
                <input
                  type="number"
                  value={uniformDeduction}
                  onChange={e => setUniformDeduction(Number(e.target.value))}
                  className="w-full p-2.5 bg-bg-surface-2 border border-border rounded-btn text-txt-primary font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editingClient ? 'Save Changes' : 'Onboard Client'}
            </Button>
          </div>
        </form>
      </Sheet>
    </motion.div>
  );
};
