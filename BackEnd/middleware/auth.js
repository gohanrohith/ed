const jwt = require('jsonwebtoken');

// SuperAdmin authentication middleware
const authenticateSuperAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(403).json({ message: 'No token provided, access denied.' });
  }

  try {
    // Verify the token using the secret key from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user has the 'SuperAdmin' role
    if (decoded.role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Access denied. You are not a SuperAdmin.' });
    }

    // Attach the decoded user information to the request object
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authenticateSuperAdmin;
