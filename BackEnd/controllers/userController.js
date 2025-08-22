const User = require('../models/User');

// Add a new user with adminId, class, and className
exports.addUser = async (req, res) => {
  const { adminId, class: classNumber, className } = req.body;

  try {
    const newUser = new User({
      adminId,
      class: classNumber,
      className
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding user' });
  }
};

// Get classes and class names for a specific adminId
exports.getUserClassesByAdmin = async (req, res) => {
  const { adminId } = req.query;  // Get the adminId from the query parameters

  if (!adminId) {
    return res.status(400).json({ message: 'Admin ID is required' });
  }

  try {
    // Find users for the given adminId, only select class and className fields
    const users = await User.find({ adminId })
      .select('class className');  // Only return class and className fields

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found for this admin' });
    }

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user classes' });
  }
};

// Update user class details
exports.updateUserClass = async (req, res) => {
  const { userId, class: classNumber, className } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { class: classNumber, className },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating user' });
  }
};
