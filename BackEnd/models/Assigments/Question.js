const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
    text: { type: String },
    image: { type: String } // URL or Base64 encoded image
});

const subQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    paragraph: { type: String }, // Used only if questionType = "Comprehensive"
    options: {
        A: optionSchema,
        B: optionSchema,
        C: optionSchema,
        D: optionSchema
    },
    correctAnswer: [{ type: String, enum: ["A", "B", "C", "D"] }] // Supports multiple correct answers
});

const questionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    questionType: { type: String, enum: ["MCQ", "Comprehensive"], required: true }, // Defines the type of question
    question: { type: String, required: true },
    options: {
        A: optionSchema,
        B: optionSchema,
        C: optionSchema,
        D: optionSchema
    },
    correctAnswer: [{ type: String, enum: ["A", "B", "C", "D"] }], // Multi-answer support for MCQs
    subQuestions: [subQuestionSchema] // Used only for comprehensive questions
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
// Create multiple questions (MCQ or Comprehensive)
exports.createMultipleQuestions = async (req, res) => {
    try {
        const questions = req.body.questions; // Expecting an array of questions
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "Please provide an array of questions." });
        }

        const newQuestions = await Question.insertMany(questions); // Bulk insert the array of questions
        res.status(201).json({
            message: `${newQuestions.length} question(s) created successfully.`,
            questions: newQuestions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
