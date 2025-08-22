const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const superAdminRoutes = require('./routes/superAdminRoutes');
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const userRoutes = require('./routes/userRoutes');
const classSubjectRoutes = require('./routes/classSubjectRoutes');
const chapterRoutes = require('./routes/chapterRoutes');

// Question Routes
const questionRememberingRoutes = require('./routes/Questions/questionRememberingRoutes');
const questionUnderstandingRoutes = require('./routes/Questions/questionUnderstandingRoutes');
const questionEvaluatingRoutes = require('./routes/Questions/questionEvaluatingRoutes');
const questionApplyingRoutes = require('./routes/Questions/questionApplyingRoutes');
const questionAnalysingRoutes = require('./routes/Questions/questionAnalysingRoutes');

// Progress Routes
const studentProgressRoutes = require('./routes/studentProgressRoutes');
const studentProgressDetailsRoutes = require('./routes/studentProgressDetailsRoutes');

//Assigmnet Routes
const assignmentRoutes = require("./routes/Assignments/assignmentRoutes");
const questionRoutes = require("./routes/Assignments/questionRoutes");
const studentspecialRoutes = require("./routes/Assignments/studentSpecialAssignmentsRoutes");
const scoreRoutes = require('./routes/Assignments/scoreRoutes');
// Middleware
app.use(cors());
app.use(express.json());

// Route middleware
app.use('/api/superadmin', superAdminRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/students", studentRoutes);
app.use('/api/users', userRoutes);

// Subject and Chapter Routes
app.use('/api/classSubjects', classSubjectRoutes);
app.use('/api/chapters', chapterRoutes);

// Question-related Routes
app.use('/api/remember', questionRememberingRoutes);
app.use('/api/understand', questionUnderstandingRoutes);
app.use('/api/eval', questionEvaluatingRoutes);
app.use('/api/apply', questionApplyingRoutes);
app.use('/api/analyse', questionAnalysingRoutes);

// Student Progress Routes
app.use('/api/student-progress', studentProgressRoutes);
app.use('/api/student-progress-details', studentProgressDetailsRoutes);  // Route for Student Progress Details

//Assignment routes
app.use("/api/assignments", assignmentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/studentsassign", studentspecialRoutes);
app.use('/api/scores', scoreRoutes);

// Database connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
