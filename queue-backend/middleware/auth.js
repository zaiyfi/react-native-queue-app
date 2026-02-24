const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes - verifies JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Middleware to check if user is admin of a queue
const isQueueAdmin = async (req, res, next) => {
  const { queueId } = req.body;

  if (!queueId) {
    return res.status(400).json({ message: 'Queue ID required' });
  }

  const Queue = require('../models/Queue');
  const queue = await Queue.findById(queueId);

  if (!queue) {
    return res.status(404).json({ message: 'Queue not found' });
  }

  if (queue.admin.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: 'Not authorized to manage this queue' });
  }

  next();
};

module.exports = { protect, isAdmin, isQueueAdmin };
