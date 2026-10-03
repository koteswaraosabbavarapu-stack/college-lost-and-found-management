import api from './api';

export const matchService = {
  async getMatchesForItem(itemId, minScore = 20) {
    return await api.get(`/matches/${itemId}/matches`, {
      params: { minScore },
    });
  },
};
