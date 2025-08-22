const mongoose = require('mongoose');

const questionunderstandingSchema = new mongoose.Schema({
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        required: true
    },
    question: {
        type: String,
        required: function() {
            return this.questionType === 'Comprehension';
        }
    },
    paragraph: {
        type: String,
        required: function() {
            return this.questionType === 'Comprehension';
        }
    },
    questionType: {
        type: String,
        enum: ['MCQ', 'Comprehension'],
        required: true
    },
    options: {
        A: { 
            text: { type: String },
            image: { type: String }
        },
        B: { 
            text: { type: String },
            image: { type: String }
        },
        C: { 
            text: { type: String },
            image: { type: String }
        },
        D: { 
            text: { type: String },
            image: { type: String }
        }
    },
    correctAnswer: {
        type: [String],
        enum: ['A', 'B', 'C', 'D'],
        required: function() {
            return this.questionType === 'MCQ';
        }
    },
    solution: {  // New solution field
        type: String,
        required: false  // Optional field
    },
    subQuestions: [{
        subQuestion: { 
            type: String, 
            required: function() { 
                return this.parent().questionType === 'Comprehension'; 
            }
        },
        options: {
            A: { 
                text: { type: String, required: true },
                image: { type: String }
            },
            B: { 
                text: { type: String, required: true },
                image: { type: String }
            },
            C: { 
                text: { type: String, required: true },
                image: { type: String }
            },
            D: { 
                text: { type: String, required: true },
                image: { type: String }
            }
        },
        correctAnswer: { 
            type: [String],
            enum: ['A', 'B', 'C', 'D'], 
            required: true 
        },
        solution: {  // Solution for sub-questions
            type: String,
            required: false
        }
    }],
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Question_Understanding', questionunderstandingSchema);