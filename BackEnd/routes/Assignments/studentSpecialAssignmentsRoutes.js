const express = require("express");
const router = express.Router();
const studentSpecialAssignmentsController = require("../../controllers/Assigments/studentSpecialAssignmentsController");
// Assign an assignment to a student
router.post('/', studentSpecialAssignmentsController.assignAssignment);

// Get all assignments for a specific student
router.get('/student/:studentId', studentSpecialAssignmentsController.getStudentAssignments);

// Get all students for a specific assignment
router.get('/assignment/:assignmentId', studentSpecialAssignmentsController.getAssignmentStudents);

// Update a student assignment (e.g., change status)
router.put('/:id', studentSpecialAssignmentsController.updateStudentAssignment);

// Remove an assignment from a student
router.delete('/:id', studentSpecialAssignmentsController.removeStudentAssignment);

// Bulk assign assignments to students
router.post('/bulk', studentSpecialAssignmentsController.bulkAssignAssignments);

module.exports = router;
