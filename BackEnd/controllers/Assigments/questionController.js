const Question = require("../../models/Assigments/Question");

// Create a new question (MCQ or Comprehensive)
exports.createQuestion = async (req, res) => {
    try {
        const newQuestion = new Question(req.body);
        await newQuestion.save();
        res.status(201).json({ message: "Question created successfully", question: newQuestion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all questions for an assignment
exports.getQuestionsByAssignment = async (req, res) => {
    try {
        const questions = await Question.find({ assignmentId: req.params.assignmentId });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single question by ID
exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Question not found" });
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a question
exports.updateQuestion = async (req, res) => {
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedQuestion) return res.status(404).json({ message: "Question not found" });
        res.status(200).json({ message: "Question updated", question: updatedQuestion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
        if (!deletedQuestion) return res.status(404).json({ message: "Question not found" });
        res.status(200).json({ message: "Question deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
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
