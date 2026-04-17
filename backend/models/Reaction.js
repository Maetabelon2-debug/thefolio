// backend/models/Reaction.js
const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
    required: true 
  }
}, { timestamps: true });

// Ensure one reaction per user per post
reactionSchema.index({ post: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);