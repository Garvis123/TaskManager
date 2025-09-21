const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Get all users (Admin only) - for task assignment
router.get('/', [auth, roleAuth(['Admin'])], async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name email role')
      .sort({ name: 1 });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// Get members only (Admin only) - for task assignment dropdown
router.get('/members', [auth, roleAuth(['Admin'])], async (req, res) => {
  try {
    const members = await User.find({ role: 'Member', isActive: true })
      .select('name email')
      .sort({ name: 1 });
    
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Server error while fetching members' });
  }
});

module.exports = router;