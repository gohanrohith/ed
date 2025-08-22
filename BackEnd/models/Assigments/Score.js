const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  scoredMarks: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  timeTaken: {
    type: Number,
    required: true,
    min: 0
  },
  class: {
    type: Number,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

scoreSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

scoreSchema.pre('save', async function(next) {
  if (!this.class || !this.section) {
    try {
      const student = await mongoose.model('Student').findById(this.studentId);
      if (student) {
        this.class = student.class;
        this.section = student.section;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Score', scoreSchema);