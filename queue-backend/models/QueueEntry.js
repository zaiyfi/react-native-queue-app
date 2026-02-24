const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema(
  {
    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Queue',
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ['waiting', 'serving', 'served', 'cancelled'],
      default: 'waiting',
    },
    joinedAt: { type: Date, default: Date.now },
    calledAt: { type: Date },
    servedAt: { type: Date },
  },
  { timestamps: true },
);

// Index for efficient queries
queueEntrySchema.index({ queue: 1, tokenNumber: 1 });
queueEntrySchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
