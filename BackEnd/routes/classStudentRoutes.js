const express = require("express");
const router = express.Router();
const { 
  getStudentByClassAndId, 
  getStudentsByClassAndAdmin,
  getStudentsAndClassesByAdmin
} = require("../controllers/classStudentController");

// Route to fetch by class and student ID
router.get("/class-student/:class/:studentId", getStudentByClassAndId);

// Route to fetch by class and admin ID
router.get("/class-admin/:class/:adminId", getStudentsByClassAndAdmin);

// Route to fetch student and class by admin ID
router.get('/students-and-classes/:adminId', getStudentsAndClassesByAdmin);;

module.exports = router;
