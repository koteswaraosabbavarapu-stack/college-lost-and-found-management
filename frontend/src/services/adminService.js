import api from './api';

export const adminService = {
  async getStatistics() {
    return await api.get('/admin/statistics');
  },

  async getUsers(params = {}) {
    return await api.get('/admin/users', { params });
  },

  async updateUser(id, userData) {
    return await api.put(`/admin/users/${id}`, userData);
  },

  async deleteUser(id) {
    return await api.delete(`/admin/users/${id}`);
  },

  async getAuditLogs(params = {}) {
    return await api.get('/admin/audit-logs', { params });
  },

  async getCategories() {
    return await api.get('/categories');
  },

  async createCategory(categoryData) {
    return await api.post('/categories', categoryData);
  },

  async updateCategory(id, categoryData) {
    return await api.put(`/categories/${id}`, categoryData);
  },

  async deleteCategory(id) {
    return await api.delete(`/categories/${id}`);
  },
};
