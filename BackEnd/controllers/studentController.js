const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register multiple students
exports.registerStudents = async (req, res) => {
  const studentsData = req.body;  // Array of student objects

  try {
    const createdStudents = [];

    for (let studentData of studentsData) {
      const { name, class: studentClass, section, email, username, mobile_number, password, adminId } = studentData;

      // Check if the student already exists by email or username
      const studentExists = await Student.findOne({ $or: [{ email }, { username }] });

      if (studentExists) {
        return res.status(400).json({ message: 'One or more students with this email or username already exists.' });
      }

      // If adminId is not provided, set it to null
      const newAdminId = adminId || null;

      // Create a new student instance
      const newStudent = new Student({
        name,
        class: studentClass,
        section,
        email,
        username,
        mobile_number,
        password,
        adminId: newAdminId,
      });

      // Hash password before saving
      await newStudent.save();
      createdStudents.push(newStudent);
    }

    // Return the success response with the created students
    res.status(201).json({
      message: 'Students registered successfully.',
      students: createdStudents,
    });
  } catch (error) {
    console.error('Error registering students:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Register a single student (you can still use this function if you want to register one student)
exports.registerStudent = async (req, res) => {
  const { name, class: studentClass, section, email, username, mobile_number, password, adminId } = req.body;

  try {
    const studentExists = await Student.findOne({ $or: [{ email }, { username }] });

    if (studentExists) {
      return res.status(400).json({ message: 'Student with this email or username already exists.' });
    }

    const newAdminId = adminId || null;

    const newStudent = new Student({
      name,
      class: studentClass,
      section,
      email,
      username,
      mobile_number,
      password,
      adminId: newAdminId,
    });

    // Hash password before saving
    await newStudent.save();

    res.status(201).json({ message: 'Student registered successfully.', student: newStudent });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Login a student and return all their details
exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const isMatch = await student.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = student.generateToken();

    // Return the student details along with the token and sections
    res.status(200).json({
      message: 'Login successful.',
      token,
      student: {
        id: student._id,
        name: student.name,
        class: student.class,
        section: student.section, // Add section here
        email: student.email,
        username: student.username,
        mobile_number: student.mobile_number,
        adminId: student.adminId,
      },
    });
  } catch (error) {
    console.error('Error logging in student:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};


// Delete a student by ID
exports.deleteStudent = async (req, res) => {
  const { studentId } = req.params;  // studentId will be passed as a route parameter

  try {
    // Find and delete the student by their ID
    const student = await Student.findByIdAndDelete(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    res.status(200).json({ message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error during student deletion.' });
  }
};

// Function to fetch student profile based on JWT token
exports.getStudentProfile = async (req, res) => {
  try {
    // The student's ID is attached to req.student during authentication
    const studentId = req.student.id;

    // Fetch the student document from the database
    const student = await Student.findById(studentId).select('-password'); // Exclude password for security

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Return the student profile details, including student ID
    res.status(200).json({
      message: 'Student profile fetched successfully.',
      student: {
        id: student._id,  // Use student._id for the student's ID
        name: student.name,
        class: student.class,
        section: student.section,
        email: student.email,
        username: student.username,
        mobile_number: student.mobile_number,
        adminId: student.adminId,
      },
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Server error while fetching student profile.' });
  }
};

// Get students by adminId
exports.getStudentsByAdminId = async (req, res) => {
  const { adminId } = req.params;  // adminId will be passed as a route parameter

  try {
    // Find students whose adminId matches the provided adminId
    const students = await Student.find({ adminId });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for this admin.' });
    }

    // Return the list of students
    res.status(200).json({
      message: 'Students fetched successfully.',
      students: students.map(student => ({
        id: student._id,
        name: student.name,
        class: student.class,
        section: student.section,
        email: student.email,
        username: student.username,
        mobile_number: student.mobile_number,
        adminId: student.adminId,
      })),
    });
  } catch (error) {
    console.error('Error fetching students by adminId:', error);
    res.status(500).json({ message: 'Server error while fetching students by adminId.' });
  }
};
