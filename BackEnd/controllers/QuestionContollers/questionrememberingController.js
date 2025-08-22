const Question_Remember = require('../../models/Questions/Question_Remember.jsx');  // Updated import statement
const Chapter = require('../../models/Chapter');  // Assuming Chapter model exists
// Create a new question
const createQuestion = async (req, res) => {
    try {
        const { chapterId, question, options, correctAnswer, questionType, paragraph, subQuestions, adminId, solution } = req.body;

        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Invalid chapterId: Chapter not found' });
        }

        if (questionType === 'MCQ') {
            if (!options || !options.A || !options.B || !options.C || !options.D || !correctAnswer) {
                return res.status(400).json({ message: 'For MCQ, options (A, B, C, D) and correctAnswer are required' });
            }
        }

        if (questionType === 'Comprehension') {
            if (!question || !paragraph || !subQuestions || !Array.isArray(subQuestions)) {
                return res.status(400).json({ message: 'For Comprehension, question, paragraph, and subQuestions are required' });
            }

            for (const subQuestion of subQuestions) {
                if (!subQuestion.subQuestion || !subQuestion.options || !subQuestion.correctAnswer) {
                    return res.status(400).json({ message: 'Each sub-question in comprehension must have options and a correctAnswer' });
                }
                if (!subQuestion.options.A || !subQuestion.options.B || !subQuestion.options.C || !subQuestion.options.D) {
                    return res.status(400).json({ message: 'For each sub-question, options (A, B, C, D) must be provided' });
                }
            }
        }

        const newQuestion = new Question_Remember({
            chapterId,
            question,
            options,
            correctAnswer,
            questionType,
            paragraph,
            subQuestions,
            solution, // Add solution to the new question
            adminId
        });

        await newQuestion.save();
        res.status(201).json({ message: 'Question created successfully', question: newQuestion });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update question to include solution
const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, options, correctAnswer, questionType, paragraph, subQuestions, adminId, solution } = req.body;

        if (questionType === 'MCQ') {
            if (!options || !options.A || !options.B || !options.C || !options.D || !correctAnswer) {
                return res.status(400).json({ message: 'For MCQ, options (A, B, C, D) and correctAnswer are required' });
            }
        }

        if (questionType === 'Comprehension') {
            if (!question || !paragraph || !subQuestions) {
                return res.status(400).json({ message: 'For Comprehension, question, paragraph, and subQuestions are required' });
            }

            for (const subQuestion of subQuestions) {
                if (!subQuestion.subQuestion || !subQuestion.options || !subQuestion.correctAnswer) {
                    return res.status(400).json({ message: 'Each sub-question in comprehension must have options and a correctAnswer' });
                }
                if (!subQuestion.options.A || !subQuestion.options.B || !subQuestion.options.C || !subQuestion.options.D) {
                    return res.status(400).json({ message: 'For each sub-question, options (A, B, C, D) must be provided' });
                }
            }
        }

        const updatedQuestion = await Question_Remember.findByIdAndUpdate(id, {
            question,
            options,
            correctAnswer,
            questionType,
            paragraph,
            subQuestions,
            solution, // Add solution to the updated question
            adminId
        }, { new: true });

        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json({ message: 'Question updated successfully', question: updatedQuestion });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update uploadMultipleQuestions to include solution
const uploadMultipleQuestions = async (req, res) => {
    try {
        const questions = req.body.questions;
        const { adminId } = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'You must provide an array of questions to upload' });
        }

        for (const questionData of questions) {
            const { chapterId, question, options, correctAnswer, questionType, paragraph, subQuestions } = questionData;

            const chapter = await Chapter.findById(chapterId);
            if (!chapter) {
                return res.status(404).json({ message: `Invalid chapterId: Chapter not found for question "${question}"` });
            }

            if (questionType === 'MCQ') {
                if (!options || !options.A || !options.B || !options.C || !options.D || !correctAnswer) {
                    return res.status(400).json({ message: `For MCQ, options (A, B, C, D) and correctAnswer are required for question "${question}"` });
                }
            }

            if (questionType === 'Comprehension') {
                if (!question || !paragraph || !subQuestions || !Array.isArray(subQuestions)) {
                    return res.status(400).json({ message: `For Comprehension, question, paragraph, and subQuestions are required for question "${question}"` });
                }

                for (const subQuestion of subQuestions) {
                    if (!subQuestion.subQuestion || !subQuestion.options || !subQuestion.correctAnswer) {
                        return res.status(400).json({ message: `Each sub-question in comprehension must have options and a correctAnswer for sub-question "${subQuestion.subQuestion}"` });
                    }
                    if (!subQuestion.options.A || !subQuestion.options.B || !subQuestion.options.C || !subQuestion.options.D) {
                        return res.status(400).json({ message: `For each sub-question, options (A, B, C, D) must be provided for sub-question "${subQuestion.subQuestion}"` });
                    }
                }
            }
        }

        const questionsWithAdminId = questions.map(question => ({
            ...question,
            ...(adminId && { adminId })
        }));

        const newQuestions = await Question_Remember.insertMany(questionsWithAdminId);
        res.status(201).json({ message: 'Questions uploaded successfully', questions: newQuestions });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get all questions by chapter
const getQuestionsByChapter = async (req, res) => {
    try {
        const { chapterId } = req.params;

        // Fetch all questions for the chapter
        const allQuestions = await Question_Remember.find({ chapterId }).populate('chapterId', 'name');

        if (allQuestions.length === 0) {
            return res.status(404).json({ message: 'No questions found for this chapter' });
        }

        // Separate questions with adminId and without adminId
        const questionsWithAdmin = allQuestions.filter(question => question.adminId);
        const questionsWithoutAdmin = allQuestions.filter(question => !question.adminId);

        // Function to pick random questions from an array
        const pickRandomQuestions = (questions, count) => {
            const shuffled = questions.sort(() => 0.5 - Math.random()); // Shuffle the array
            return shuffled.slice(0, count); // Pick the first `count` questions
        };

        // Pick 30 questions with adminId (if available)
        const selectedWithAdmin = pickRandomQuestions(questionsWithAdmin, 30);

        // Pick 20 questions without adminId (if available)
        const selectedWithoutAdmin = pickRandomQuestions(questionsWithoutAdmin, 20);

        // Combine the selected questions
        let selectedQuestions = [...selectedWithAdmin, ...selectedWithoutAdmin];

        // If the total selected questions are less than 50, fill the remaining slots with random questions
        if (selectedQuestions.length < 50) {
            const remainingCount = 50 - selectedQuestions.length;
            const remainingQuestions = pickRandomQuestions(allQuestions, remainingCount);
            selectedQuestions = [...selectedQuestions, ...remainingQuestions];
        }

        // Shuffle the final list of 50 questions to ensure randomness
        selectedQuestions = selectedQuestions.sort(() => 0.5 - Math.random());

        res.status(200).json({ questions: selectedQuestions });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get a specific question by ID
const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the question by its ID and populate the chapter name
        const question = await Question_Remember.findById(id).populate('chapterId', 'name');
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json({ question });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete a question
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the question
        const deletedQuestion = await Question_Remember.findByIdAndDelete(id);
        if (!deletedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get all questions by chapterId (simple version, no filtering/random)
const getAllQuestionsByChapterId = async (req, res) => {
    try {
        const { chapterId } = req.params;

        // Validate if chapter exists
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        // Fetch all questions for the chapter
        const questions = await Question_Remember.find({ chapterId }).populate('chapterId', 'name');

        res.status(200).json({ questions });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    createQuestion,
    uploadMultipleQuestions,
    getQuestionsByChapter,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getAllQuestionsByChapterId
};