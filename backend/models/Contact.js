// backend/models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  adminReply: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);