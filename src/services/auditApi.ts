import { apiClient } from './apiClient';

export const auditApi = {
  async getLogs() {
    return apiClient('/audit/logs');
  }
};
