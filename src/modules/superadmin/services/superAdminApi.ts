import type {
  SuperAdminClient,
  PaymentTransaction,
  BypassAuditLog,
  SuperAdminActivityLog
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api/superadmin';

function getAuthHeaders() {
  const token = localStorage.getItem('token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const superAdminApi = {
  /**
   * Fetch platform-level dashboard analytics directly from server database
   */
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch Super Admin dashboard statistics');
    const json = await res.json();
    return json.data;
  },

  /**
   * Fetch all clients with full sub-structures from server database
   */
  async getClients(): Promise<SuperAdminClient[]> {
    const res = await fetch(`${API_BASE_URL}/clients`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch client directory');
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetch a single client details by ID from server database
   */
  async getClientById(id: string): Promise<SuperAdminClient | null> {
    const res = await fetch(`${API_BASE_URL}/clients/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch client profile');
    const json = await res.json();
    return json.data;
  },

  /**
   * Create a new client along with Admin Account and Subscription
   */
  async createClient(data: any): Promise<SuperAdminClient> {
    const res = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to create client organization');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Update client company & contact details
   */
  async updateClient(id: string, data: any): Promise<SuperAdminClient> {
    const res = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update client profile');
    const json = await res.json();
    return json.data;
  },

  /**
   * Activate or Deactivate client account
   */
  async toggleClientStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<SuperAdminClient> {
    const res = await fetch(`${API_BASE_URL}/clients/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update client status');
    const json = await res.json();
    return json.data;
  },

  /**
   * Update client subscription plan
   */
  async updateSubscription(clientId: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/clients/${clientId}/subscription`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update client subscription');
    const json = await res.json();
    return json.data;
  },

  /**
   * Fetch all payment history records from server database
   */
  async getPayments(): Promise<PaymentTransaction[]> {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch payment transactions');
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Record a new client payment
   */
  async recordPayment(data: any): Promise<PaymentTransaction> {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record client payment');
    const json = await res.json();
    return json.data;
  },

  /**
   * Initiate passwordless Admin Impersonation Session
   */
  async initiateImpersonation(clientId: string, reason: string) {
    const res = await fetch(`${API_BASE_URL}/impersonate/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ clientId, reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to start impersonation session');
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Fetch Impersonation Audit Logs from server database
   */
  async getImpersonationAuditLogs(): Promise<BypassAuditLog[]> {
    const res = await fetch(`${API_BASE_URL}/impersonate/audit`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch impersonation audit logs');
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Fetch Super Admin Activity Audit Logs from server database
   */
  async getAuditLogs(): Promise<SuperAdminActivityLog[]> {
    const res = await fetch(`${API_BASE_URL}/audit`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    const json = await res.json();
    return json.data || [];
  }
};
