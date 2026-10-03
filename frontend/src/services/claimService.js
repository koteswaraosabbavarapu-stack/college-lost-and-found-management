import api from './api';

export const claimService = {
  async submitClaim(claimData) {
    return await api.post('/claims', claimData);
  },

  async getMyClaims() {
    return await api.get('/claims/my');
  },

  async getAllClaims(params = {}) {
    return await api.get('/claims', { params });
  },

  async getClaimById(id) {
    return await api.get(`/claims/${id}`);
  },

  async approveClaim(id, data = {}) {
    return await api.put(`/claims/${id}/approve`, data);
  },

  async rejectClaim(id, data = {}) {
    return await api.put(`/claims/${id}/reject`, data);
  },

  async completeHandover(id, data = {}) {
    return await api.put(`/claims/${id}/complete`, data);
  },
};
