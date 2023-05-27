const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const authenticateUser = async (req, res, next) => {
  try {
    // Get the JWT token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized access.' });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token);

    // Find the user associated with the token
    const user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized access.' });
    }

    // Store the authenticated user in the request object
    req.user = {
      userId: user._id,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized access.' });
  }
};

module.exports = {
  authenticateUser,
};
