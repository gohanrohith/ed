// controllers/ClassSubjectController.js
const ClassSubject = require('../models/ClassSubject');

// Add multiple subjects for a class (bulk insert)
exports.addSubjects = async (req, res) => {
  try {
    const { class: className, subjects } = req.body;

    // Check if subjects is an array and not empty
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: 'Subjects should be a non-empty array' });
    }

    // Prepare data to insert
    const classSubjects = subjects.map(subject => ({
      class: className,
      subject
    }));

    // Bulk insert all the subjects for the class
    const result = await ClassSubject.insertMany(classSubjects);

    res.status(201).json({
      message: 'Subjects added successfully',
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove a subject by class and subject name
exports.removeSubject = async (req, res) => {
  try {
    const { class: className, subject } = req.body;

    // Find and remove the subject for the class
    const result = await ClassSubject.deleteOne({ class: className, subject });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Class or Subject not found' });
    }

    res.status(200).json({ message: 'Subject removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all class-subject data
exports.getAllClassesSubjects = async (req, res) => {
  try {
    const classSubjects = await ClassSubject.find();
    res.status(200).json({ data: classSubjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// Get all subjects for a specific class
exports.getSubjectsByClass = async (req, res) => {
  try {
    const { class: className } = req.params;

    // Find subjects for the specific class
    const classSubjects = await ClassSubject.find({ class: className });

    if (classSubjects.length === 0) {
      return res.status(404).json({ message: `No subjects found for class ${className}` });
    }

    res.status(200).json({ data: classSubjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
