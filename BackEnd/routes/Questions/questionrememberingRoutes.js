const express = require('express');
const router = express.Router();
const questionController = require('../../controllers/QuestionContollers/questionrememberingController');  // Updated controller name

// Create a new question
router.post('/questions', questionController.createQuestion);
//create upload for muktiple questions
router.post('/upload', questionController.uploadMultipleQuestions);
// Get all questions by chapter
router.get('/questions/:chapterId', questionController.getQuestionsByChapter);

// Get a specific question by ID
router.get('/question/:id', questionController.getQuestionById);

// Update a question
router.put('/question/:id', questionController.updateQuestion);

// Delete a question
router.delete('/question/:id', questionController.deleteQuestion);
router.get('/questions/chapter/:chapterId/all',questionController.getAllQuestionsByChapterId);
module.exports = router;
