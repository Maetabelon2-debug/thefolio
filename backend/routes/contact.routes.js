// backend/routes/contact.routes.js
const express = require('express');
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');
const router = express.Router();

// POST /api/contact - Send contact message (Public)
router.post('/', async (req, res) => {
  const { name, email, subject, message, userId } = req.body;
  
  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (message.length < 10) {
    return res.status(400).json({ message: 'Message must be at least 10 characters' });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }
  
  try {
    // Save to database
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      userId: userId || null,
      status: 'unread'
    });
    
    console.log('New contact message saved:', {
      id: contact._id,
      from: `${name} (${email})`,
      subject: subject
    });
    
    res.status(200).json({ 
      success: true,
      message: 'Message sent successfully! The admin will respond within 24-48 hours.',
      contactId: contact._id
    });
    
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

// GET /api/contact/admin/messages - Get all messages (Admin only)
router.get('/admin/messages', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Contact.find()
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// PUT /api/contact/admin/messages/:id/read - Mark message as read (Admin only)
router.put('/admin/messages/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    message.status = 'read';
    await message.save();
    
    res.json({ message: 'Message marked as read', message });
  } catch (err) {
    console.error('Error marking message as read:', err);
    res.status(500).json({ message: 'Error updating message' });
  }
});

// PUT /api/contact/admin/messages/:id/reply - Reply to message (Admin only)
router.put('/admin/messages/:id/reply', protect, adminOnly, async (req, res) => {
  const { reply } = req.body;
  
  if (!reply || reply.trim() === '') {
    return res.status(400).json({ message: 'Reply message is required' });
  }
  
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    message.adminReply = reply;
    message.status = 'replied';
    message.repliedAt = new Date();
    await message.save();
    
    // Here you would also send an email to the user
    // For now, just save to database
    
    res.json({ 
      message: 'Reply saved successfully', 
      contact: message 
    });
  } catch (err) {
    console.error('Error saving reply:', err);
    res.status(500).json({ message: 'Error saving reply' });
  }
});

// DELETE /api/contact/admin/messages/:id - Delete message (Admin only)
router.delete('/admin/messages/:id', protect, adminOnly, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: 'Error deleting message' });
  }
});

module.exports = router;