const mongoose = require('mongoose');
const StudentProgressDetails = require('../models/studentProgressDetails');

// Create or update a student's progress
const createOrUpdateStudentProgress = async (req, res) => {
  try {
    const { studentId, chapterId, level, progress, totalTimeInSeconds } = req.body;

    // Create new progress record
    const newProgress = new StudentProgressDetails({
      studentId,
      chapterId,
      level,
      progress: {
        remember: progress.remember || { questionCount: 0, correctCount: 0 },
        understand: progress.understand || { questionCount: 0, correctCount: 0 },
        apply: progress.apply || { questionCount: 0, correctCount: 0 },
        analyse: progress.analyse || { questionCount: 0, correctCount: 0 },
        evaluate: progress.evaluate || { questionCount: 0, correctCount: 0 }
      },
      totalTimeInSeconds: totalTimeInSeconds || 0
    });

    await newProgress.save();

    res.status(201).json({
      success: true,
      message: 'Progress record created successfully',
      data: newProgress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating progress record',
      error: error.message
    });
  }
};
// Get progress by studentId, chapterId, and level
const getStudentProgress = async (req, res) => {
  const { studentId, chapterId, level } = req.params;

  try {
    const progress = await StudentProgressDetails.findOne({ studentId, chapterId, level })
      .populate('chapterId', 'name');

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    return res.status(200).json({ message: 'Progress found', data: progress });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
};

// Get all progress for a student
const getProgressByStudentId = async (req, res) => {
  const { studentId } = req.params;

  try {
    const progress = await StudentProgressDetails.find({ studentId })
      .populate('chapterId', 'chapterName'); // Just include the chapterName field

    if (!progress.length) {
      return res.status(404).json({ message: 'No progress found for this student' });
    }

    res.status(200).json({ message: 'Progress found', data: progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
};


// Get all levels of progress for a specific student and chapter
const getProgressByStudentAndChapter = async (req, res) => {
  const { studentId, chapterId } = req.params;

  try {
    const progress = await StudentProgressDetails.find({ studentId, chapterId })
      .populate('chapterId', 'name');

    if (!progress || progress.length === 0) {
      return res.status(404).json({ message: 'No progress found for this student in this chapter' });
    }

    return res.status(200).json({ message: 'Progress found', data: progress });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching progress', error: error.message });
  }
};
// Get the 5 most recent progress records (absolute latest, regardless of level)
const getRecentProgressByStudentId = async (req, res) => {
  const { studentId } = req.params;
  const limit = parseInt(req.query.limit) || 5;

  try {
    // Get the most recent records without any level grouping
    const progress = await StudentProgressDetails.find({ studentId })
      .sort({ updatedAt: -1 }) // Sort by most recent first
      .limit(limit) // Take exactly N most recent
      .populate('chapterId', 'chapterName');

    if (!progress.length) {
      return res.status(404).json({ message: 'No progress found for this student' });
    }

    res.status(200).json({
      message: `Found ${progress.length} most recent attempts`,
      data: progress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error fetching progress',
      error: error.message
    });
  }
};
module.exports = {
  createOrUpdateStudentProgress,
  getStudentProgress,
  getProgressByStudentId,
  getProgressByStudentAndChapter,
  getRecentProgressByStudentId
};