const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/agents
// @desc    Create a new agent
// @access  Private (Admin only)
router.post('/', auth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobileNumber').notEmpty().withMessage('Mobile number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { name, email, mobileNumber, password } = req.body;

    // Check if agent already exists
    let agent = await User.findOne({ email });
    if (agent) {
      return res.status(400).json({ message: 'Agent with this email already exists' });
    }

    // Determine role based on current user's role
    let role, agentNumber;
    if (req.user.role === 'admin') {
      // Admin creates agents
      role = 'agent';
      
      // Generate next agent number for agents
      const lastAgent = await User.findOne({ role: 'agent' }).sort({ agentNumber: -1 });
      if (lastAgent && lastAgent.agentNumber) {
        // Extract number from last agent number (e.g., AGT005 -> 5)
        const lastNumber = parseInt(lastAgent.agentNumber.replace('AGT', ''));
        agentNumber = `AGT${String(lastNumber + 1).padStart(3, '0')}`;
      } else {
        // Start with AGT001 if no agents exist
        agentNumber = 'AGT001';
      }
    } else if (req.user.role === 'agent') {
      // Agent creates sub-agents
      role = 'sub-agent';
      // Sub-agents don't need agent numbers
      agentNumber = undefined;
    } else {
      return res.status(403).json({ message: 'Unauthorized to create users' });
    }

    // Create new user
    const userData = {
      name,
      email,
      mobileNumber,
      password,
      role,
      createdBy: req.user.id
    };

    // Add agent number only for agents
    if (agentNumber) {
      userData.agentNumber = agentNumber;
    }

    // Add managedBy for sub-agents
    if (role === 'sub-agent') {
      userData.managedBy = req.user.id;
    }

    agent = new User(userData);

    await agent.save();

    // Remove password from response
    const agentResponse = agent.toObject();
    delete agentResponse.password;

    res.status(201).json({
      message: `${role === 'agent' ? 'Agent' : 'Sub-agent'} created successfully`,
      agent: agentResponse
    });

  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/agents
// @desc    Get all agents/sub-agents based on user role
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'admin') {
      // Admin sees agents they created
      query = {
        role: 'agent',
        createdBy: req.user.id 
      };
    } else if (req.user.role === 'agent') {
      // Agent sees sub-agents they manage
      query = {
        role: 'sub-agent',
        managedBy: req.user.id 
      };
    } else {
      return res.status(403).json({ message: 'Unauthorized to view users' });
    }

    const agents = await User.find(query)
      .select('-password')
      .populate('createdBy', 'name email')
      .populate('managedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      message: `${req.user.role === 'admin' ? 'Agents' : 'Sub-agents'} retrieved successfully`,
      agents,
      count: agents.length
    });

  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/agents/:id
// @desc    Get agent by ID (only if created by current admin)
// @access  Private (Admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    const agent = await User.findOne({ 
      _id: req.params.id, 
      role: 'agent',
      createdBy: req.user.id 
    }).select('-password').populate('createdBy', 'name email');
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found or access denied' });
    }

    res.json({
      message: 'Agent retrieved successfully',
      agent
    });

  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/agents/:id
// @desc    Update agent/sub-agent based on user role
// @access  Private
router.put('/:id', auth, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobileNumber').optional().notEmpty().withMessage('Mobile number cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { name, email, mobileNumber, isActive } = req.body;
    
    // Find the user based on current user's role
    let targetUser;
    if (req.user.role === 'admin') {
      // Admin can update agents they created
      targetUser = await User.findOne({ 
        _id: req.params.id, 
        role: 'agent',
        createdBy: req.user.id 
      });
    } else if (req.user.role === 'agent') {
      // Agent can update sub-agents they manage
      targetUser = await User.findOne({ 
        _id: req.params.id, 
        role: 'sub-agent',
        managedBy: req.user.id 
      });
    } else {
      return res.status(403).json({ message: 'Unauthorized to update users' });
    }
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found or access denied' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== targetUser.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
    }

    // Update fields
    if (name) targetUser.name = name;
    if (email) targetUser.email = email;
    if (mobileNumber) targetUser.mobileNumber = mobileNumber;
    
    // Handle isActive more robustly
    if ('isActive' in req.body) {
      const newStatus = req.body.isActive;
      // Convert string 'true'/'false' to boolean if needed
      if (typeof newStatus === 'string') {
        targetUser.isActive = newStatus.toLowerCase() === 'true';
      } else if (typeof newStatus === 'boolean') {
        targetUser.isActive = newStatus;
      }
    }

    await targetUser.save();

    // Remove password from response
    const userResponse = targetUser.toObject();
    delete userResponse.password;

    res.json({
      message: `${targetUser.role === 'agent' ? 'Agent' : 'Sub-agent'} updated successfully`,
      agent: userResponse
    });

  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/agents/:id
// @desc    Delete agent/sub-agent based on user role
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find the user based on current user's role
    let targetUser;
    if (req.user.role === 'admin') {
      // Admin can delete agents they created
      targetUser = await User.findOne({ 
        _id: req.params.id, 
        role: 'agent',
        createdBy: req.user.id 
      });
    } else if (req.user.role === 'agent') {
      // Agent can delete sub-agents they manage
      targetUser = await User.findOne({ 
        _id: req.params.id, 
        role: 'sub-agent',
        managedBy: req.user.id 
      });
    } else {
      return res.status(403).json({ message: 'Unauthorized to delete users' });
    }
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found or access denied' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: `${targetUser.role === 'agent' ? 'Agent' : 'Sub-agent'} deleted successfully`
    });

  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
