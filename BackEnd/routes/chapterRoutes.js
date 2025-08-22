// routes/chapterRoutes.js
const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/ChapterController');
// Route to add a chapter for a specific subject
router.post('/add', chapterController.addChapter);
// Route to get all chapters by subjectId
router.get('/get/:subjectId', chapterController.getChaptersBySubject);
// Route to delete a chapter by subject name and chapter name
router.delete('/delete', chapterController.deleteChapterBySubjectAndName);
module.exports = router;