import api from './api';
import { getCollection, setCollection, DB_KEYS } from './mockStorage';

export const authService = {
  async register(userData) {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      return res;
    } catch (err) {
      // Standalone / Offline Web Fallback
      const users = getCollection(DB_KEYS.USERS, []);
      const exists = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
      if (exists) {
        throw new Error('An account with this email address already exists');
      }

      const idExists = users.find((u) => u.collegeId === userData.collegeId);
      if (idExists) {
        throw new Error('An account with this Student/Faculty ID already exists');
      }

      const newUser = {
        _id: 'usr_' + Date.now(),
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        collegeId: userData.collegeId.trim(),
        password: userData.password,
        role: userData.role === 'SECURITY' ? 'SECURITY' : 'USER',
        department: userData.department || 'General',
        phone: userData.phone || '',
        avatar: '',
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      setCollection(DB_KEYS.USERS, users);

      const token = 'jwt_mock_token_' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));

      return {
        success: true,
        data: { token, user: newUser },
        message: 'Account registered successfully!',
      };
    }
  },

  async login(credentials) {
    try {
      const res = await api.post('/auth/login', credentials);
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      return res;
    } catch (err) {
      // Standalone / Offline Web Fallback
      const users = getCollection(DB_KEYS.USERS, []);
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === credentials.email.toLowerCase().trim() &&
          u.password === credentials.password
      );

      if (!user) {
        throw new Error('Invalid email or password. Please verify credentials.');
      }

      if (!user.isActive) {
        throw new Error('Account deactivated. Please contact college administration.');
      }

      const token = 'jwt_mock_token_' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        data: { token, user },
        message: 'Logged in successfully!',
      };
    }
  },

  async getMe() {
    try {
      return await api.get('/auth/me');
    } catch (err) {
      const user = this.getCurrentUser();
      return { success: true, data: { user } };
    }
  },

  async updateProfile(profileData) {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data && res.data.user) {
        const current = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...current, ...res.data.user }));
      }
      return res;
    } catch (err) {
      const user = this.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const users = getCollection(DB_KEYS.USERS, []);
      const updatedUser = { ...user, ...profileData };
      const updatedList = users.map((u) => (u._id === user._id ? updatedUser : u));

      setCollection(DB_KEYS.USERS, updatedList);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return { success: true, data: { user: updatedUser }, message: 'Profile updated' };
    }
  },

  async changePassword(passwords) {
    try {
      return await api.put('/auth/change-password', passwords);
    } catch (err) {
      const user = this.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const users = getCollection(DB_KEYS.USERS, []);
      const u = users.find((item) => item._id === user._id);
      if (u && u.password !== passwords.currentPassword) {
        throw new Error('Incorrect current password');
      }

      if (u) {
        u.password = passwords.newPassword;
        setCollection(DB_KEYS.USERS, users);
      }

      return { success: true, message: 'Password changed successfully' };
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },
};
