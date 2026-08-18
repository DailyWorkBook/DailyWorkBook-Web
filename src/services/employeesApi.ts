import { apiClient } from './apiClient';

export const employeesApi = {
  async getEmployees() {
    return apiClient('/employees');
  },

  async getEmployeeById(id: string) {
    return apiClient(`/employees/${id}`);
  },

  async createEmployee(data: any) {
    return apiClient('/employees', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateEmployee(id: string, data: any) {
    return apiClient(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteEmployee(id: string) {
    return apiClient(`/employees/${id}`, {
      method: 'DELETE'
    });
  }
};
