import { apiClient } from './apiClient';

export const rosterApi = {
  async getShifts() {
    return apiClient('/roster/shifts');
  },

  async createShift(data: any) {
    return apiClient('/roster/shifts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getAssignments() {
    return apiClient('/roster/assignments');
  },

  async createAssignment(data: any) {
    return apiClient('/roster/assignments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getConflicts() {
    return apiClient('/roster/conflicts');
  }
};
