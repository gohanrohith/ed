const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();
const Student = require("../models/Student");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "3h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables.");
}

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};


// Register a new admin
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, mobile_number, password } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      mobile_number,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate a 100-character token
    const payload = { id: admin._id, email: admin.email };
    const token = generateToken(payload);

    res.status(200).json({
      message: "Login successful.",
      token, // Send the 100-character token
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobile_number: admin.mobile_number,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.id; // Retrieved from the `authenticateAdmin` middleware

    // Fetch the admin details from the database
    const admin = await Admin.findById(adminId).select("-password"); // Exclude password
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    res.status(200).json({
      message: "Profile fetched successfully.",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobile_number: admin.mobile_number,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const jwtPart = token.split(".").slice(0, 3).join("."); // Extract the valid JWT structure
    const decoded = jwt.verify(jwtPart, JWT_SECRET);

    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired." });
    }
    res.status(401).json({ message: "Invalid token." });
  }
};
// Fetch all students associated with a specific admin
exports.getStudentsByAdminId = async (req, res) => {
  try {
    const adminId = req.admin.id; // Retrieved from the `authenticateAdmin` middleware

    // Fetch students associated with this admin
    const students = await Student.find({ admin_id: adminId });

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for this admin." });
    }

    res.status(200).json({
      message: "Students fetched successfully.",
      students: students.map((student) => ({
        id: student._id,
        name: student.name,
        email: student.email,
        mobile_number: student.mobile_number,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get all admins - Accessible only by SuperAdmin
exports.getAllAdmins = async (req, res) => {
  try {
    // Ensure that the request is authenticated as SuperAdmin
    if (!req.superAdmin) {
      return res.status(403).json({ message: "Access denied. You must be a SuperAdmin to view this." });
    }

    // Fetch all admins including their passwords
    const admins = await Admin.find().select("-__v"); // Exclude __v field from results

    // Check if admins are found
    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "No admins found." });
    }

    // Return all admins including their passwords
    res.status(200).json({
      message: "Admins fetched successfully.",
      admins: admins.map((admin) => ({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobile_number: admin.mobile_number,
        password: admin.password, // Include password
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins", error: error.message });
  }
};
// Add a new admin - Accessible only by SuperAdmin
exports.addAdmin = async (req, res) => {
  try {
    // Ensure that the request is authenticated as SuperAdmin
    if (!req.superAdmin) {
      return res.status(403).json({ message: "Access denied. You must be a SuperAdmin to add an admin." });
    }

    const { name, email, mobile_number, password } = req.body;

    // Check if the email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = new Admin({
      name,
      email,
      mobile_number,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin added successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Delete an admin - Accessible only by SuperAdmin
exports.deleteAdmin = async (req, res) => {
  try {
    // Ensure that the request is authenticated as SuperAdmin
    if (!req.superAdmin) {
      return res.status(403).json({ message: "Access denied. You must be a SuperAdmin to delete an admin." });
    }

    const { adminId } = req.params;

    // Check if the admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // Delete the admin
    await Admin.findByIdAndDelete(adminId);

    res.status(200).json({ message: "Admin deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
