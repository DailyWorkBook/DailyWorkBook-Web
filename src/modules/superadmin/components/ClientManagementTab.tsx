import React, { useState } from 'react';
import {
  Building2,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  UserCheck,
  Lock,
  Plus,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { SuperAdminClient, PaymentTransaction } from '../types';

interface ClientManagementTabProps {
  clients: SuperAdminClient[];
  transactions: PaymentTransaction[];
  onOpenCreateClient: () => void;
  onOpenRecordPayment: () => void;
  onToggleStatus: (clientId: string) => void;
  onUpdateClient: (updatedClient: SuperAdminClient) => void;
}

export const ClientManagementTab: React.FC<ClientManagementTabProps> = ({
  clients,
  transactions,
  onOpenCreateClient,
  onOpenRecordPayment,
  onToggleStatus,
  onUpdateClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [pricingModelFilter, setPricingModelFilter] = useState<string>('ALL');

  const [selectedClientForModal, setSelectedClientForModal] = useState<SuperAdminClient | null>(null);
  const [editingClient, setEditingClient] = useState<SuperAdminClient | null>(null);

  // Edit Client form state
  const [editName, setEditName] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.adminAccount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.adminAccount.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesModel = pricingModelFilter === 'ALL' || c.subscription.pricingModel === pricingModelFilter;
    return matchesSearch && matchesStatus && matchesModel;
  });

  const handleOpenEdit = (c: SuperAdminClient) => {
    setEditingClient(c);
    setEditName(c.name);
    setEditIndustry(c.industry);
    setEditAddress(c.billingAddress);
    setEditCity(c.city);
    setEditContactPerson(c.contactPerson);
    setEditContactPhone(c.contactPhone);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    const updated: SuperAdminClient = {
      ...editingClient,
      name: editName,
      industry: editIndustry,
      billingAddress: editAddress,
      city: editCity,
      contactPerson: editContactPerson,
      contactPhone: editContactPhone
    };
    onUpdateClient(updated);
    setEditingClient(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Search & Controls Bar */}
      <div className="bg-bg-surface border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-txt-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients, company code, admin name, or admin email..."
              className="w-full pl-10 pr-4 py-2 bg-bg-surface-2 border border-border rounded-xl text-xs text-txt-primary placeholder-txt-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-bg-surface-2 border border-border rounded-xl text-xs font-semibold text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive / Suspended</option>
            </select>

            <select
              value={pricingModelFilter}
              onChange={(e) => setPricingModelFilter(e.target.value)}
              className="px-3 py-2 bg-bg-surface-2 border border-border rounded-xl text-xs font-semibold text-txt-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            >
              <option value="ALL">All Pricing Models</option>
              <option value="DAILY">Daily-based</option>
              <option value="MONTHLY">Monthly-based</option>
              <option value="PER_USER">User-based</option>
              <option value="CUSTOM">Custom Pricing</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onOpenCreateClient}
            className="w-full md:w-auto px-4 py-2 bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Main Client Fleet & Billing Table */}
      <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-bg-surface-2 text-txt-secondary uppercase tracking-wider font-mono text-[10px] border-b border-border">
                <th className="px-4 py-3">Client Organization</th>
                <th className="px-4 py-3">Associated Admin Account</th>
                <th className="px-4 py-3">Pricing Structure</th>
                <th className="px-4 py-3">Billing Cycle &amp; Expiry</th>
                <th className="px-4 py-3">Payment Status &amp; Total Paid</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-txt-secondary">
                    No clients match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const clientTxs = transactions.filter((t) => t.clientId === client.id);
                  const latestTx = clientTxs[0];

                  return (
                    <tr key={client.id} className="hover:bg-bg-surface-2/40 transition-colors">
                      {/* Client Company */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={client.logoUrl}
                            alt={client.name}
                            className="w-9 h-9 rounded-xl object-cover border border-border flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-sm text-txt-primary leading-tight">
                              {client.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-txt-secondary font-mono">
                              <span>{client.code}</span>
                              <span>&bull;</span>
                              <span>{client.city}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Associated Admin Account */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <div className="font-bold text-txt-primary flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-brand-primary" />
                            {client.adminAccount.name}
                          </div>
                          <div className="text-[11px] font-mono text-txt-secondary">
                            {client.adminAccount.email}
                          </div>
                        </div>
                      </td>

                      {/* Pricing Structure */}
                      <td className="px-4 py-3.5">
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                              client.subscription.pricingModel === 'DAILY'
                                ? 'bg-amber-500/10 text-amber-600'
                                : client.subscription.pricingModel === 'PER_USER'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : client.subscription.pricingModel === 'CUSTOM'
                                ? 'bg-indigo-500/10 text-indigo-600'
                                : 'bg-brand-primary/10 text-brand-primary'
                            }`}
                          >
                            {client.subscription.pricingModel} PRICING
                          </span>
                          <div className="text-[11px] font-semibold text-txt-primary mt-1">
                            ₹{client.subscription.monthlyEstimatedAmount.toLocaleString('en-IN')}{' '}
                            <span className="text-[10px] text-txt-secondary font-normal">
                              / {client.subscription.billingCycle.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Billing Cycle & Expiry */}
                      <td className="px-4 py-3.5 space-y-0.5 text-[11px]">
                        <div className="font-semibold text-txt-primary">
                          {client.subscription.billingCycle} Cycle
                        </div>
                        <div className="font-mono text-txt-secondary">
                          Expires: {client.subscription.expiryDate}
                        </div>
                      </td>

                      {/* Payment Status & History */}
                      <td className="px-4 py-3.5 space-y-0.5 text-[11px]">
                        <div className="font-bold text-emerald-600">
                          ₹{client.totalPaidToDate.toLocaleString('en-IN')} Paid
                        </div>
                        <div className="text-[10px] text-txt-secondary flex items-center gap-1">
                          Status:{' '}
                          <span
                            className={`font-bold ${
                              latestTx?.status === 'PAID' || !latestTx
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {latestTx?.status || 'PAID'}
                          </span>
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => onToggleStatus(client.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            client.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                          }`}
                          title="Click to Activate or Deactivate client"
                        >
                          {client.status === 'ACTIVE' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {client.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => setSelectedClientForModal(client)}
                          className="p-1.5 text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2 rounded-lg transition-colors inline-block"
                          title="View Complete Client Profile & Billing Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(client)}
                          className="p-1.5 text-txt-secondary hover:text-brand-primary hover:bg-bg-surface-2 rounded-lg transition-colors inline-block"
                          title="Edit Client Information"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Complete Details Modal */}
      {selectedClientForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedClientForModal.logoUrl}
                  alt={selectedClientForModal.name}
                  className="w-10 h-10 rounded-xl object-cover border border-border"
                />
                <div>
                  <h3 className="text-base font-bold text-txt-primary">
                    {selectedClientForModal.name}
                  </h3>
                  <p className="text-xs text-txt-secondary font-mono">
                    Code: {selectedClientForModal.code} | Tax ID: {selectedClientForModal.taxId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClientForModal(null)}
                className="text-txt-secondary hover:text-txt-primary p-1 rounded-lg hover:bg-bg-surface-2"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-bg-surface-2 p-3.5 rounded-xl border border-border space-y-2">
                <div className="font-bold text-txt-primary border-b border-border/60 pb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-primary" /> Client Profile &amp; Contact Details
                </div>
                <div className="grid grid-cols-2 gap-2 text-txt-secondary">
                  <div>Industry: <span className="font-semibold text-txt-primary">{selectedClientForModal.industry}</span></div>
                  <div>City: <span className="font-semibold text-txt-primary">{selectedClientForModal.city}</span></div>
                  <div>Contact Person: <span className="font-semibold text-txt-primary">{selectedClientForModal.contactPerson}</span></div>
                  <div>Phone: <span className="font-semibold text-txt-primary">{selectedClientForModal.contactPhone}</span></div>
                  <div>Email: <span className="font-mono text-txt-primary">{selectedClientForModal.contactEmail}</span></div>
                  <div>Address: <span className="font-semibold text-txt-primary">{selectedClientForModal.billingAddress}</span></div>
                </div>
              </div>

              <div className="bg-bg-surface-2 p-3.5 rounded-xl border border-border space-y-2">
                <div className="font-bold text-txt-primary border-b border-border/60 pb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-brand-primary" /> Associated Admin Account
                </div>
                <div className="grid grid-cols-2 gap-2 text-txt-secondary">
                  <div>Admin Name: <span className="font-semibold text-txt-primary">{selectedClientForModal.adminAccount.name}</span></div>
                  <div>Admin Email: <span className="font-mono text-txt-primary">{selectedClientForModal.adminAccount.email}</span></div>
                  <div>Admin Phone: <span className="font-semibold text-txt-primary">{selectedClientForModal.adminAccount.phone}</span></div>
                  <div>Account Status: <span className="font-bold text-emerald-600">{selectedClientForModal.adminAccount.status}</span></div>
                </div>
              </div>

              <div className="bg-bg-surface-2 p-3.5 rounded-xl border border-border space-y-2">
                <div className="font-bold text-txt-primary border-b border-border/60 pb-1 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-brand-primary" /> Subscription &amp; Billing Structure
                </div>
                <div className="grid grid-cols-2 gap-2 text-txt-secondary">
                  <div>Plan Name: <span className="font-semibold text-txt-primary">{selectedClientForModal.subscription.planName}</span></div>
                  <div>Pricing Model: <span className="font-bold font-mono text-brand-primary">{selectedClientForModal.subscription.pricingModel}</span></div>
                  <div>Billing Cycle: <span className="font-semibold text-txt-primary">{selectedClientForModal.subscription.billingCycle}</span></div>
                  <div>Estimated MRR: <span className="font-bold text-txt-primary">₹{selectedClientForModal.subscription.monthlyEstimatedAmount.toLocaleString('en-IN')}</span></div>
                  <div>Expiry Date: <span className="font-mono text-txt-primary">{selectedClientForModal.subscription.expiryDate}</span></div>
                  <div>Total Paid to Date: <span className="font-bold text-emerald-600">₹{selectedClientForModal.totalPaidToDate.toLocaleString('en-IN')}</span></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedClientForModal(null)}
                className="px-4 py-2 bg-bg-surface-2 hover:bg-border/60 text-xs font-semibold rounded-xl text-txt-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Information Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-txt-primary border-b border-border pb-3">
              Edit Client Info: {editingClient.name}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-txt-primary mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-txt-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-txt-primary mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-txt-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-txt-primary mb-1">Contact Person</label>
                <input
                  type="text"
                  value={editContactPerson}
                  onChange={(e) => setEditContactPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-txt-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-txt-primary mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editContactPhone}
                  onChange={(e) => setEditContactPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-txt-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-txt-primary mb-1">City</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-txt-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-txt-primary mb-1">Billing Address</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-surface border border-border rounded-xl text-xs text-txt-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 bg-bg-surface-2 rounded-xl text-txt-secondary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
