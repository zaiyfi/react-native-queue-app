const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    maxSize: { type: Number, default: 100 },
    currentToken: { type: Number, default: 0 },
    nowServingToken: { type: Number, default: null },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
    },
    averageServiceTime: { type: Number, default: 5 }, // in minutes
  },
  { timestamps: true },
);

module.exports = mongoose.model('Queue', queueSchema);
