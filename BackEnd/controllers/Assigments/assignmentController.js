const Assignment = require("../../models/Assigments/Assignment");

// Create a new assignment
exports.createAssignment = async (req, res) => {
    try {
        const newAssignment = new Assignment(req.body);
        await newAssignment.save();
        res.status(201).json({ message: "Assignment created successfully", assignment: newAssignment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all assignments
exports.getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find().populate("createdBy", "name email");
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single assignment by ID
exports.getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate("createdBy", "name email");
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });
        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an assignment
exports.updateAssignment = async (req, res) => {
    try {
        const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAssignment) return res.status(404).json({ message: "Assignment not found" });
        res.status(200).json({ message: "Assignment updated", assignment: updatedAssignment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an assignment
exports.deleteAssignment = async (req, res) => {
    try {
        const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
        if (!deletedAssignment) return res.status(404).json({ message: "Assignment not found" });
        res.status(200).json({ message: "Assignment deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Get assignments by createdBy (Admin ID)
exports.getAssignmentsByCreatedBy = async (req, res) => {
    try {
        const assignments = await Assignment.find({ createdBy: req.params.createdBy })
            .populate("createdBy", "name email");  // Populating the createdBy field with Admin's name and email
        if (assignments.length === 0) {
            return res.status(404).json({ message: "No assignments found for this admin" });
        }
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
