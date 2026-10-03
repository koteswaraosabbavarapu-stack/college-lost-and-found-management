const Item = require('../models/Item');

/**
 * Calculates match score and reasons between two items
 * @param {Object} sourceItem - The base item (LOST or FOUND)
 * @param {Object} candidateItem - The candidate item to compare against
 * @returns {Object} Match details { score, percentage, breakdown }
 */
const calculateItemMatch = (sourceItem, candidateItem) => {
  let score = 0;
  const breakdown = [];

  // 1. Category Match (30 pts)
  if (
    sourceItem.category &&
    candidateItem.category &&
    sourceItem.category.toLowerCase() === candidateItem.category.toLowerCase()
  ) {
    score += 30;
    breakdown.push({
      criterion: 'Category Match',
      points: 30,
      maxPoints: 30,
      detail: `Both items categorized as "${sourceItem.category}"`,
    });
  } else {
    breakdown.push({
      criterion: 'Category Match',
      points: 0,
      maxPoints: 30,
      detail: `Category mismatch: "${sourceItem.category}" vs "${candidateItem.category}"`,
    });
  }

  // 2. Brand Match (20 pts)
  const sourceBrand = (sourceItem.brand || '').trim().toLowerCase();
  const candidateBrand = (candidateItem.brand || '').trim().toLowerCase();

  if (sourceBrand && candidateBrand) {
    if (sourceBrand === candidateBrand) {
      score += 20;
      breakdown.push({
        criterion: 'Brand Match',
        points: 20,
        maxPoints: 20,
        detail: `Exact brand match: "${sourceItem.brand}"`,
      });
    } else if (sourceBrand.includes(candidateBrand) || candidateBrand.includes(sourceBrand)) {
      score += 15;
      breakdown.push({
        criterion: 'Brand Match',
        points: 15,
        maxPoints: 20,
        detail: `Partial brand similarity: "${sourceItem.brand}" ~ "${candidateItem.brand}"`,
      });
    } else {
      breakdown.push({
        criterion: 'Brand Match',
        points: 0,
        maxPoints: 20,
        detail: `Different brands: "${sourceItem.brand}" vs "${candidateItem.brand}"`,
      });
    }
  } else if (!sourceBrand && !candidateBrand) {
    // Both unbranded, give neutral partial points
    score += 5;
    breakdown.push({
      criterion: 'Brand Match',
      points: 5,
      maxPoints: 20,
      detail: 'No specific brand specified on both reports',
    });
  } else {
    breakdown.push({
      criterion: 'Brand Match',
      points: 0,
      maxPoints: 20,
      detail: 'One report has brand specified, other does not',
    });
  }

  // 3. Color Match (15 pts)
  const sourceColor = (sourceItem.color || '').trim().toLowerCase();
  const candidateColor = (candidateItem.color || '').trim().toLowerCase();

  if (sourceColor && candidateColor) {
    if (sourceColor === candidateColor) {
      score += 15;
      breakdown.push({
        criterion: 'Color Match',
        points: 15,
        maxPoints: 15,
        detail: `Exact color match: "${sourceItem.color}"`,
      });
    } else if (sourceColor.includes(candidateColor) || candidateColor.includes(sourceColor)) {
      score += 10;
      breakdown.push({
        criterion: 'Color Match',
        points: 10,
        maxPoints: 15,
        detail: `Similar color shade: "${sourceItem.color}" ~ "${candidateItem.color}"`,
      });
    } else {
      breakdown.push({
        criterion: 'Color Match',
        points: 0,
        maxPoints: 15,
        detail: `Different colors: "${sourceItem.color}" vs "${candidateItem.color}"`,
      });
    }
  } else {
    breakdown.push({
      criterion: 'Color Match',
      points: 0,
      maxPoints: 15,
      detail: 'Color attribute not specified on both items',
    });
  }

  // 4. Location Match / Similarity (15 pts)
  const sourceLoc = (sourceItem.location || '').trim().toLowerCase();
  const candidateLoc = (candidateItem.location || '').trim().toLowerCase();

  if (sourceLoc && candidateLoc) {
    if (sourceLoc === candidateLoc) {
      score += 15;
      breakdown.push({
        criterion: 'Location Similarity',
        points: 15,
        maxPoints: 15,
        detail: `Same campus location: "${sourceItem.location}"`,
      });
    } else if (sourceLoc.includes(candidateLoc) || candidateLoc.includes(sourceLoc)) {
      score += 10;
      breakdown.push({
        criterion: 'Location Similarity',
        points: 10,
        maxPoints: 15,
        detail: `Nearby campus zone: "${sourceItem.location}" ~ "${candidateItem.location}"`,
      });
    } else {
      breakdown.push({
        criterion: 'Location Similarity',
        points: 0,
        maxPoints: 15,
        detail: `Different locations: "${sourceItem.location}" vs "${candidateItem.location}"`,
      });
    }
  }

  // 5. Date Proximity (10 pts)
  if (sourceItem.date && candidateItem.date) {
    const srcDate = new Date(sourceItem.date).getTime();
    const candDate = new Date(candidateItem.date).getTime();
    const diffDays = Math.abs((srcDate - candDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      score += 10;
      breakdown.push({
        criterion: 'Date Proximity',
        points: 10,
        maxPoints: 10,
        detail: `Reported within 24 hours (diff: ${Math.round(diffDays)} day)`,
      });
    } else if (diffDays <= 4) {
      score += 8;
      breakdown.push({
        criterion: 'Date Proximity',
        points: 8,
        maxPoints: 10,
        detail: `Reported within 4 days (diff: ${Math.round(diffDays)} days)`,
      });
    } else if (diffDays <= 10) {
      score += 5;
      breakdown.push({
        criterion: 'Date Proximity',
        points: 5,
        maxPoints: 10,
        detail: `Reported within 10 days (diff: ${Math.round(diffDays)} days)`,
      });
    } else {
      breakdown.push({
        criterion: 'Date Proximity',
        points: 0,
        maxPoints: 10,
        detail: `Dates farther apart (${Math.round(diffDays)} days)`,
      });
    }
  }

  // 6. Description & Title Keywords Match (10 pts)
  const stopWords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'is', 'it', 'my', 'with', 'was', 'i', 'lost', 'found', 'have', 'has', 'near', 'by'
  ]);

  const extractTokens = (text) => {
    return (text || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
  };

  const srcTokens = new Set([
    ...extractTokens(sourceItem.title),
    ...extractTokens(sourceItem.description),
    ...extractTokens(sourceItem.identifyingFeatures),
  ]);

  const candTokens = new Set([
    ...extractTokens(candidateItem.title),
    ...extractTokens(candidateItem.description),
    ...extractTokens(candidateItem.identifyingFeatures),
  ]);

  let commonTokens = 0;
  const commonWords = [];
  srcTokens.forEach((token) => {
    if (candTokens.has(token)) {
      commonTokens++;
      if (commonWords.length < 5) commonWords.push(token);
    }
  });

  if (commonTokens >= 3) {
    score += 10;
    breakdown.push({
      criterion: 'Keyword Similarity',
      points: 10,
      maxPoints: 10,
      detail: `High keyword overlap (${commonTokens} common words: ${commonWords.join(', ')})`,
    });
  } else if (commonTokens >= 1) {
    score += 5;
    breakdown.push({
      criterion: 'Keyword Similarity',
      points: 5,
      maxPoints: 10,
      detail: `Moderate keyword overlap (${commonTokens} common words: ${commonWords.join(', ')})`,
    });
  } else {
    breakdown.push({
      criterion: 'Keyword Similarity',
      points: 0,
      maxPoints: 10,
      detail: 'No distinctive keywords in common',
    });
  }

  return {
    score,
    percentage: Math.min(score, 100),
    breakdown,
  };
};

/**
 * Finds all potential matches for a given item
 * @param {string} itemId - The ID of the item
 * @param {number} minScore - Minimum match threshold (default 30)
 */
const findMatchesForItem = async (itemId, minScore = 30) => {
  const sourceItem = await Item.findById(itemId);
  if (!sourceItem) {
    throw new Error('Item not found');
  }

  // If source is LOST, look for FOUND items. If source is FOUND, look for LOST items.
  const targetType = sourceItem.type === 'LOST' ? 'FOUND' : 'LOST';

  // Find candidate items of opposite type that are ACTIVE or CLAIMED
  const candidates = await Item.find({
    type: targetType,
    status: { $in: ['ACTIVE', 'CLAIMED'] },
    _id: { $ne: sourceItem._id },
  }).populate('reportedBy', 'name email collegeId phone');

  const matches = [];

  for (const candidate of candidates) {
    const matchResult = calculateItemMatch(sourceItem, candidate);
    if (matchResult.score >= minScore) {
      matches.push({
        item: candidate,
        score: matchResult.score,
        percentage: matchResult.percentage,
        breakdown: matchResult.breakdown,
      });
    }
  }

  // Sort descending by match score
  matches.sort((a, b) => b.score - a.score);

  return {
    sourceItem,
    targetType,
    totalCandidatesChecked: candidates.length,
    matchCount: matches.length,
    matches,
  };
};

/**
 * Check for duplicate reports before submission
 */
const checkDuplicateReport = async (itemData, userId) => {
  const { title, category, location, date } = itemData;

  const query = {
    category,
    location,
    status: { $in: ['ACTIVE', 'CLAIMED'] },
  };

  if (date) {
    const itemDate = new Date(date);
    const start = new Date(itemDate);
    start.setDate(start.getDate() - 3);
    const end = new Date(itemDate);
    end.setDate(end.getDate() + 3);
    query.date = { $gte: start, $lte: end };
  }

  const existingItems = await Item.find(query).limit(5);

  const duplicates = [];
  for (const item of existingItems) {
    const match = calculateItemMatch(itemData, item);
    if (match.score >= 50) {
      duplicates.push({
        item,
        score: match.score,
        isOwnReport: item.reportedBy && item.reportedBy.toString() === userId?.toString(),
      });
    }
  }

  return duplicates;
};

module.exports = {
  calculateItemMatch,
  findMatchesForItem,
  checkDuplicateReport,
};
