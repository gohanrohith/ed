const express = require("express");
const router = express.Router();
const { getAdminProfile, loginAdmin, registerAdmin, authenticateAdmin, getStudentsByAdminId, getAllAdmins, addAdmin, deleteAdmin } = require("../controllers/adminController");
const { authenticateSuperAdmin } = require('../controllers/superAdminController'); // Make sure this path is correct

// Admin routes
// Define your route for getting all admins (SuperAdmin only)
router.get('/admins', authenticateSuperAdmin, getAllAdmins);

// Define your route for adding a new admin (SuperAdmin only)
router.post('/admins', authenticateSuperAdmin, addAdmin);

// Define your route for deleting an admin (SuperAdmin only)
router.delete('/admins/:adminId', authenticateSuperAdmin, deleteAdmin);

router.post("/login", loginAdmin);
router.post("/register", registerAdmin);
router.get("/profile", authenticateAdmin, getAdminProfile);

// Apply authenticateAdmin middleware to protect the route
router.get("/students", authenticateAdmin, getStudentsByAdminId);

module.exports = router;
