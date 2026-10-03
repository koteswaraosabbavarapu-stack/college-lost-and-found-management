const express = require('express');
const router = express.Router();
const {
  createClaim,
  getMyClaims,
  getClaims,
  getClaimById,
  approveClaim,
  rejectClaim,
  completeHandover,
} = require('../controllers/claimController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, createClaim);
router.get('/my', protect, getMyClaims);
router.get('/', protect, authorize('SECURITY', 'ADMIN'), getClaims);
router.get('/:id', protect, getClaimById);
router.put('/:id/approve', protect, authorize('SECURITY', 'ADMIN'), approveClaim);
router.put('/:id/reject', protect, authorize('SECURITY', 'ADMIN'), rejectClaim);
router.put('/:id/complete', protect, authorize('SECURITY', 'ADMIN'), completeHandover);

module.exports = router;
