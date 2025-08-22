const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    class: { type: String, required: true }, // Changed from Number to String
    classSubjectId: { type: mongoose.Schema.Types.ObjectId, ref: "ClassSubject", required: true },
    section: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
