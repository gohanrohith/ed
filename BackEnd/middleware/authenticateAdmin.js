// authenticateAdmin.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');  // Admin model

const authenticateAdmin = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract the token

  if (!token) {
    return res.status(403).json({ message: 'No token provided, access denied.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the admin
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    // Attach admin info to request
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authenticateAdmin;
