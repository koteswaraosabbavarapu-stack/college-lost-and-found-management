const express = require('express');
const router = express.Router();
const {
  getStatistics,
  getUsers,
  updateUser,
  deleteUser,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Statistics is accessible to both SECURITY and ADMIN
router.get('/statistics', protect, authorize('SECURITY', 'ADMIN'), getStatistics);

// Full user management and audit trails restricted to ADMIN
router.get('/users', protect, authorize('ADMIN'), getUsers);
router.put('/users/:id', protect, authorize('ADMIN'), updateUser);
router.delete('/users/:id', protect, authorize('ADMIN'), deleteUser);
router.get('/audit-logs', protect, authorize('ADMIN'), getAuditLogs);

module.exports = router;
