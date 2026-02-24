const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
  createQueue,
  getAllQueues,
  getMyQueues,
  getQueueById,
  joinQueue,
  leaveQueue,
  getMyActiveQueue,
  getQueueHistory,
  getQueueEntries,
  callNextUser,
  markAsServed,
  updateQueueStatus,
  getQueueAnalytics,
} = require('../controllers/queueController');

// Public routes
router.get('/', getAllQueues);

// ✅ Specific protected routes FIRST
router.get('/user/active', protect, getMyActiveQueue);
router.get('/user/history', protect, getQueueHistory);
router.get('/my-queues', protect, getMyQueues);

// ❗ Dynamic route AFTER
router.get('/:id', getQueueById);

// Join/Leave queue
router.post('/:id/join', protect, joinQueue);
router.post('/:id/leave', protect, leaveQueue);

// Admin routes
router.post('/', protect, isAdmin, createQueue);
router.get('/:id/entries', protect, isAdmin, getQueueEntries);
router.post('/:id/next', protect, isAdmin, callNextUser);
router.post('/:id/served/:entryId', protect, isAdmin, markAsServed);
router.put('/:id/status', protect, isAdmin, updateQueueStatus);
router.get('/:id/analytics', protect, isAdmin, getQueueAnalytics);

module.exports = router;