import api from './api';
import { getCollection, setCollection, DB_KEYS } from './mockStorage';
import { authService } from './authService';

export const notificationService = {
  async getNotifications() {
    try {
      return await api.get('/notifications');
    } catch (err) {
      const currentUser = authService.getCurrentUser();
      const allNotifs = getCollection(DB_KEYS.NOTIFICATIONS, []);
      const userNotifs = currentUser
        ? allNotifs.filter((n) => n.user === currentUser._id || n.user?._id === currentUser._id)
        : allNotifs;
      const unreadCount = userNotifs.filter((n) => !n.isRead).length;

      return {
        success: true,
        data: {
          notifications: userNotifs,
          unreadCount,
        },
      };
    }
  },

  async markAsRead(id) {
    try {
      return await api.put(`/notifications/${id}/read`);
    } catch (err) {
      const notifs = getCollection(DB_KEYS.NOTIFICATIONS, []);
      const target = notifs.find((n) => n._id === id);
      if (target) target.isRead = true;
      setCollection(DB_KEYS.NOTIFICATIONS, notifs);
      return { success: true };
    }
  },

  async markAllAsRead() {
    try {
      return await api.put('/notifications/read-all');
    } catch (err) {
      const notifs = getCollection(DB_KEYS.NOTIFICATIONS, []);
      notifs.forEach((n) => { n.isRead = true; });
      setCollection(DB_KEYS.NOTIFICATIONS, notifs);
      return { success: true };
    }
  },
};
