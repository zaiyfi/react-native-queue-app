const Queue = require('../models/Queue');
const QueueEntry = require('../models/QueueEntry');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Create a new queue (admin)
// @route   POST /api/queues
// @access  Private (authenticated users)
exports.createQueue = async (req, res) => {
  try {
    const { name, description, maxSize, averageServiceTime } = req.body;

    const queue = await Queue.create({
      name,
      description,
      admin: req.user._id,
      maxSize: maxSize || 100,
      averageServiceTime: averageServiceTime || 5,
      status: 'active',
    });

    res.status(201).json(queue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get all queues (for users to browse)ze
// @route   GET /api/queues
// @access  Public
exports.getAllQueues = async (req, res) => {
  try {
    const queues = await Queue.find({ status: { $ne: 'closed' } })
      .populate('admin', 'email')
      .sort({ createdAt: -1 });

    // Add waiting count and now serving token to each queue
    const queuesWithCount = await Promise.all(
      queues.map(async (queue) => {
        const waitingCount = await QueueEntry.countDocuments({
          queue: queue._id,
          status: 'waiting',
        });

        // Get currently serving token
        let nowServingToken = queue.nowServingToken;
        if (!nowServingToken) {
          const servingEntry = await QueueEntry.findOne({
            queue: queue._id,
            status: 'serving',
          });
          nowServingToken = servingEntry ? servingEntry.tokenNumber : null;
        }

        return { ...queue.toObject(), waitingCount, nowServingToken };
      }),
    );

    res.json(queuesWithCount);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get queues created by current admin
// @route   GET /api/queues/my-queues
// @access  Private
exports.getMyQueues = async (req, res) => {
  try {
    const queues = await Queue.find({ admin: req.user._id }).sort({
      createdAt: -1,
    });
    // Add waiting count and now serving token to each queue
    const queuesWithCount = await Promise.all(
      queues.map(async (queue) => {
        const waitingCount = await QueueEntry.countDocuments({
          queue: queue._id,
          status: 'waiting',
        });

        // Get currently serving token
        let nowServingToken = queue.nowServingToken;
        if (!nowServingToken) {
          const servingEntry = await QueueEntry.findOne({
            queue: queue._id,
            status: 'serving',
          });
          nowServingToken = servingEntry ? servingEntry.tokenNumber : null;
        }

        return { ...queue.toObject(), waitingCount, nowServingToken };
      }),
    );

    res.json(queuesWithCount);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get single queue details
// @route   GET /api/queues/:id
// @access  Public
exports.getQueueById = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id).populate(
      'admin',
      'email',
    );

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    const waitingCount = await QueueEntry.countDocuments({
      queue: queue._id,
      status: 'waiting',
    });

    // Get currently serving token
    let nowServingToken = queue.nowServingToken;
    if (!nowServingToken) {
      const servingEntry = await QueueEntry.findOne({
        queue: queue._id,
        status: 'serving',
      });
      nowServingToken = servingEntry ? servingEntry.tokenNumber : null;
    }

    res.json({ ...queue.toObject(), waitingCount, nowServingToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Join a queue (user)
// @route   POST /api/queues/:id/join
// @access  Private
exports.joinQueue = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (queue.status === 'closed') {
      return res.status(400).json({ message: 'Queue is closed' });
    }

    if (queue.status === 'paused') {
      return res.status(400).json({ message: 'Queue is paused' });
    }

    // Check if user already has an active entry in this queue
    const existingEntry = await QueueEntry.findOne({
      user: req.user._id,
      queue: queue._id,
      status: { $in: ['waiting', 'serving'] },
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'You are already in this queue' });
    }

    // Check queue capacity
    const waitingCount = await QueueEntry.countDocuments({
      queue: queue._id,
      status: 'waiting',
    });

    if (waitingCount >= queue.maxSize) {
      return res.status(400).json({ message: 'Queue is full' });
    }

    // Generate token number
    const tokenNumber = queue.currentToken + 1;

    // Create queue entry
    const entry = await QueueEntry.create({
      queue: queue._id,
      user: req.user._id,
      tokenNumber,
    });

    // Update queue current token
    await Queue.findByIdAndUpdate(queue._id, { currentToken: tokenNumber });

    // Populate user info
    await entry.populate('user', 'email');

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Leave a queue (user)
// @route   POST /api/queues/:id/leave
// @access  Private
exports.leaveQueue = async (req, res) => {
  try {
    const entry = await QueueEntry.findOne({
      queue: req.params.id,
      user: req.user._id,
      status: 'waiting',
    });

    if (!entry) {
      return res.status(404).json({ message: 'No active entry found' });
    }

    entry.status = 'cancelled';
    await entry.save();

    res.json({ message: 'Left the queue successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get user's active queue entry
// @route   GET /api/queues/active
// @access  Private
exports.getMyActiveQueue = async (req, res) => {
  try {
    const entry = await QueueEntry.findOne({
      user: req.user._id,
      status: { $in: ['waiting', 'serving'] },
    }).populate('queue');

    if (!entry) {
      return res.json(null);
    }

    // Calculate position
    const position =
      (await QueueEntry.countDocuments({
        queue: entry.queue._id,
        status: 'waiting',
        tokenNumber: { $lt: entry.tokenNumber },
      })) + 1;

    // Get the queue's average service time (use default if not set)
    const queueData = await Queue.findById(entry.queue._id);
    const avgServiceTime = queueData?.averageServiceTime || 5;

    // Calculate estimated wait time: number of people ahead × average service time
    const peopleAhead = entry.status === 'waiting' ? position - 1 : 0;
    const estimatedWait = peopleAhead * avgServiceTime;

    res.json({
      ...entry.toObject(),
      position,
      estimatedWait,
      averageServiceTime: avgServiceTime,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get user's queue history
// @route   GET /api/queues/history
// @access  Private
exports.getQueueHistory = async (req, res) => {
  try {
    const entries = await QueueEntry.find({
      user: req.user._id,
      status: { $in: ['served', 'cancelled'] },
    })
      .populate('queue', 'name description')
      .sort({ updatedAt: -1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get queue entries (for admin)
// @route   GET /api/queues/:id/entries
// @access  Private (admin only)
exports.getQueueEntries = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const entries = await QueueEntry.find({ queue: req.params.id })
      .populate('user', 'email')
      .sort({ tokenNumber: 1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Call next user (admin)
// @route   POST /api/queues/:id/next
// @access  Private (admin only)
exports.callNextUser = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (queue.status !== 'active') {
      return res.status(400).json({ message: 'Queue is not active' });
    }

    // Find the next waiting user (lowest token number with waiting status)
    const nextEntry = await QueueEntry.findOne({
      queue: queue._id,
      status: 'waiting',
    }).sort({ tokenNumber: 1 });

    if (!nextEntry) {
      return res.status(404).json({ message: 'No users waiting' });
    }

    nextEntry.status = 'serving';
    nextEntry.calledAt = new Date();
    await nextEntry.save();

    // Update queue's now serving token
    await Queue.findByIdAndUpdate(queue._id, {
      nowServingToken: nextEntry.tokenNumber,
    });

    await nextEntry.populate('user', 'email');

    res.json(nextEntry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Mark user as served (admin)
// @route   POST /api/queues/:id/served/:entryId
// @access  Private (admin only)
exports.markAsServed = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const entry = await QueueEntry.findById(req.params.entryId);

    if (!entry || entry.queue.toString() !== queue._id.toString()) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    entry.status = 'served';
    entry.servedAt = new Date();
    await entry.save();

    // Calculate service time in minutes (from calledAt to servedAt)
    let serviceTime = queue.averageServiceTime || 5; // default
    if (entry.calledAt) {
      serviceTime = Math.round(
        (new Date(entry.servedAt) - new Date(entry.calledAt)) / 60000,
      );
      if (serviceTime < 1) serviceTime = 1; // minimum 1 minute
    }

    // Update queue: reset nowServingToken and recalculate average service time
    const totalServed = await QueueEntry.countDocuments({
      queue: queue._id,
      status: 'served',
    });

    // Get all served entries to calculate average
    const servedEntries = await QueueEntry.find({
      queue: queue._id,
      status: 'served',
      servedAt: { $exists: true },
    });

    let newAverageServiceTime = queue.averageServiceTime || 5;
    if (servedEntries.length > 0) {
      let totalTime = 0;
      let validCount = 0;
      for (const entry of servedEntries) {
        if (entry.calledAt && entry.servedAt) {
          const time = Math.round(
            (new Date(entry.servedAt) - new Date(entry.calledAt)) / 60000,
          );
          if (time > 0) {
            totalTime += time;
            validCount++;
          }
        }
      }
      if (validCount > 0) {
        newAverageServiceTime = Math.round(totalTime / validCount);
      }
    }

    await Queue.findByIdAndUpdate(queue._id, {
      nowServingToken: null,
      averageServiceTime: newAverageServiceTime,
    });

    await entry.populate('user', 'email');

    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Update queue status (pause/resume/close)
// @route   PUT /api/queues/:id/status
// @access  Private (admin only)
exports.updateQueueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['active', 'paused', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    queue.status = status;
    await queue.save();

    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get queue analytics (admin)
// @route   GET /api/queues/:id/analytics
// @access  Private (admin only)
exports.getQueueAnalytics = async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (queue.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const totalServed = await QueueEntry.countDocuments({
      queue: queue._id,
      status: 'served',
    });

    const totalCancelled = await QueueEntry.countDocuments({
      queue: queue._id,
      status: 'cancelled',
    });

    const currentlyWaiting = await QueueEntry.countDocuments({
      queue: queue._id,
      status: 'waiting',
    });

    const currentlyServing = await QueueEntry.countDocuments({
      queue: queue._id,
      status: 'serving',
    });

    // Get today's served count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayServed = await QueueEntry.countDocuments({
      queue: queue._id,
      status: 'served',
      servedAt: { $gte: today },
    });

    res.json({
      queueName: queue.name,
      totalServed,
      totalCancelled,
      currentlyWaiting,
      currentlyServing,
      todayServed,
      currentToken: queue.currentToken,
      status: queue.status,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
