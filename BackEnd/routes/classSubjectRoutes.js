// routes/classSubjectRoutes.js
const express = require('express');
const router = express.Router();
const classSubjectController = require('../controllers/ClassSubjectController');

// Route to add multiple subjects for a class (single POST)
router.post('/add', classSubjectController.addSubjects);

// Route to remove a subject from a class
router.post('/remove', classSubjectController.removeSubject);

// Route to get all classes and subjects
router.get('/getAll', classSubjectController.getAllClassesSubjects);

// Get all subjects for a specific class
router.get('/subjects/:class', classSubjectController.getSubjectsByClass);

module.exports = router;
