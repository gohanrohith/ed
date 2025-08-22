// models/Chapter.js
const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSubject',
    required: true
  },
  chapterName: {
    type: String,
    required: true,
    trim: true
  }
});

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
