const express = require('express');
const { addUser, getUserClassesByAdmin, updateUserClass } = require('../controllers/userController');
const router = express.Router();

// Route to add a new user
router.post('/add', addUser);

// Route to get classes and class names by adminId
router.get('/', getUserClassesByAdmin);

// Route to update user class details
router.put('/update', updateUserClass);

module.exports = router;
