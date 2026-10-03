const { findMatchesForItem } = require('../services/matchingService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get explainable potential matches for an item
 * @route   GET /api/items/:id/matches
 * @access  Public / Authenticated
 */
const getItemMatches = async (req, res, next) => {
  try {
    const { minScore = 20 } = req.query;
    const matchData = await findMatchesForItem(req.params.id, parseInt(minScore, 10));

    return sendSuccess(res, 200, matchData, 'Item matches computed successfully');
  } catch (error) {
    if (error.message === 'Item not found') {
      return sendError(res, 404, 'Item not found');
    }
    next(error);
  }
};

module.exports = {
  getItemMatches,
};
