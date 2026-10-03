import api from './api';
import { getCollection, setCollection, DB_KEYS } from './mockStorage';
import { authService } from './authService';

export const itemService = {
  async getItems(params = {}) {
    try {
      return await api.get('/items', { params });
    } catch (err) {
      // In-browser mock fallback
      let items = getCollection(DB_KEYS.ITEMS, []);
      const currentUser = authService.getCurrentUser();

      if (params.type && ['LOST', 'FOUND'].includes(params.type.toUpperCase())) {
        items = items.filter((i) => i.type === params.type.toUpperCase());
      }

      if (params.category && params.category !== 'All') {
        items = items.filter((i) => i.category === params.category);
      }

      if (params.status && params.status !== 'All') {
        items = items.filter((i) => i.status === params.status.toUpperCase());
      }

      if (params.location && params.location !== 'All') {
        items = items.filter((i) => i.location.toLowerCase().includes(params.location.toLowerCase()));
      }

      if (params.myItems === 'true' && currentUser) {
        items = items.filter((i) => i.reportedBy?._id === currentUser._id || i.reportedBy === currentUser._id);
      }

      if (params.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        items = items.filter(
          (i) =>
            i.title?.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q) ||
            i.brand?.toLowerCase().includes(q) ||
            i.color?.toLowerCase().includes(q) ||
            i.location?.toLowerCase().includes(q)
        );
      }

      const limit = params.limit ? parseInt(params.limit, 10) : 12;
      const page = params.page ? parseInt(params.page, 10) : 1;

      return {
        success: true,
        data: {
          items: items.slice((page - 1) * limit, page * limit),
          pagination: {
            totalItems: items.length,
            totalPages: Math.ceil(items.length / limit) || 1,
            currentPage: page,
            limit,
          },
        },
      };
    }
  },

  async getItemById(id) {
    try {
      return await api.get(`/items/${id}`);
    } catch (err) {
      const items = getCollection(DB_KEYS.ITEMS, []);
      const item = items.find((i) => i._id === id);
      if (!item) throw new Error('Item not found');

      const claims = getCollection(DB_KEYS.CLAIMS, []);
      const currentUser = authService.getCurrentUser();
      const userClaim = currentUser ? claims.find((c) => (c.item?._id === id || c.item === id) && c.claimant?._id === currentUser._id) : null;

      return {
        success: true,
        data: {
          item,
          userClaim,
        },
      };
    }
  },

  async reportLost(itemData) {
    try {
      return await api.post('/items/lost', itemData);
    } catch (err) {
      const currentUser = authService.getCurrentUser() || { _id: 'usr_guest', name: 'Student', role: 'USER' };
      const items = getCollection(DB_KEYS.ITEMS, []);

      const newItem = {
        _id: 'item_' + Date.now(),
        ...itemData,
        type: 'LOST',
        status: 'ACTIVE',
        reportedBy: currentUser,
        history: [{ action: 'REPORTED_LOST', performedBy: currentUser, timestamp: new Date().toISOString(), notes: 'Reported lost by student' }],
        createdAt: new Date().toISOString(),
      };

      items.unshift(newItem);
      setCollection(DB_KEYS.ITEMS, items);

      return {
        success: true,
        data: { item: newItem },
        message: 'Lost item reported successfully!',
      };
    }
  },

  async reportFound(itemData) {
    try {
      return await api.post('/items/found', itemData);
    } catch (err) {
      const currentUser = authService.getCurrentUser() || { _id: 'usr_guest', name: 'Officer', role: 'SECURITY' };
      const items = getCollection(DB_KEYS.ITEMS, []);

      const newItem = {
        _id: 'item_' + Date.now(),
        ...itemData,
        type: 'FOUND',
        status: 'ACTIVE',
        reportedBy: currentUser,
        currentStorageLocation: itemData.currentStorageLocation || 'Campus Security Main Office',
        history: [{ action: 'REPORTED_FOUND', performedBy: currentUser, timestamp: new Date().toISOString(), notes: 'Logged into desk storage' }],
        createdAt: new Date().toISOString(),
      };

      items.unshift(newItem);
      setCollection(DB_KEYS.ITEMS, items);

      return {
        success: true,
        data: { item: newItem },
        message: 'Found item registered successfully!',
      };
    }
  },

  async updateItem(id, itemData) {
    try {
      return await api.put(`/items/${id}`, itemData);
    } catch (err) {
      const items = getCollection(DB_KEYS.ITEMS, []);
      const index = items.findIndex((i) => i._id === id);
      if (index === -1) throw new Error('Item not found');

      items[index] = { ...items[index], ...itemData };
      setCollection(DB_KEYS.ITEMS, items);
      return { success: true, data: { item: items[index] } };
    }
  },

  async deleteItem(id) {
    try {
      return await api.delete(`/items/${id}`);
    } catch (err) {
      let items = getCollection(DB_KEYS.ITEMS, []);
      items = items.filter((i) => i._id !== id);
      setCollection(DB_KEYS.ITEMS, items);
      return { success: true, message: 'Item deleted' };
    }
  },

  async checkDuplicate(itemData) {
    try {
      return await api.post('/items/check-duplicate', itemData);
    } catch (err) {
      const items = getCollection(DB_KEYS.ITEMS, []);
      const titleWords = (itemData.title || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const duplicates = [];

      for (const item of items) {
        if (item.category === itemData.category || item.location === itemData.location) {
          const itemText = `${item.title} ${item.description}`.toLowerCase();
          const matchCount = titleWords.filter((w) => itemText.includes(w)).length;
          if (matchCount >= 2) {
            duplicates.push({ item, score: 65 });
          }
        }
      }

      return { success: true, data: { duplicates } };
    }
  },
};
