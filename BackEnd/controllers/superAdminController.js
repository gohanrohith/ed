const SuperAdmin = require('../models/Superadmin/SuperAdmin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register SuperAdmin
exports.registerSuperAdmin = async (req, res) => {
  const { name, email, mobileNumber, password } = req.body;

  try {
    // Check if SuperAdmin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({ $or: [{ email }, { mobileNumber }] });
    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'SuperAdmin already exists' });
    }

    // Create new SuperAdmin with name included
    const newSuperAdmin = new SuperAdmin({ name, email, mobileNumber, password });

    // Save to the database
    await newSuperAdmin.save();
    res.status(201).json({ message: 'SuperAdmin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering SuperAdmin', error: err.message });
  }
};

// Login SuperAdmin
exports.loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find SuperAdmin by email
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(404).json({ message: 'SuperAdmin not found' });
    }

    // Check if password is correct
    const isMatch = await superAdmin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: superAdmin._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

    // Return the login details with additional fields, including the name
    res.json({
      token,
      message: 'Login successful',
      superAdmin: {
        id: superAdmin._id,
        name: superAdmin.name, // Include the name field
        email: superAdmin.email,
        mobileNumber: superAdmin.mobileNumber,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in SuperAdmin', error: err.message });
  }
};

// Get SuperAdmin Profile
exports.getProfile = async (req, res) => {
  try {
    // Fetch SuperAdmin profile by ID and exclude the password
    const superAdmin = await SuperAdmin.findById(req.user.id).select('-password');
    if (!superAdmin) {
      return res.status(404).json({ message: 'SuperAdmin not found' });
    }

    // Return the profile, including the name
    res.json({
      id: superAdmin._id,
      name: superAdmin.name, // Include the name field in profile
      email: superAdmin.email,
      mobileNumber: superAdmin.mobileNumber,
      createdAt: superAdmin.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};
// superAdminController.js

exports.authenticateSuperAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure the logged-in user is a SuperAdmin
    const superAdmin = await SuperAdmin.findById(decoded.id);
    if (!superAdmin) {
      return res.status(401).json({ message: 'Access denied. Not a valid SuperAdmin.' });
    }

    req.superAdmin = superAdmin; // Save SuperAdmin data in the request object
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired.' });
    }
    res.status(401).json({ message: 'Invalid token.' });
  }
};
