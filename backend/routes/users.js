const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

// Get all users under current user's hierarchy
router.get('/', auth, async (req, res) => {
  try {
    const { role, _id } = req.user;
    let query = {};

    if (role === 'admin') {
      // Admins can see all users they created or users created by their agents
      query = {
        $or: [
          { createdBy: _id },
          { createdBy: { $in: await User.find({ createdBy: _id }).select('_id') } }
        ]
      };
    } else if (role === 'agent') {
      // Agents can see users they created
      query = { createdBy: _id };
    } else {
      // Sub-agents can only see themselves
      query = { _id: _id };
    }

    const users = await User.find(query)
      .select('-password')
      .populate('createdBy', 'name email role')
      .populate('managedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new agent (admin only)
router.post('/agent', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { name, email, password, mobileNumber } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create agent
    const agent = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      role: 'agent',
      createdBy: req.user._id,
      managedBy: req.user._id
    });

    await agent.save();

    res.status(201).json({
      message: 'Agent created successfully',
      user: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role
      }
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new sub-agent (admin and agent)
router.post('/sub-agent', auth, async (req, res) => {
  try {
    if (!['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Admin or Agent only.' });
    }

    const { name, email, password, mobileNumber } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create sub-agent
    const subAgent = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      role: 'sub-agent',
      createdBy: req.user._id,
      managedBy: req.user._id
    });

    await subAgent.save();

    res.status(201).json({
      message: 'Sub-agent created successfully',
      user: {
        id: subAgent._id,
        name: subAgent.name,
        email: subAgent.email,
        role: subAgent.role
      }
    });
  } catch (error) {
    console.error('Error creating sub-agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('createdBy', 'name email role')
      .populate('managedBy', 'name email role');

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, mobileNumber } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin can delete managers, admin/manager can delete sub-agents)
router.delete('/:id', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    if (req.user.role === 'admin') {
      // Admin can delete agents and sub-agents they created
      if (targetUser.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'agent') {
      // Agent can only delete sub-agents they created
      if (targetUser.role !== 'sub-agent' || targetUser.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team hierarchy
router.get('/hierarchy', auth, async (req, res) => {
  try {
    const { role, _id } = req.user;
    let hierarchy = {};

    if (role === 'admin') {
      // Get all agents under this admin
      const agents = await User.find({ createdBy: _id, role: 'agent' })
        .select('-password')
        .lean();

      // Get all sub-agents under this admin and their agents
      const subAgents = await User.find({
        $or: [
          { createdBy: _id, role: 'sub-agent' },
          { createdBy: { $in: agents.map(a => a._id) }, role: 'sub-agent' }
        ]
      }).select('-password').lean();

      hierarchy = {
        admin: req.user,
        agents: agents.map(agent => ({
          ...agent,
          subAgents: subAgents.filter(sa => sa.createdBy.toString() === agent._id.toString())
        })),
        directSubAgents: subAgents.filter(sa => sa.createdBy.toString() === _id.toString())
      };
    } else if (role === 'agent') {
      // Get sub-agents under this agent
      const subAgents = await User.find({ createdBy: _id, role: 'sub-agent' })
        .select('-password')
        .lean();

      hierarchy = {
        agent: req.user,
        subAgents
      };
    } else {
      hierarchy = {
        subAgent: req.user
      };
    }

    res.json(hierarchy);
  } catch (error) {
    console.error('Error fetching hierarchy:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
