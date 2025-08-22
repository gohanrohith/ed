const express = require('express');
const router = express.Router();
const studentProgressController = require('../controllers/studentProgressController');

// POST request to add a new student progress (only studentId, chapterId, level, and score)
router.post('/add-progress', studentProgressController.addNewProgress);

// GET request to retrieve all student progress details for a specific studentId and chapterId
// Grouped by levels and sorted by timestamp
router.get('/get-chapter-details/:studentId/:chapterId', studentProgressController.getChapterDetails);

// GET request to retrieve monthly top marks for each level in a specific chapter
// Grouped by month, level, and student
router.get('/get-monthly-top-marks/:chapterId', studentProgressController.getMonthlyTopMarks);

router.get('/attempts/:studentId', studentProgressController.getStudentAttempts);
module.exports = router;
