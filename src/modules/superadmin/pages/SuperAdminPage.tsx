import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ShieldAlert,
  Plus,
  DollarSign,
  Crown
} from 'lucide-react';
import { useAuth } from '../../../core/auth';
import {
  INITIAL_SUPERADMIN_CLIENTS,
  INITIAL_PAYMENT_TRANSACTIONS,
  INITIAL_BYPASS_AUDIT_LOGS,
  INITIAL_SUPERADMIN_ACTIVITY_LOGS,
  SuperAdminClient,
  PaymentTransaction,
  BypassAuditLog,
  SuperAdminActivityLog
} from '../../../mockData/superAdmin';

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
  const [clients, setClients] = useState<SuperAdminClient[]>(INITIAL_SUPERADMIN_CLIENTS);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_PAYMENT_TRANSACTIONS);
  const [bypassLogs, setBypassLogs] = useState<BypassAuditLog[]>(INITIAL_BYPASS_AUDIT_LOGS);
  const [activityLogs, setActivityLogs] = useState<SuperAdminActivityLog[]>(INITIAL_SUPERADMIN_ACTIVITY_LOGS);

  // Modals state
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  // Handlers
  const handleCreateClient = (newClient: SuperAdminClient) => {
    setClients((prev) => [newClient, ...prev]);

    const newActivity: SuperAdminActivityLog = {
      id: 'sal-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      actorName: user?.name || 'Super Admin',
      actorEmail: user?.email || 'superadmin@watchtower.dev',
      action: 'CLIENT_CREATED',
      category: 'CLIENT',
      details: `Created new client ${newClient.name} (${newClient.code}) with plan ${newClient.subscription.planName}`,
      targetClient: newClient.name
    };
    setActivityLogs((prev) => [newActivity, ...prev]);
  };

  const handleRecordPayment = (tx: PaymentTransaction) => {
    setTransactions((prev) => [tx, ...prev]);

    if (tx.status === 'PAID') {
      setClients((prev) =>
        prev.map((c) =>
          c.id === tx.clientId
            ? { ...c, totalPaidToDate: c.totalPaidToDate + tx.amount }
            : c
        )
      );
    }

    const newActivity: SuperAdminActivityLog = {
      id: 'sal-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      actorName: user?.name || 'Super Admin',
      actorEmail: user?.email || 'superadmin@watchtower.dev',
      action: 'PAYMENT_RECORDED',
      category: 'PAYMENT',
      details: `Recorded payment of ₹${tx.amount.toLocaleString('en-IN')} for ${tx.clientName} (${tx.invoiceNumber})`,
      targetClient: tx.clientName
    };
    setActivityLogs((prev) => [newActivity, ...prev]);
  };

  const handleToggleStatus = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const nextStatus = c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

          const newActivity: SuperAdminActivityLog = {
            id: 'sal-' + Date.now(),
            timestamp: new Date().toLocaleString(),
            actorName: user?.name || 'Super Admin',
            actorEmail: user?.email || 'superadmin@watchtower.dev',
            action: 'STATUS_CHANGED',
            category: 'CLIENT',
            details: `Changed account status of ${c.name} to ${nextStatus}`,
            targetClient: c.name
          };
          setActivityLogs((a) => [newActivity, ...a]);

          return {
            ...c,
            status: nextStatus,
            adminAccount: { ...c.adminAccount, status: nextStatus }
          };
        }
        return c;
      })
    );
  };

  const handleUpdateClient = (updated: SuperAdminClient) => {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

    const newActivity: SuperAdminActivityLog = {
      id: 'sal-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      actorName: user?.name || 'Super Admin',
      actorEmail: user?.email || 'superadmin@watchtower.dev',
      action: 'CLIENT_UPDATED',
      category: 'CLIENT',
      details: `Updated company information for ${updated.name}`,
      targetClient: updated.name
    };
    setActivityLogs((a) => [newActivity, ...a]);
  };

  const handleInitiateBypassInNewTab = (client: SuperAdminClient, reason: string) => {
    const bypassLog: BypassAuditLog = {
      id: 'bpl-' + Date.now(),
      superAdminName: user?.name || 'Alex Morgan',
      superAdminEmail: user?.email || 'superadmin@watchtower.dev',
      targetAdminId: client.adminAccount.adminId,
      targetAdminName: client.adminAccount.name,
      targetAdminEmail: client.adminAccount.email,
      clientId: client.id,
      clientName: client.name,
      reason,
      startTime: new Date().toLocaleString(),
      sessionStatus: 'ACTIVE',
      ipAddress: '103.21.124.89 (Current Session)',
      userAgent: navigator.userAgent || 'Chrome/MacOS'
    };

    setBypassLogs((prev) => [bypassLog, ...prev]);

    const newActivity: SuperAdminActivityLog = {
      id: 'sal-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      actorName: user?.name || 'Super Admin',
      actorEmail: user?.email || 'superadmin@watchtower.dev',
      action: 'BYPASS_LOGIN_STARTED',
      category: 'SECURITY',
      details: `Initiated Login to Client Account in NEW TAB for ${client.adminAccount.name} (${client.name}). Reason: "${reason}"`,
      targetClient: client.name
    };
    setActivityLogs((prev) => [newActivity, ...prev]);

    startBypassSession(
      {
        name: client.adminAccount.name,
        email: client.adminAccount.email,
        clientName: client.name,
        clientId: client.id,
        adminId: client.adminAccount.adminId
      },
      reason,
      true
    );
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

      {/* Screen Views */}
      {activeTab === 'dashboard' && (
        <SuperAdminDashboardTab
          clients={clients}
          transactions={transactions}
          onOpenCreateClient={() => setIsCreateClientOpen(true)}
          onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
          onSelectTab={(tab) => handleTabChange(tab as any)}
        />
      )}

      {activeTab === 'clients' && (
        <ClientManagementTab
          clients={clients}
          transactions={transactions}
          onOpenCreateClient={() => setIsCreateClientOpen(true)}
          onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
          onToggleStatus={handleToggleStatus}
          onUpdateClient={handleUpdateClient}
        />
      )}

      {activeTab === 'control' && (
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
