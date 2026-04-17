// backend/routes/reaction.routes.js
const express = require('express');
const Reaction = require('../models/Reaction');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

// GET /api/posts/:postId/reactions - Get reactions for a post
router.get('/:postId/reactions', async (req, res) => {
  try {
    const reactions = await Reaction.find({ post: req.params.postId });
    
    const reactionCounts = {
      like: 0,
      love: 0,
      laugh: 0,
      wow: 0,
      sad: 0,
      angry: 0
    };
    
    reactions.forEach(reaction => {
      reactionCounts[reaction.type]++;
    });
    
    res.json(reactionCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:postId/react - Add or remove reaction
router.post('/:postId/react', protect, async (req, res) => {
  const { reaction } = req.body;
  
  try {
    // Check if user already reacted
    const existingReaction = await Reaction.findOne({
      post: req.params.postId,
      user: req.user._id
    });
    
    if (existingReaction) {
      if (existingReaction.type === reaction) {
        // Remove reaction if same
        await existingReaction.deleteOne();
      } else {
        // Update reaction if different
        existingReaction.type = reaction;
        await existingReaction.save();
      }
    } else {
      // Add new reaction
      await Reaction.create({
        post: req.params.postId,
        user: req.user._id,
        type: reaction
      });
    }
    
    // Get updated counts
    const reactions = await Reaction.find({ post: req.params.postId });
    const reactionCounts = {
      like: 0,
      love: 0,
      laugh: 0,
      wow: 0,
      sad: 0,
      angry: 0
    };
    
    reactions.forEach(r => {
      reactionCounts[r.type]++;
    });
    
    res.json(reactionCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;