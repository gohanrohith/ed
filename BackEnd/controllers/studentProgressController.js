const mongoose = require('mongoose');  // Import mongoose at the top
const StudentProgress = require('../models/StudentProgress');

// Controller to add a new progress entry for a student
const addNewProgress = async (req, res) => {
    try {
        const { studentId, chapterId, level, score } = req.body;

        // Validate the request body parameters
        if (!studentId || !chapterId || !level || score === undefined) {
            return res.status(400).json({ message: 'studentId, chapterId, level, and score are required' });
        }

        // Create a new progress entry
        const newProgress = new StudentProgress({
            studentId,
            chapterId,
            level,
            score
        });

        // Save the new progress document
        await newProgress.save();

        // Return success response with the new progress
        res.status(201).json({
            message: 'New student progress added successfully',
            newProgress
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding new student progress', error: error.message });
    }
};

// Controller to get chapter details including all student progress for that chapter
const getChapterDetails = async (req, res) => {
    try {
        const { chapterId, studentId } = req.params;

        // Validate the request parameters
        if (!chapterId || !studentId) {
            return res.status(400).json({ message: 'Chapter ID and student ID are required' });
        }

        // Find all progress entries for the given chapterId and studentId
        const chapterProgress = await StudentProgress.find({ chapterId, studentId })
            .sort({ level: 1, createdAt: 1 });  // Sort by level and timestamp (createdAt)

        if (chapterProgress.length === 0) {
            return res.status(404).json({ message: 'No progress found for the given chapterId and studentId' });
        }

        // Group progress entries by level
        const groupedProgress = chapterProgress.reduce((acc, progress) => {
            const { level, score, createdAt } = progress;
            if (!acc[level]) {
                acc[level] = [];
            }
            acc[level].push({ score, timestamp: createdAt });
            return acc;
        }, {});

        // Return the chapter details with student progress grouped by levels
        res.status(200).json({
            message: 'Chapter details with student progress retrieved successfully',
            chapterProgress: groupedProgress
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving chapter progress', error: error.message });
    }
};
const getMonthlyTopMarks = async (req, res) => {
    try {
        const { chapterId } = req.params;

        // Validate the request parameter
        if (!chapterId) {
            return res.status(400).json({ message: 'Chapter ID is required' });
        }

        // Aggregate data to get top marks for each student, grouped by month and level
        const topMarksByMonth = await StudentProgress.aggregate([
            {
                $match: { chapterId: new mongoose.Types.ObjectId(chapterId) }  // Use 'new' to create ObjectId
            },
            {
                $project: {
                    studentId: 1,
                    level: 1,
                    score: 1,
                    month: { $month: "$createdAt" },  // Extract the month from the createdAt timestamp
                    year: { $year: "$createdAt" },   // Extract the year from the createdAt timestamp
                }
            },
            {
                $group: {
                    _id: { studentId: "$studentId", level: "$level", month: "$month", year: "$year" }, // Group by studentId, level, month, and year
                    topScore: { $max: "$score" },  // Get the highest score for each group
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.level": 1 }  // Sort by year, month, and level
            },
            {
                $project: {
                    studentId: "$_id.studentId",
                    level: "$_id.level",
                    month: "$_id.month",
                    year: "$_id.year",
                    topScore: 1,
                    _id: 0
                }
            }
        ]);

        if (topMarksByMonth.length === 0) {
            return res.status(404).json({ message: 'No progress data found for the given chapter' });
        }

        // Return the monthly top scores for each level and student
        res.status(200).json({
            message: 'Monthly top marks for each level retrieved successfully',
            topMarksByMonth
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving monthly top marks', error: error.message });
    }
};
// Controller to get total attempts, level-wise attempts, and average scores for a student
const getStudentAttempts = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Validate the request parameter
        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        // Aggregate data to get attempts and scores
        const attemptsData = await StudentProgress.aggregate([
            {
                $match: { studentId: new mongoose.Types.ObjectId(studentId) }
            },
            {
                $group: {
                    _id: {
                        level: "$level"
                    },
                    levelAttempts: { $sum: 1 }, // Count attempts for each level
                    levelAvgScore: { $avg: "$score" } // Calculate average score for each level
                }
            },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: "$levelAttempts" }, // Calculate total attempts
                    overallAvgScore: { $avg: "$levelAvgScore" }, // Calculate overall average
                    levels: {
                        $push: {
                            level: "$_id.level",
                            attempts: "$levelAttempts",
                            avgScore: "$levelAvgScore"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalAttempts: 1,
                    overallAvgScore: { $round: ["$overallAvgScore", 2] }, // Round to 2 decimal places
                    levels: {
                        $map: {
                            input: "$levels",
                            as: "level",
                            in: {
                                level: "$$level.level",
                                attempts: "$$level.attempts",
                                avgScore: { $round: ["$$level.avgScore", 2] }
                            }
                        }
                    }
                }
            }
        ]);

        // Handle case when no data is found
        if (attemptsData.length === 0) {
            const emptyResponse = {
                totalAttempts: 0,
                overallAvgScore: 0,
                levels: [1, 2, 3, 4, 5].map(level => ({
                    level,
                    attempts: 0,
                    avgScore: 0
                }))
            };
            
            return res.status(404).json({ 
                message: 'No progress data found for the given student',
                data: emptyResponse
            });
        }

        // Format the response to include all levels (1-5) even if they have 0 attempts
        const result = {
            totalAttempts: attemptsData[0].totalAttempts || 0,
            overallAvgScore: attemptsData[0].overallAvgScore || 0,
            levels: [1, 2, 3, 4, 5].map(level => {
                const levelData = attemptsData[0].levels.find(l => l.level === level);
                return {
                    level,
                    attempts: levelData ? levelData.attempts : 0,
                    avgScore: levelData ? levelData.avgScore : 0
                };
            })
        };

        res.status(200).json({
            message: 'Student attempts and scores retrieved successfully',
            data: result
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Error retrieving student attempts and scores', 
            error: error.message 
        });
    }
};

// Add the new function to the exports
module.exports = { 
    addNewProgress, 
    getChapterDetails, 
    getMonthlyTopMarks,
    getStudentAttempts 
};