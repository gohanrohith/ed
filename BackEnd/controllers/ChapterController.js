// controllers/ChapterController.js
const Chapter = require('../models/Chapter');
const ClassSubject = require('../models/ClassSubject');

// Add a chapter to a specific subject
exports.addChapter = async (req, res) => {
  try {
    const { subjectId, chapterName } = req.body;

    // Check if the subjectId exists in ClassSubject collection
    const subject = await ClassSubject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if the chapter already exists for this subject
    const existingChapter = await Chapter.findOne({
      subjectId,
      chapterName
    });

    if (existingChapter) {
      return res.status(400).json({ message: 'Chapter already exists for this subject' });
    }

    // Create and save the new chapter
    const newChapter = new Chapter({ subjectId, chapterName });
    await newChapter.save();

    res.status(201).json({
      message: 'Chapter added successfully',
      data: newChapter
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Get all chapters by subjectId
exports.getChaptersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Find all chapters for the given subjectId
    const chapters = await Chapter.find({ subjectId });

    if (chapters.length === 0) {
      return res.status(404).json({ message: 'No chapters found for this subject' });
    }

    res.status(200).json({ data: chapters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a chapter by subject name and chapter name
exports.deleteChapterBySubjectAndName = async (req, res) => {
  try {
    const { subjectName, chapterName } = req.body;

    // Find the subject by its name (assuming subject name exists)
    const subject = await ClassSubject.findOne({ subject: subjectName });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Find and delete the chapter for this subject and chapterName
    const result = await Chapter.deleteOne({
      subjectId: subject._id,
      chapterName
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Chapter not found for this subject' });
    }

    res.status(200).json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
