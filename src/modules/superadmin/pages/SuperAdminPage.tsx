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
        const [clientsData, bypassLogsData, auditLogsData] = await Promise.all([
          superAdminApi.getClients(),
          superAdminApi.getImpersonationAuditLogs(),
          superAdminApi.getAuditLogs()
        ]);

        if (isMounted) {
          setClients(clientsData);
          setBypassLogs(bypassLogsData);
          setActivityLogs(auditLogsData);
        }
      } catch (err) {
        console.error('Failed to fetch Super Admin data from server:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers connected to backend API
  const handleCreateClient = async (clientData: any) => {
    try {
      const newClient = await superAdminApi.createClient(clientData);
      setClients((prev) => [newClient, ...prev]);

      const newActivity: SuperAdminActivityLog = {
        id: 'sal-' + Date.now(),
        timestamp: new Date().toLocaleString(),
        actor: user?.name || 'Super Admin',
        actorName: user?.name || 'Super Admin',
        action: 'CLIENT_CREATED',
        category: 'CLIENT',
        details: `Created new client ${newClient.companyName || newClient.name} (${newClient.clientCode || newClient.code}) with plan ${newClient.subscription?.planName || 'Standard Suite'}`,
        targetClient: newClient.companyName || newClient.name
      };
      setActivityLogs((prev) => [newActivity, ...prev]);
    } catch (err) {
      console.error('Error creating client:', err);
    }
  };

  const handleRecordPayment = async (txData: any) => {
    try {
      const tx = await superAdminApi.recordPayment(txData);
      setTransactions((prev) => [tx, ...prev]);

      if (tx.status === 'PAID') {
        setClients((prev) =>
          prev.map((c) =>
            c.id === tx.clientId
              ? { ...c, totalPaidToDate: (c.totalPaidToDate || 0) + tx.amount }
              : c
          )
        );
      }

      const newActivity: SuperAdminActivityLog = {
        id: 'sal-' + Date.now(),
        timestamp: new Date().toLocaleString(),
        actor: user?.name || 'Super Admin',
        actorName: user?.name || 'Super Admin',
        action: 'PAYMENT_RECORDED',
        category: 'BILLING',
        details: `Recorded payment of ₹${tx.amount.toLocaleString('en-IN')} for ${tx.clientName || 'Client'} (${tx.invoiceNumber})`,
        targetClient: tx.clientName
      };
      setActivityLogs((prev) => [newActivity, ...prev]);
    } catch (err) {
      console.error('Error recording payment:', err);
    }
  };

  const handleToggleStatus = async (clientId: string) => {
    const target = clients.find((c) => c.id === clientId);
    if (!target) return;

    const nextStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await superAdminApi.toggleClientStatus(clientId, nextStatus);

      setClients((prev) =>
        prev.map((c) => {
          if (c.id === clientId) {
            return {
              ...c,
              status: nextStatus,
              adminAccount: { ...c.adminAccount, status: nextStatus }
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Error toggling client status:', err);
    }
  };

  const handleUpdateClient = async (updated: SuperAdminClient) => {
    try {
      await superAdminApi.updateClient(updated.id, updated);
      setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      console.error('Error updating client:', err);
    }
  };

  const handleInitiateBypassInNewTab = async (client: SuperAdminClient, reason: string) => {
    try {
      const res = await superAdminApi.initiateImpersonation(client.id, reason);

      const clientNameStr = client.companyName || client.name || 'Client Org';

      const bypassLog: BypassAuditLog = {
        id: res.session?.id || 'bpl-' + Date.now(),
        superAdminId: user?.id || 'sa-1',
        superAdminName: user?.name || 'Alex Morgan',
        superAdminEmail: user?.email || 'superadmin@watchtower.dev',
        adminId: client.adminAccount.adminId || client.adminAccount.id,
        targetAdminName: client.adminAccount.name,
        adminEmail: client.adminAccount.email,
        clientId: client.id,
        clientName: clientNameStr,
        reason,
        startTime: new Date().toLocaleString(),
        sessionStatus: 'ACTIVE',
        timestamp: new Date().toISOString(),
        ipAddress: '103.21.124.89 (Current Session)',
        durationMinutes: 60,
        actionsTaken: ['INITIATE_SESSION']
      };

      setBypassLogs((prev) => [bypassLog, ...prev]);

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
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 font-mono text-xs font-bold flex items-center gap-1">
              <Crown className="w-4 h-4 text-indigo-500" /> SUPER ADMIN MODULE
            </span>
            <span className="text-xs text-txt-secondary">&bull; Isolated Platform Management</span>
          </div>
          <h1 className="text-2xl font-black text-txt-primary tracking-tight mt-1">
            Super Admin Control Center
          </h1>
          <p className="text-xs text-txt-secondary mt-0.5">
            Platform-level analytics, client fleet management, pricing structures, and passwordless Admin login control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateClientOpen(true)}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </button>
          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <DollarSign className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Main 3 Super Admin Menu Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border/80 pb-2 scrollbar-none">
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          1. Super Admin Dashboard
        </button>

        <button
          onClick={() => handleTabChange('clients')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'clients'
              ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2'
          }`}
        >
          <Building2 className="w-4 h-4" />
          2. Client Management ({clients.length})
        </button>

        <button
          onClick={() => handleTabChange('control')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'control'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-surface-2'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-300" />
          3. Super Admin Control (Login in New Tab)
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
