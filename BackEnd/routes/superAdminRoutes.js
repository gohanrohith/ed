const express = require('express');
const { registerSuperAdmin, loginSuperAdmin, getProfile } = require('../controllers/superAdminController');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Register route
router.post('/register', registerSuperAdmin);

// Login route
router.post('/login', loginSuperAdmin);

// Profile route (protected)
router.get('/profile', authenticate, getProfile);

module.exports = router;
