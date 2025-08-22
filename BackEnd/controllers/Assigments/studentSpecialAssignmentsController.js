const StudentSpecialAssignments = require("../../models/Assigments/StudentSpecialAssignments");
const Assignment = require("../../models/Assigments/Assignment");

// Assign an assignment to a student (can have multiple entries for same student)
exports.assignAssignment = async (req, res) => {
    try {
        const { studentId, assignmentId } = req.body;
        
        const newAssignment = new StudentSpecialAssignments({
            studentId,
            assignmentId
        });
        
        await newAssignment.save();
        
        res.status(201).json({ 
            message: "Assignment assigned to student successfully", 
            assignment: newAssignment 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all assignments for a specific student
exports.getStudentAssignments = async (req, res) => {
    try {
        const assignments = await StudentSpecialAssignments.find({ 
            studentId: req.params.studentId 
        }).populate("assignmentId", "title description startTime endTime");
        
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all students for a specific assignment
exports.getAssignmentStudents = async (req, res) => {
    try {
        const students = await StudentSpecialAssignments.find({ 
            assignmentId: req.params.assignmentId 
        }).populate("studentId", "name email");
        
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a student assignment (e.g., change status)
exports.updateStudentAssignment = async (req, res) => {
    try {
        const updatedAssignment = await StudentSpecialAssignments.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        ).populate("assignmentId", "title description")
         .populate("studentId", "name email");
        
        if (!updatedAssignment) {
            return res.status(404).json({ message: "Student assignment not found" });
        }
        
        res.status(200).json({ 
            message: "Student assignment updated", 
            assignment: updatedAssignment 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove an assignment from a student
exports.removeStudentAssignment = async (req, res) => {
    try {
        const deletedAssignment = await StudentSpecialAssignments.findByIdAndDelete(req.params.id);
        
        if (!deletedAssignment) {
            return res.status(404).json({ message: "Student assignment not found" });
        }
        
        res.status(200).json({ message: "Assignment removed from student" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Bulk assign assignments to students
exports.bulkAssignAssignments = async (req, res) => {
    try {
        const assignments = req.body; // Array of {studentId, assignmentId} objects
        
        const createdAssignments = await StudentSpecialAssignments.insertMany(assignments);
        
        res.status(201).json({
            message: `${createdAssignments.length} assignments created successfully`,
            assignments: createdAssignments
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};