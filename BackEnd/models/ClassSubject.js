// models/ClassSubject.js
const mongoose = require('mongoose');

const ClassSubjectSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  }
});

const ClassSubject = mongoose.model('ClassSubject', ClassSubjectSchema);

module.exports = ClassSubject;
