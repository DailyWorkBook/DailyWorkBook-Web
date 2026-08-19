import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ShieldAlert,
  Plus,
  DollarSign,
  Crown,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../core/auth';
import type {
  SuperAdminClient,
  PaymentTransaction,
  BypassAuditLog,
  SuperAdminActivityLog
} from '../types';
import { superAdminApi } from '../services/superAdminApi';

import { SuperAdminDashboardTab } from '../components/SuperAdminDashboardTab';
import { ClientManagementTab } from '../components/ClientManagementTab';
import { SuperAdminControlTab } from '../components/SuperAdminControlTab';

import { CreateClientModal } from '../components/CreateClientModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';

export const SuperAdminPage: React.FC = () => {
  const { user, startBypassSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on URL
  const getActiveTabFromPath = () => {
    if (location.pathname.includes('/superadmin/clients')) return 'clients';
    if (location.pathname.includes('/superadmin/control')) return 'control';
    return 'dashboard';
  };

  const activeTab = getActiveTabFromPath();

  const handleTabChange = (tab: 'dashboard' | 'clients' | 'control') => {
    navigate(`/superadmin/${tab}`);
  };

  // State
  const [clients, setClients] = useState<SuperAdminClient[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [bypassLogs, setBypassLogs] = useState<BypassAuditLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<SuperAdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  // Load Data from Backend API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [cData, tData, bData, aData] = await Promise.all([
          superAdminApi.getClients(),
          superAdminApi.getPayments(),
          superAdminApi.getImpersonationAuditLogs(),
          superAdminApi.getAuditLogs()
        ]);
        if (isMounted) {
          setClients(cData || []);
          setTransactions(tData || []);
          setBypassLogs(bData || []);
          setActivityLogs(aData || []);
        }
      } catch (err) {
        console.error('Failed to load Super Admin data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateClient = async (data: any) => {
    try {
      const created = await superAdminApi.createClient(data);
      setClients((prev) => [created, ...prev]);
      setIsCreateClientOpen(false);
    } catch (err) {
      console.error('Failed to create client:', err);
    }
  };

  const handleRecordPayment = async (data: any) => {
    try {
      const recorded = await superAdminApi.recordPayment(data);
      setTransactions((prev) => [recorded, ...prev]);
      // Update local client paid amount
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === data.clientId) {
            return {
              ...c,
              totalPaidToDate: (c.totalPaidToDate || 0) + data.amount
            };
          }
          return c;
        })
      );
      setIsRecordPaymentOpen(false);
    } catch (err) {
      console.error('Failed to record payment:', err);
    }
  };

  const handleToggleStatus = async (clientId: string) => {
    try {
      const target = clients.find((c) => c.id === clientId);
      const newStatus = target?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const updated = await superAdminApi.toggleClientStatus(clientId, newStatus);
      setClients((prev) => prev.map((c) => (c.id === clientId ? updated : c)));
    } catch (err) {
      console.error('Failed to toggle client status:', err);
    }
  };

  const handleUpdateClient = async (updatedClient: SuperAdminClient) => {
    try {
      const saved = await superAdminApi.updateClient(updatedClient.id, updatedClient);
      setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? saved : c)));
    } catch (err) {
      console.error('Failed to update client:', err);
    }
  };

  const handleInitiateBypassInNewTab = async (client: SuperAdminClient, reason: string) => {
    try {
      const clientNameStr = client.companyName || client.name;
      await superAdminApi.initiateImpersonation(client.id, reason);

      // Reload logs
      const freshLogs = await superAdminApi.getImpersonationAuditLogs();
      setBypassLogs(freshLogs || []);

      startBypassSession(
        {
          name: client.adminAccount.name,
          email: client.adminAccount.email,
          clientName: clientNameStr,
          clientId: client.id,
          adminId: client.adminAccount.adminId || client.adminAccount.id
        },
        reason,
        true
      );
    } catch (err) {
      console.error('Error initiating bypass session:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Title Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 font-mono text-xs font-bold flex items-center gap-1">
              <Crown className="w-4 h-4 text-indigo-500" /> SUPER ADMIN CONTROL
            </span>
            <span className="text-xs text-txt-secondary">&bull; Isolated Platform Management</span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            {activeTab === 'dashboard' && 'Super Admin Dashboard'}
            {activeTab === 'clients' && 'Platform Client Management'}
            {activeTab === 'control' && 'Super Admin Control Center'}
          </h1>
          <p className="text-xs text-txt-secondary mt-0.5">
            {activeTab === 'dashboard' && 'Global platform metrics, client fleet growth, subscription health, and financial telemetry.'}
            {activeTab === 'clients' && 'Provision client organizations, update pricing tiers, manage admin credentials, and audit client status.'}
            {activeTab === 'control' && 'Audit logs, passwordless tenant admin access, and platform security bypass control.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateClientOpen(true)}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </button>
          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <DollarSign className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Main 3 Super Admin Menu Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border/80 pb-2 scrollbar-none">
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>

        <button
          onClick={() => handleTabChange('clients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'clients'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Client Management
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
            activeTab === 'clients' ? 'bg-white/20 text-white' : 'bg-bg-surface-2 text-txt-secondary'
          }`}>
            {clients.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('control')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'control'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Super Admin Control
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8 gap-2 text-txt-secondary text-xs font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
          Syncing Super Admin data from WatchTower API...
        </div>
      )}

      {/* Screen Views */}
      {!loading && activeTab === 'dashboard' && (
        <SuperAdminDashboardTab
          clients={clients}
          transactions={transactions}
          onOpenCreateClient={() => setIsCreateClientOpen(true)}
          onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
          onSelectTab={(tab) => handleTabChange(tab as any)}
        />
      )}

      {!loading && activeTab === 'clients' && (
        <ClientManagementTab
          clients={clients}
          transactions={transactions}
          onOpenCreateClient={() => setIsCreateClientOpen(true)}
          onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
          onToggleStatus={handleToggleStatus}
          onUpdateClient={handleUpdateClient}
        />
      )}

      {!loading && activeTab === 'control' && (
        <SuperAdminControlTab
          clients={clients}
          bypassLogs={bypassLogs}
          onInitiateBypassInNewTab={handleInitiateBypassInNewTab}
        />
      )}

      {/* Action Modals */}
      <CreateClientModal
        isOpen={isCreateClientOpen}
        onClose={() => setIsCreateClientOpen(false)}
        onCreateClient={handleCreateClient}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        clients={clients}
        onClose={() => setIsRecordPaymentOpen(false)}
        onRecordPayment={handleRecordPayment}
      />
    </div>
  );
};
