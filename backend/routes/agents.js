const express = require('express');
const { body, validationResult } = require('express-validator');
const Agent = require('../models/Agent');
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
    let agent = await Agent.findOne({ email });
    if (agent) {
      return res.status(400).json({ message: 'Agent with this email already exists' });
    }

    // Create new agent
    agent = new Agent({
      name,
      email,
      mobileNumber,
      password
    });

    await agent.save();

    // Remove password from response
    const agentResponse = agent.toObject();
    delete agentResponse.password;

    res.status(201).json({
      message: 'Agent created successfully',
      agent: agentResponse
    });

  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/agents
// @desc    Get all agents
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      message: 'Agents retrieved successfully',
      agents,
      count: agents.length
    });

  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/agents/:id
// @desc    Get agent by ID
// @access  Private (Admin only)
router.get('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
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
// @desc    Update agent
// @access  Private (Admin only)
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
    
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== agent.email) {
      const existingAgent = await Agent.findOne({ email });
      if (existingAgent) {
        return res.status(400).json({ message: 'Agent with this email already exists' });
      }
    }

    // Update fields
    if (name) agent.name = name;
    if (email) agent.email = email;
    if (mobileNumber) agent.mobileNumber = mobileNumber;
    if (typeof isActive === 'boolean') agent.isActive = isActive;

    await agent.save();

    // Remove password from response
    const agentResponse = agent.toObject();
    delete agentResponse.password;

    res.json({
      message: 'Agent updated successfully',
      agent: agentResponse
    });

  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/agents/:id
// @desc    Delete agent
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    await Agent.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Agent deleted successfully'
    });

  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
