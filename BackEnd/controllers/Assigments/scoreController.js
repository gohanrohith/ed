const Score = require('../../models/Assigments/Score');
const Assignment = require('../../models/Assigments/Assignment');
const Student = require('../../models/Student');

exports.submitScore = async (req, res) => {
  try {
    const { assignmentId, studentId, scoredMarks, timeTaken } = req.body;

    // Validate input
    if (!assignmentId || !studentId || scoredMarks === undefined || timeTaken === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get assignment to validate and get totalMarks
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate score doesn't exceed total marks
    if (scoredMarks > assignment.totalMarks) {
      return res.status(400).json({ 
        message: `Scored marks (${scoredMarks}) cannot exceed total marks (${assignment.totalMarks})`
      });
    }

    // Create or update score
    let score = await Score.findOneAndUpdate(
      { assignmentId, studentId },
      {
        scoredMarks,
        totalMarks: assignment.totalMarks,
        timeTaken,
        class: student.class,
        section: student.section
      },
      { new: true, upsert: true }
    ).populate('studentId', 'name email').populate('assignmentId', 'title');

    res.status(201).json(score);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getScoresByAssignment = async (req, res) => {
  try {
    const scores = await Score.find({ assignmentId: req.params.assignmentId })
      .populate('studentId', 'name email class section')
      .sort({ scoredMarks: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getScoresByStudent = async (req, res) => {
  try {
    const scores = await Score.find({ studentId: req.params.studentId })
      .populate('assignmentId', 'title description class section startTime endTime totalMarks')
      .sort({ submittedAt: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getScoresByClassSection = async (req, res) => {
  try {
    const scores = await Score.find({
      class: req.params.class,
      section: req.params.section
    })
    .populate('studentId', 'name email')
    .populate('assignmentId', 'title description')
    .sort({ scoredMarks: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getScoreById = async (req, res) => {
  try {
    const score = await Score.findById(req.params.id)
      .populate('studentId', 'name email class section')
      .populate('assignmentId', 'title description totalMarks');
    if (!score) return res.status(404).json({ message: 'Score not found' });
    res.json(score);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteScore = async (req, res) => {
  try {
    const score = await Score.findByIdAndDelete(req.params.id);
    if (!score) return res.status(404).json({ message: 'Score not found' });
    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getScoreByAssignmentAndStudent = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;

    if (!assignmentId || !studentId) {
      return res.status(400).json({ message: 'assignmentId and studentId are required in params' });
    }

    const score = await Score.findOne({ assignmentId, studentId })
      .populate('studentId', 'name email class section')
      .populate('assignmentId', 'title totalMarks');

    if (!score) {
      return res.status(404).json({ message: 'Score not found for the given student and assignment' });
    }

    res.json(score);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
