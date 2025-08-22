const mongoose = require("mongoose");

const studentAssignmentSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: "Student" // Assuming you have a Student model
    },
    assignmentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: "Assignment" 
    },
    // You can add additional fields like status, completion date, etc. if needed
    status: {
        type: String,
        enum: ['assigned', 'completed', 'overdue'],
        default: 'assigned'
    },
    assignedDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("StudentSpecialAssignments", studentAssignmentSchema);