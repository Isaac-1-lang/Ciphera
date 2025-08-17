import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'file'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: function() { return this.type === 'file'; }
  },
  fileSize: {
    type: Number,
    required: function() { return this.type === 'file'; }
  },
  fileType: {
    type: String,
    required: function() { return this.type === 'file'; }
  },
  status: {
    type: String,
    enum: ['pending', 'scanning', 'completed', 'failed'],
    default: 'pending'
  },
  threats: [{
    type: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    count: {
      type: Number,
      required: true
    },
    details: String,
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 90
    }
  }],
  recommendations: [{
    type: String,
    required: true
  }],
  scanTime: {
    type: Number, // in milliseconds
    required: true
  },
  textLength: {
    type: Number,
    required: function() { return this.type === 'text'; }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String
  },
  tags: [String],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
scanSchema.index({ userId: 1, createdAt: -1 });
scanSchema.index({ status: 1, createdAt: -1 });
scanSchema.index({ 'threats.severity': 1 });
scanSchema.index({ type: 1, createdAt: -1 });

// Virtual for threat count
scanSchema.virtual('threatCount').get(function() {
  return this.threats.length;
});

// Virtual for highest severity
scanSchema.virtual('highestSeverity').get(function() {
  if (this.threats.length === 0) return 'none';
  const severityLevels = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
  return this.threats.reduce((highest, threat) => {
    return severityLevels[threat.severity] > severityLevels[highest] ? threat.severity : highest;
  }, 'low');
});

// Method to get scan summary
scanSchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.type,
    content: this.type === 'text' ? this.content.substring(0, 100) + '...' : this.fileName,
    status: this.status,
    threatCount: this.threatCount,
    highestSeverity: this.highestSeverity,
    scanTime: this.scanTime,
    createdAt: this.createdAt,
    fileSize: this.fileSize,
    textLength: this.textLength
  };
};

// Method to get detailed results
scanSchema.methods.getDetailedResults = function() {
  return {
    id: this._id,
    type: this.type,
    content: this.content,
    fileName: this.fileName,
    fileSize: this.fileSize,
    fileType: this.fileType,
    status: this.status,
    threats: this.threats,
    recommendations: this.recommendations,
    scanTime: this.scanTime,
    textLength: this.textLength,
    metadata: this.metadata,
    tags: this.tags,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Pre-save middleware to update status
scanSchema.pre('save', function(next) {
  if (this.threats.length > 0 && this.status === 'scanning') {
    this.status = 'completed';
  }
  next();
});

// Apply pagination plugin
scanSchema.plugin(mongoosePaginate);

const Scan = mongoose.model('Scan', scanSchema);

export default Scan;
