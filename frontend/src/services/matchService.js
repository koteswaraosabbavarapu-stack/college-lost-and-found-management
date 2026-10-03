import api from './api';
import { getCollection, DB_KEYS, computeMockMatches } from './mockStorage';

export const matchService = {
  async getMatchesForItem(itemId, minScore = 20) {
    try {
      return await api.get(`/matches/${itemId}/matches`, {
        params: { minScore },
      });
    } catch (err) {
      const items = getCollection(DB_KEYS.ITEMS, []);
      const sourceItem = items.find((i) => i._id === itemId);
      if (!sourceItem) {
        return { success: true, data: { matches: [] } };
      }

      const matches = computeMockMatches(sourceItem, items);
      return {
        success: true,
        data: {
          sourceItem,
          matchCount: matches.length,
          matches,
        },
      };
    }
  },
};
