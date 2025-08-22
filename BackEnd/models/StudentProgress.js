const mongoose = require('mongoose');

const studentProgressSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',  // Reference to the Student model
        required: true,
    },
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',  // Reference to the Chapter model
        required: true,
    },
    level: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4, 5],  // Only levels 1 to 5
    },
    score: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });  // Automatically adds createdAt and updatedAt fields

const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);
module.exports = StudentProgress;
