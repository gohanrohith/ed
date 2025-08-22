const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Admin'  // Assuming there is an Admin model as well.
  },
  class: {
    type: Number,   // Class number (e.g., 1, 2, etc.)
    required: true
  },
  className: {
    type: String,   // Class name (e.g., "Class 1", "Class JEE", "Class JEE Mains", etc.)
    required: true
  }
}, { timestamps: true });

// Create and export the model
const User = mongoose.model('User', userSchema);
module.exports = User;
