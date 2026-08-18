import { apiClient } from './apiClient';

export const exceptionsApi = {
  async getQueue() {
    return apiClient('/exceptions');
  },

  async approve(id: string) {
    return apiClient(`/exceptions/${id}/approve`, { method: 'POST' });
  },

  async reject(id: string) {
    return apiClient(`/exceptions/${id}/reject`, { method: 'POST' });
  }
};
