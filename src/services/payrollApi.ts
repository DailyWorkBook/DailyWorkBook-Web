import { apiClient } from './apiClient';

export const payrollApi = {
  async getSummary() {
    return apiClient('/payroll/summary');
  }
};
