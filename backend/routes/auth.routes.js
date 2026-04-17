// backend/routes/auth.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');
const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email is already registered' });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
// backend/routes/auth.routes.js - Check this section
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email); // Debug log
  
  try {
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    if (user.status === 'inactive') {
      console.log('User is inactive');
      return res.status(403).json({ message: 'Your account is deactivated. Please contact the admin.' });
    }
    
    const match = await user.matchPassword(password);
    console.log('Password match:', match);
    
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    const token = generateToken(user._id);
    console.log('Login successful, token generated');
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// PUT /api/auth/profile
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.name) user.name = req.body.name;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.file) user.profilePic = req.file.filename;
    await user.save();

    const updated = await User.findById(user._id).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Add this to your existing auth.routes.js file

// POST /api/auth/forgot-password - Send password reset email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Please provide an email address' });
  }
  
  try {
    const user = await User.findOne({ email });
    
    // For security, don't reveal if user exists or not
    if (!user) {
      return res.status(200).json({ message: 'If an account exists with that email, a reset link has been sent.' });
    }
    
    // Generate a password reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { id: user._id, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Save the reset token to the user document (optional)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // In a real application, you would send an email here
    // For development, just return the token in the response
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    res.status(200).json({ 
      message: 'If an account exists with that email, a reset link has been sent.',
      // Remove this in production - only for testing
      devToken: resetToken 
    });
    
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to process request. Please try again.' });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Please provide token and new password' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Check if token matches and is not expired
    if (user.resetPasswordToken !== token || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Reset token is invalid or has expired' });
    }
    
    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Password has been reset successfully. Please login with your new password.' });
    
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ message: 'Reset token is invalid or has expired' });
  }
});

module.exports = router;