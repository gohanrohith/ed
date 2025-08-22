const mongoose = require('mongoose');

const studentProgressDetailsSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  progress: {
    remember: {
      questionCount: { type: Number, default: 0, min: 0 },
      correctCount: { type: Number, default: 0, min: 0 }
    },
    understand: {
      questionCount: { type: Number, default: 0, min: 0 },
      correctCount: { type: Number, default: 0, min: 0 }
    },
    apply: {
      questionCount: { type: Number, default: 0, min: 0 },
      correctCount: { type: Number, default: 0, min: 0 }
    },
    analyse: {
      questionCount: { type: Number, default: 0, min: 0 },
      correctCount: { type: Number, default: 0, min: 0 }
    },
    evaluate: {
      questionCount: { type: Number, default: 0, min: 0 },
      correctCount: { type: Number, default: 0, min: 0 }
    }
  },
  totalTimeInSeconds: { type: Number, default: 0, min: 0 },
  score: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

// Remove unique index to allow multiple attempts
studentProgressDetailsSchema.index({ studentId: 1, chapterId: 1, level: 1 }, { unique: false });

// Calculate score before saving
studentProgressDetailsSchema.pre('save', function(next) {
  const { remember, understand, apply, analyse, evaluate } = this.progress;
  let totalQuestions = 0;
  let correctAnswers = 0;

  [remember, understand, apply, analyse, evaluate].forEach(category => {
    totalQuestions += category.questionCount || 0;
    correctAnswers += category.correctCount || 0;
  });

  this.score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  next();
});

module.exports = mongoose.model('StudentProgressDetails', studentProgressDetailsSchema);