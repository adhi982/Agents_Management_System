const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const DistributedList = require('../models/DistributedList');
const auth = require('../middleware/auth');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Normalize column names (case insensitive)
        const normalizedData = {};
        Object.keys(data).forEach(key => {
          const normalizedKey = key.toLowerCase().trim();
          if (normalizedKey.includes('firstname') || normalizedKey.includes('first_name') || normalizedKey === 'name') {
            normalizedData.firstName = data[key].trim();
          } else if (normalizedKey.includes('phone') || normalizedKey.includes('mobile')) {
            normalizedData.phone = data[key].trim();
          } else if (normalizedKey.includes('notes') || normalizedKey.includes('note')) {
            normalizedData.notes = data[key].trim() || '';
          }
        });
        
        if (normalizedData.firstName && normalizedData.phone) {
          results.push(normalizedData);
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Function to parse Excel file
const parseExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const results = [];
    data.forEach(row => {
      const normalizedData = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toLowerCase().trim();
        if (normalizedKey.includes('firstname') || normalizedKey.includes('first_name') || normalizedKey === 'name') {
          normalizedData.firstName = String(row[key]).trim();
        } else if (normalizedKey.includes('phone') || normalizedKey.includes('mobile')) {
          normalizedData.phone = String(row[key]).trim();
        } else if (normalizedKey.includes('notes') || normalizedKey.includes('note')) {
          normalizedData.notes = String(row[key]).trim() || '';
        }
      });
      
      if (normalizedData.firstName && normalizedData.phone) {
        results.push(normalizedData);
      }
    });
    
    return results;
  } catch (error) {
    throw new Error(`Error parsing Excel file: ${error.message}`);
  }
};

// Function to distribute items among agents
const distributeItemsAmongAgents = (items, agents) => {
  const distribution = agents.map(agent => ({
    agentId: agent._id,
    agentName: agent.name,
    agentEmail: agent.email,
    items: []
  }));

  // Distribute items equally
  const itemsPerAgent = Math.floor(items.length / agents.length);
  const remainingItems = items.length % agents.length;

  let itemIndex = 0;
  
  // Distribute equal portions
  for (let i = 0; i < agents.length; i++) {
    for (let j = 0; j < itemsPerAgent; j++) {
      distribution[i].items.push(items[itemIndex]);
      itemIndex++;
    }
  }
  
  // Distribute remaining items sequentially
  for (let i = 0; i < remainingItems; i++) {
    distribution[i].items.push(items[itemIndex]);
    itemIndex++;
  }

  return distribution;
};

// @route   POST /api/upload
// @desc    Upload and distribute CSV/Excel file
// @access  Private (Admin only)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let parsedData = [];

    // Parse file based on extension
    if (fileExtension === '.csv') {
      parsedData = await parseCSV(filePath);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      parsedData = parseExcel(filePath);
    }

    if (parsedData.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        message: 'No valid data found in the file. Please ensure the file contains FirstName and Phone columns.' 
      });
    }

    // Get all active users based on current user's role
    let targetUsers;
    let targetRole;
    
    if (req.user.role === 'admin') {
      // Admin distributes to active agents they created
      targetUsers = await User.find({ 
        role: 'agent',
        isActive: true, 
        createdBy: req.user.id 
      });
      targetRole = 'agents';
    } else if (req.user.role === 'agent') {
      // Agent distributes to active sub-agents they manage
      targetUsers = await User.find({ 
        role: 'sub-agent',
        isActive: true, 
        managedBy: req.user.id 
      });
      targetRole = 'sub-agents';
    } else {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(403).json({ message: 'Unauthorized to distribute work.' });
    }
    
    if (targetUsers.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        message: `No active ${targetRole} found. Please create ${targetRole} first.` 
      });
    }

    // Distribute items among target users
    const distribution = distributeItemsAmongAgents(parsedData, targetUsers);

    // Save distributed lists to database
    const savedDistributions = [];
    for (const dist of distribution) {
      const distributedList = new DistributedList({
        agentId: dist.agentId,
        agentName: dist.agentName,
        agentEmail: dist.agentEmail,
        createdBy: req.user.id,
        items: dist.items,
        fileName: req.file.originalname,
        totalItems: dist.items.length
      });
      
      const saved = await distributedList.save();
      savedDistributions.push(saved);
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      message: 'File uploaded and distributed successfully',
      totalItems: parsedData.length,
      totalAgents: targetUsers.length,
      targetRole: targetRole,
      distributions: savedDistributions.map(dist => ({
        agentId: dist.agentId,
        agentName: dist.agentName,
        agentEmail: dist.agentEmail,
        itemCount: dist.totalItems,
        uploadDate: dist.uploadDate
      }))
    });

  } catch (error) {
    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error processing file', error: error.message });
  }
});

// @route   GET /api/upload/distributions
// @desc    Get all distributed lists (Admin sees agent distributions, Agent sees sub-agent distributions)
// @access  Private
router.get('/distributions', auth, async (req, res) => {
  try {
    const { agentId } = req.query;
    let query = { createdBy: req.user.id };
    
    // Only add agentId to query if it's provided and not 'all'
    if (agentId && agentId !== 'all') {
      try {
        // Handle the case where agentId might be a string 'null'
        if (agentId === 'null') {
          return res.json({
            message: 'Distributions retrieved successfully',
            distributions: []
          });
        }
        
        // Verify the target user belongs to current user based on role
        let targetUser;
        if (req.user.role === 'admin') {
          targetUser = await User.findOne({ 
            _id: mongoose.Types.ObjectId(agentId), 
            role: 'agent',
            createdBy: req.user.id 
          });
        } else if (req.user.role === 'agent') {
          targetUser = await User.findOne({ 
            _id: mongoose.Types.ObjectId(agentId), 
            role: 'sub-agent',
            managedBy: req.user.id 
          });
        }
        
        if (!targetUser) {
          return res.status(403).json({ 
            message: 'Access denied. User not found or not managed by you.' 
          });
        }
        
        query.agentId = mongoose.Types.ObjectId(agentId);
      } catch (error) {
        console.error('Invalid agent ID:', agentId);
        return res.status(400).json({ 
          message: 'Invalid agent ID format',
          error: error.message 
        });
      }
    }
    
    const distributions = await DistributedList.find(query)
      .populate('agentId', 'name email mobileNumber isActive')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Distributions retrieved successfully',
      distributions
    });

  } catch (error) {
    console.error('Get distributions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/upload/distributions/:agentId
// @desc    Get distributed lists for a specific agent/sub-agent
// @access  Private
router.get('/distributions/:agentId', auth, async (req, res) => {
  try {
    // Verify the target user belongs to current user based on role
    let targetUser;
    if (req.user.role === 'admin') {
      targetUser = await User.findOne({ 
        _id: req.params.agentId, 
        role: 'agent',
        createdBy: req.user.id 
      });
    } else if (req.user.role === 'agent') {
      targetUser = await User.findOne({ 
        _id: req.params.agentId, 
        role: 'sub-agent',
        managedBy: req.user.id 
      });
    }
    
    if (!targetUser) {
      return res.status(403).json({ 
        message: 'Access denied. User not found or not managed by you.' 
      });
    }
    
    const distributions = await DistributedList.find({ 
      agentId: req.params.agentId,
      createdBy: req.user.id 
    })
      .populate('agentId', 'name email mobileNumber isActive')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Agent distributions retrieved successfully',
      distributions
    });

  } catch (error) {
    console.error('Get agent distributions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/upload/distributions/:id
// @desc    Delete a distributed list
// @access  Private (Admin only)
router.delete('/distributions/:id', auth, async (req, res) => {
  try {
    const distribution = await DistributedList.findOne({ 
      _id: req.params.id,
      createdBy: req.user.id 
    });
    
    if (!distribution) {
      return res.status(404).json({ message: 'Distribution not found or access denied' });
    }

    await DistributedList.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Distribution deleted successfully'
    });

  } catch (error) {
    console.error('Delete distribution error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
