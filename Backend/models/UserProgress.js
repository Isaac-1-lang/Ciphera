import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingModule',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'failed'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  startDate: Date,
  completionDate: Date,
  attempts: [{
    date: {
      type: Date,
      default: Date.now
    },
    score: Number,
    timeSpent: Number,
    passed: Boolean
  }],
  quizResults: [{
    questionIndex: Number,
    userAnswer: Number,
    correct: Boolean,
    timeSpent: Number
  }],
  notes: String,
  bookmarks: [{
    timestamp: Number,
    note: String
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique user-module combination
userProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

// Indexes for better query performance
userProgressSchema.index({ userId: 1, status: 1 });
userProgressSchema.index({ userId: 1, completionDate: -1 });
userProgressSchema.index({ moduleId: 1, status: 1 });

// Virtual for isCompleted
userProgressSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Virtual for bestScore
userProgressSchema.virtual('bestScore').get(function() {
  if (this.attempts.length === 0) return null;
  return Math.max(...this.attempts.map(attempt => attempt.score || 0));
});

// Virtual for totalAttempts
userProgressSchema.virtual('totalAttempts').get(function() {
  return this.attempts.length;
});

// Method to start module
userProgressSchema.methods.startModule = function() {
  this.status = 'in_progress';
  this.startDate = new Date();
  this.lastAccessed = new Date();
  return this.save();
};

// Method to update progress
userProgressSchema.methods.updateProgress = function(progress, timeSpent) {
  this.progress = Math.min(100, Math.max(0, progress));
  this.timeSpent += timeSpent || 0;
  this.lastAccessed = new Date();
  
  if (this.progress >= 100) {
    this.status = 'completed';
    this.completionDate = new Date();
  }
  
  return this.save();
};

// Method to complete quiz attempt
userProgressSchema.methods.completeQuizAttempt = function(score, timeSpent, passed) {
  this.attempts.push({
    date: new Date(),
    score,
    timeSpent,
    passed
  });
  
  if (passed) {
    this.status = 'completed';
    this.progress = 100;
    this.completionDate = new Date();
  }
  
  this.lastAccessed = new Date();
  return this.save();
};

// Method to get progress summary
userProgressSchema.methods.getSummary = function() {
  return {
    id: this._id,
    moduleId: this.moduleId,
    status: this.status,
    progress: this.progress,
    timeSpent: this.timeSpent,
    startDate: this.startDate,
    completionDate: this.completionDate,
    totalAttempts: this.totalAttempts,
    bestScore: this.bestScore,
    lastAccessed: this.lastAccessed
  };
};

// Static method to get user's overall progress
userProgressSchema.statics.getUserOverallProgress = async function(userId) {
  const progress = await this.find({ userId }).populate('moduleId');
  
  const totalModules = progress.length;
  const completedModules = progress.filter(p => p.status === 'completed').length;
  const inProgressModules = progress.filter(p => p.status === 'in_progress').length;
  const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);
  const averageProgress = totalModules > 0 ? progress.reduce((sum, p) => sum + p.progress, 0) / totalModules : 0;
  
  return {
    totalModules,
    completedModules,
    inProgressModules,
    notStartedModules: totalModules - completedModules - inProgressModules,
    totalTimeSpent,
    averageProgress: Math.round(averageProgress),
    completionRate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
  };
};

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;
