import mongoose from 'mongoose';

const trainingModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  category: {
    type: String,
    enum: ['Phishing', 'Data Protection', 'Password Security', 'Social Engineering', 'Network Security', 'Compliance'],
    required: true
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingModule'
  }],
  learningObjectives: [String],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['video', 'document', 'link', 'quiz']
    }
  }],
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    passingScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    }
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    version: {
      type: String,
      default: '1.0.0'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
trainingModuleSchema.index({ isActive: 1, order: 1 });
trainingModuleSchema.index({ category: 1, difficulty: 1 });
trainingModuleSchema.index({ tags: 1 });

// Method to get module summary
trainingModuleSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    duration: this.duration,
    difficulty: this.difficulty,
    category: this.category,
    tags: this.tags,
    order: this.order,
    isActive: this.isActive
  };
};

// Method to get full module details
trainingModuleSchema.methods.getFullDetails = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    content: this.content,
    duration: this.duration,
    difficulty: this.difficulty,
    category: this.category,
    tags: this.tags,
    order: this.order,
    isActive: this.isActive,
    prerequisites: this.prerequisites,
    learningObjectives: this.learningObjectives,
    resources: this.resources,
    quiz: this.quiz,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const TrainingModule = mongoose.model('TrainingModule', trainingModuleSchema);

export default TrainingModule;
