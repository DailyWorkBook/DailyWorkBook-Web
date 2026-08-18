import { apiClient } from './apiClient';

export const dashboardApi = {
  async getOverview() {
    return apiClient('/dashboard/overview');
  }
};
