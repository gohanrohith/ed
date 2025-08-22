const express = require("express");
const router = express.Router();
const questionController = require("../../controllers/Assigments/questionController");

// Routes for questions
router.post("/", questionController.createQuestion);
router.get("/:assignmentId", questionController.getQuestionsByAssignment);
router.get("/:id", questionController.getQuestionById);
router.put("/:id", questionController.updateQuestion);
router.delete("/:id", questionController.deleteQuestion);
router.post("/multipleupload",questionController.createMultipleQuestions);
module.exports = router;
