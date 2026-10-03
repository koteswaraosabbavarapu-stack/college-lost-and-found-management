const express = require('express');
const router = express.Router();
const { getItemMatches } = require('../controllers/matchController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/:id/matches', optionalAuth, getItemMatches);

module.exports = router;
