const express = require('express');
const router = express.Router();
const { createOrUpdateStudentProgress, getStudentProgress,getProgressByStudentAndChapter,getProgressByStudentId,getRecentProgressByStudentId} = require('../controllers/studentProgressDetailsController');
// POST /api/progress - Create or update progress
router.post('/studentProgress', createOrUpdateStudentProgress);

router.get('/studentProgress/:studentId', getStudentProgress);

router.get('/progress/student/:studentId', getProgressByStudentId);
router.get('/progress/student/:studentId/chapter/:chapterId', getProgressByStudentAndChapter);
router.get('/progress/recent/:studentId',getRecentProgressByStudentId);
module.exports = router;