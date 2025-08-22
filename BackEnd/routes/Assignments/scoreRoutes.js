const express = require('express');
const router = express.Router();
const scoreController = require('../../controllers/Assigments/scoreController');

// ✅ Submit or update score
router.post('/', scoreController.submitScore);

// ✅ Get scores by assignment ID
router.get('/assignment/:assignmentId', scoreController.getScoresByAssignment);

// ✅ Get scores by student ID
router.get('/student/:studentId', scoreController.getScoresByStudent);

// ✅ Get scores by class and section
router.get('/class/:class/section/:section', scoreController.getScoresByClassSection);

// ✅ Get specific score by ID
router.get('/:id', scoreController.getScoreById);

// ✅ Delete score
router.delete('/:id', scoreController.deleteScore);

router.get('/:assignmentId/:studentId', scoreController.getScoreByAssignmentAndStudent);

module.exports = router;
