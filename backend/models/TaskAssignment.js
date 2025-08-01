const mongoose = require('mongoose');

const taskAssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  attachedLeads: [{
    firstName: String,
    phone: String,
    notes: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('TaskAssignment', taskAssignmentSchema);
