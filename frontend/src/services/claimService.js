import api from './api';
import { getCollection, setCollection, DB_KEYS } from './mockStorage';
import { authService } from './authService';

export const claimService = {
  async submitClaim(claimData) {
    try {
      return await api.post('/claims', claimData);
    } catch (err) {
      const currentUser = authService.getCurrentUser() || { _id: 'usr_student', name: 'Student' };
      const items = getCollection(DB_KEYS.ITEMS, []);
      const claims = getCollection(DB_KEYS.CLAIMS, []);

      const targetItem = items.find((i) => i._id === claimData.itemId);
      if (!targetItem) throw new Error('Item not found');

      const newClaim = {
        _id: 'claim_' + Date.now(),
        item: targetItem,
        claimant: currentUser,
        verificationAnswers: claimData.verificationAnswers,
        proofImage: claimData.proofImage || '',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      claims.unshift(newClaim);
      setCollection(DB_KEYS.CLAIMS, claims);

      return {
        success: true,
        data: { claim: newClaim },
        message: 'Claim submitted successfully for security verification!',
      };
    }
  },

  async getMyClaims() {
    try {
      return await api.get('/claims/my');
    } catch (err) {
      const currentUser = authService.getCurrentUser();
      const claims = getCollection(DB_KEYS.CLAIMS, []);
      const userClaims = currentUser ? claims.filter((c) => c.claimant?._id === currentUser._id || c.claimant === currentUser._id) : claims;
      return { success: true, data: { claims: userClaims } };
    }
  },

  async getAllClaims(params = {}) {
    try {
      return await api.get('/claims', { params });
    } catch (err) {
      let claims = getCollection(DB_KEYS.CLAIMS, []);
      if (params.status && params.status !== 'ALL') {
        claims = claims.filter((c) => c.status === params.status);
      }
      return { success: true, data: { claims } };
    }
  },

  async getClaimById(id) {
    try {
      return await api.get(`/claims/${id}`);
    } catch (err) {
      const claims = getCollection(DB_KEYS.CLAIMS, []);
      const claim = claims.find((c) => c._id === id);
      if (!claim) throw new Error('Claim not found');
      return { success: true, data: { claim } };
    }
  },

  async approveClaim(id, data = {}) {
    try {
      return await api.put(`/claims/${id}/approve`, data);
    } catch (err) {
      const claims = getCollection(DB_KEYS.CLAIMS, []);
      const claim = claims.find((c) => c._id === id);
      if (!claim) throw new Error('Claim not found');

      claim.status = 'APPROVED';
      claim.reviewComment = data.reviewComment || 'Verified by security staff against physical marks.';
      claim.reviewedAt = new Date().toISOString();

      // Update item status
      const items = getCollection(DB_KEYS.ITEMS, []);
      const item = items.find((i) => i._id === (claim.item?._id || claim.item));
      if (item) {
        item.status = 'CLAIMED';
        setCollection(DB_KEYS.ITEMS, items);
      }

      setCollection(DB_KEYS.CLAIMS, claims);
      return { success: true, data: { claim }, message: 'Claim approved successfully!' };
    }
  },

  async rejectClaim(id, data = {}) {
    try {
      return await api.put(`/claims/${id}/reject`, data);
    } catch (err) {
      const claims = getCollection(DB_KEYS.CLAIMS, []);
      const claim = claims.find((c) => c._id === id);
      if (!claim) throw new Error('Claim not found');

      claim.status = 'REJECTED';
      claim.reviewComment = data.reason || 'Verification answers did not match.';
      setCollection(DB_KEYS.CLAIMS, claims);
      return { success: true, data: { claim }, message: 'Claim rejected' };
    }
  },

  async completeHandover(id, data = {}) {
    try {
      return await api.put(`/claims/${id}/complete`, data);
    } catch (err) {
      const claims = getCollection(DB_KEYS.CLAIMS, []);
      const claim = claims.find((c) => c._id === id);
      if (!claim) throw new Error('Claim not found');

      claim.status = 'COMPLETED';
      claim.handoverDate = new Date().toISOString();
      claim.handoverNotes = data.handoverNotes || 'Handover verified at security desk';

      // Update item status
      const items = getCollection(DB_KEYS.ITEMS, []);
      const item = items.find((i) => i._id === (claim.item?._id || claim.item));
      if (item) {
        item.status = 'HANDED_OVER';
        setCollection(DB_KEYS.ITEMS, items);
      }

      setCollection(DB_KEYS.CLAIMS, claims);
      return { success: true, data: { claim }, message: 'Handover completed!' };
    }
  },
};
