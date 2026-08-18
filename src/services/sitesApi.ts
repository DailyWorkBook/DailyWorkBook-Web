import { apiClient } from './apiClient';

export const sitesApi = {
  async getSites() {
    return apiClient('/sites');
  },

  async getSiteById(id: string) {
    return apiClient(`/sites/${id}`);
  },

  async createSite(data: any) {
    return apiClient('/sites', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateSite(id: string, data: any) {
    return apiClient(`/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteSite(id: string) {
    return apiClient(`/sites/${id}`, {
      method: 'DELETE'
    });
  },

  async createPost(siteId: string, data: any) {
    return apiClient(`/sites/${siteId}/posts`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updatePost(siteId: string, postId: string, data: any) {
    return apiClient(`/sites/${siteId}/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deletePost(siteId: string, postId: string) {
    return apiClient(`/sites/${siteId}/posts/${postId}`, {
      method: 'DELETE'
    });
  }
};
