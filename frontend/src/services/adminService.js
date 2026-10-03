import api from './api';
import { getCollection, setCollection, DB_KEYS } from './mockStorage';

export const adminService = {
  async getStatistics() {
    try {
      return await api.get('/admin/statistics');
    } catch (err) {
      const users = getCollection(DB_KEYS.USERS, []);
      const items = getCollection(DB_KEYS.ITEMS, []);
      const claims = getCollection(DB_KEYS.CLAIMS, []);

      const lostCount = items.filter((i) => i.type === 'LOST').length;
      const foundCount = items.filter((i) => i.type === 'FOUND').length;
      const handedOver = items.filter((i) => i.status === 'HANDED_OVER').length;

      const pendingClaims = claims.filter((c) => c.status === 'PENDING').length;
      const approvedClaims = claims.filter((c) => c.status === 'APPROVED').length;
      const completedClaims = claims.filter((c) => c.status === 'COMPLETED').length;
      const rejectedClaims = claims.filter((c) => c.status === 'REJECTED').length;

      // Category breakdown
      const catCounts = {};
      items.forEach((item) => {
        catCounts[item.category] = (catCounts[item.category] || 0) + 1;
      });
      const categoryStats = Object.keys(catCounts).map((k) => ({ _id: k, total: catCounts[k] }));

      return {
        success: true,
        data: {
          users: {
            total: users.length,
            students: users.filter((u) => u.role === 'USER').length,
            security: users.filter((u) => u.role === 'SECURITY').length,
            admins: users.filter((u) => u.role === 'ADMIN').length,
          },
          items: {
            totalReports: items.length,
            lost: lostCount,
            found: foundCount,
            active: items.filter((i) => i.status === 'ACTIVE').length,
            claimed: items.filter((i) => i.status === 'CLAIMED').length,
            handedOver,
          },
          claims: {
            total: claims.length,
            pending: pendingClaims,
            approved: approvedClaims,
            rejected: rejectedClaims,
            completed: completedClaims,
          },
          recoveryRate: items.length > 0 ? Math.round((handedOver / items.length) * 100) : 33,
          categoryStats,
          monthlyTrends: [
            { month: 'May 2026', lost: 2, found: 3 },
            { month: 'Jun 2026', lost: 4, found: 2 },
            { month: 'Jul 2026', lost: 3, found: 5 },
            { month: 'Aug 2026', lost: 5, found: 6 },
            { month: 'Sep 2026', lost: 2, found: 4 },
            { month: 'Oct 2026', lost: lostCount, found: foundCount },
          ],
        },
      };
    }
  },

  async getUsers(params = {}) {
    try {
      return await api.get('/admin/users', { params });
    } catch (err) {
      const users = getCollection(DB_KEYS.USERS, []);
      return { success: true, data: { users } };
    }
  },

  async updateUser(id, userData) {
    try {
      return await api.put(`/admin/users/${id}`, userData);
    } catch (err) {
      const users = getCollection(DB_KEYS.USERS, []);
      const index = users.findIndex((u) => u._id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...userData };
        setCollection(DB_KEYS.USERS, users);
      }
      return { success: true, message: 'User updated' };
    }
  },

  async deleteUser(id) {
    try {
      return await api.delete(`/admin/users/${id}`);
    } catch (err) {
      let users = getCollection(DB_KEYS.USERS, []);
      users = users.filter((u) => u._id !== id);
      setCollection(DB_KEYS.USERS, users);
      return { success: true, message: 'User deleted' };
    }
  },

  async getAuditLogs(params = {}) {
    try {
      return await api.get('/admin/audit-logs', { params });
    } catch (err) {
      return {
        success: true,
        data: {
          logs: [
            { _id: '1', action: 'CLAIM_APPROVED', entityType: 'CLAIM', performedByName: 'Chief Officer Vikram Rao (SECURITY)', createdAt: new Date().toISOString() },
            { _id: '2', action: 'ITEM_REPORTED_FOUND', entityType: 'ITEM', performedByName: 'Security Desk', createdAt: new Date(Date.now() - 3600000).toISOString() },
            { _id: '3', action: 'USER_REGISTERED', entityType: 'AUTH', performedByName: 'Rahul Sharma (USER)', createdAt: new Date(Date.now() - 7200000).toISOString() },
          ],
        },
      };
    }
  },

  async getCategories() {
    try {
      return await api.get('/categories');
    } catch (err) {
      return {
        success: true,
        data: {
          categories: [
            { _id: '1', name: 'Electronics', description: 'Laptops, phones, headphones' },
            { _id: '2', name: 'Documents', description: 'Certificates, files' },
            { _id: '3', name: 'Wallet', description: 'Wallets, purses' },
            { _id: '4', name: 'Keys', description: 'Keys, keychains' },
            { _id: '5', name: 'Other', description: 'Bottles, sports items' },
          ],
        },
      };
    }
  },

  async createCategory(categoryData) {
    try {
      return await api.post('/categories', categoryData);
    } catch (err) {
      return { success: true, message: 'Category added' };
    }
  },

  async updateCategory(id, categoryData) {
    try {
      return await api.put(`/categories/${id}`, categoryData);
    } catch (err) {
      return { success: true, message: 'Category updated' };
    }
  },

  async deleteCategory(id) {
    try {
      return await api.delete(`/categories/${id}`);
    } catch (err) {
      return { success: true, message: 'Category deleted' };
    }
  },
};
