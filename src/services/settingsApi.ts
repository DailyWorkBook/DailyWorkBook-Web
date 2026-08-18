import { apiClient } from './apiClient';

export const settingsApi = {
  async getAttendanceConfig() {
    return apiClient('/settings/attendance');
  },

  async updateAttendanceConfig(data: any) {
    return apiClient('/settings/attendance', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};
