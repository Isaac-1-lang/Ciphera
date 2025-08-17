import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'investigating', 'resolved', 'monitoring', 'dismissed'],
    default: 'active'
  },
  category: {
    type: String,
    enum: ['Authentication', 'Data Loss', 'Malware', 'API Security', 'Configuration', 'Network', 'Other'],
    required: true
  },
  source: {
    type: String,
    required: true
  },
  affectedUsers: {
    type: Number,
    default: 1
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent', 'immediate'],
    required: true
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String,
    scanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scan'
    },
    relatedAlerts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    }]
  },
  tags: [String],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    notes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionTime: Number // in milliseconds
  },
  snoozeUntil: Date,
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ severity: 1, createdAt: -1 });
alertSchema.index({ category: 1, createdAt: -1 });
alertSchema.index({ priority: 1, createdAt: -1 });

// Virtual for alert age
alertSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for isOverdue
alertSchema.virtual('isOverdue').get(function() {
  if (this.priority === 'immediate' && this.age > 300000) return true; // 5 minutes
  if (this.priority === 'urgent' && this.age > 900000) return true; // 15 minutes
  if (this.priority === 'high' && this.age > 3600000) return true; // 1 hour
  return false;
});

// Method to get alert summary
alertSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    severity: this.severity,
    status: this.status,
    category: this.category,
    priority: this.priority,
    affectedUsers: this.affectedUsers,
    createdAt: this.createdAt,
    age: this.age,
    isOverdue: this.isOverdue
  };
};

// Method to get detailed alert
alertSchema.methods.getDetailed = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    severity: this.severity,
    status: this.status,
    category: this.category,
    source: this.source,
    affectedUsers: this.affectedUsers,
    priority: this.priority,
    metadata: this.metadata,
    tags: this.tags,
    assignedTo: this.assignedTo,
    resolution: this.resolution,
    snoozeUntil: this.snoozeUntil,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    age: this.age,
    isOverdue: this.isOverdue
  };
};

// Method to resolve alert
alertSchema.methods.resolve = function(userId, notes) {
  this.status = 'resolved';
  this.resolution = {
    notes,
    resolvedBy: userId,
    resolvedAt: new Date(),
    resolutionTime: Date.now() - this.createdAt.getTime()
  };
  return this.save();
};

// Method to snooze alert
alertSchema.methods.snooze = function(duration) {
  this.snoozeUntil = new Date(Date.now() + duration);
  this.status = 'monitoring';
  return this.save();
};

// Pre-save middleware to update status
alertSchema.pre('save', function(next) {
  if (this.snoozeUntil && this.snoozeUntil < new Date()) {
    this.status = 'active';
    this.snoozeUntil = undefined;
  }
  next();
});

// Apply pagination plugin
alertSchema.plugin(mongoosePaginate);

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
