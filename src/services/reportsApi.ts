import { apiClient } from './apiClient';

export const reportsApi = {
  async getAttendanceSummary() {
    return apiClient('/reports/attendance-summary');
  }
};
