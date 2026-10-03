const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  reportLostItem,
  reportFoundItem,
  updateItem,
  deleteItem,
  checkDuplicate,
} = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getItems);
router.get('/:id', optionalAuth, getItemById);
router.post('/lost', protect, reportLostItem);
router.post('/found', protect, reportFoundItem);
router.post('/check-duplicate', optionalAuth, checkDuplicate);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
