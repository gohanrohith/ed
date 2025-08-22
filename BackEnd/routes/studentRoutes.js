const express = require('express');
const router = express.Router();
const { registerStudents, registerStudent, loginStudent, deleteStudent, getStudentProfile,getStudentsByAdminId } = require('../controllers/studentController');
const authenticate = require('../middleware/authenticateStudent');  // Import the authenticate middleware

// Register multiple students
router.post('/register/multiple', registerStudents);

// Register a single student
router.post('/register', registerStudent);

// Login a student and return their details
router.post('/login', loginStudent);

// Delete a student by ID
router.delete('/:studentId', deleteStudent);

// Fetch student profile (protected route)
router.get('/profile', authenticate, getStudentProfile);  // The authenticate middleware checks the token

// Route to fetch students by adminId
router.get('/admin/:adminId', getStudentsByAdminId);

module.exports = router;
