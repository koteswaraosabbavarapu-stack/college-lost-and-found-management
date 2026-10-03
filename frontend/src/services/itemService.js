import api from './api';

export const itemService = {
  async getItems(params = {}) {
    return await api.get('/items', { params });
  },

  async getItemById(id) {
    return await api.get(`/items/${id}`);
  },

  async reportLost(itemData) {
    return await api.post('/items/lost', itemData);
  },

  async reportFound(itemData) {
    return await api.post('/items/found', itemData);
  },

  async updateItem(id, itemData) {
    return await api.put(`/items/${id}`, itemData);
  },

  async deleteItem(id) {
    return await api.delete(`/items/${id}`);
  },

  async checkDuplicate(itemData) {
    return await api.post('/items/check-duplicate', itemData);
  },
};
