import { apiClient } from './apiClient';

export const leaveApi = {
  async getRequests() {
    return apiClient('/leave/requests');
  },

  async createRequest(data: any) {
    return apiClient('/leave/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    return apiClient(`/leave/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};
