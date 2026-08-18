import { apiClient } from './apiClient';

export const authApi = {
  async login(email: string, password: string) {
    return apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async me() {
    return apiClient('/auth/me');
  }
};
