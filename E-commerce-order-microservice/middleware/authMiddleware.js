const jwt = require('jsonwebtoken');

// Middleware to authenticate a user based on the access token.
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Get token from Authorization header
  if (!token) return res.status(401).json({ message: 'Token required' });

  try {
    // Verify and decode the access token.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  

    next();  

  } catch (err) {
    // If token is invalid or expired
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
