import { apiClient } from './apiClient';

export const attendanceApi = {
  async getRegister(params: { date?: string; siteId?: string; state?: string } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return apiClient(`/attendance/register?${query}`);
  },

  async punch(data: any) {
    return apiClient('/attendance/punch', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async manualPunch(data: any) {
    return apiClient('/attendance/manual', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
