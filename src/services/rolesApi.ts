import { apiClient } from './apiClient';

export const rolesApi = {
  async getRoles() {
    return apiClient('/roles');
  },

  async createRole(data: { name: string; code: string; description?: string; permissions: string[] }) {
    return apiClient('/roles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteRole(id: string) {
    return apiClient(`/roles/${id}`, {
      method: 'DELETE'
    });
  }
};
