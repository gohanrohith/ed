const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: Number, required: true },
  section: { type: String, required: true }, // New section field added
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  mobile_number: { type: String, required: true },
  password: { type: String, required: true },
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Admin", 
    default: null // Default value is null if no admin is specified
  },
});
// Hash the password before saving the student document
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check if the password matches the hashed password
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token for login
studentSchema.methods.generateToken = function () {
  const payload = { id: this._id, email: this.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION || "1d" });
  return token;
};

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
