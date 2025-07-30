const mongoose = require('mongoose');

const distributedListSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  agentName: {
    type: String,
    required: true
  },
  agentEmail: {
    type: String,
    required: true
  },
  items: [{
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  fileName: {
    type: String,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DistributedList', distributedListSchema);
