const jwt = require("jsonwebtoken");
const User = require("../models/User");
const BlacklistedToken = require("../models/BlacklistedToken");

const protect = async (req, res, next) => {
  try {
    console.log("Authorization Header:", req.headers.authorization);
    
    const authHeader = req.headers.authorization;

    // 1️⃣ Check if header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Check if token is blacklisted
    const blacklisted = await BlacklistedToken.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token is blacklisted. Please login again.",
      });
    }

    // 3️⃣ Verify token
    console.log("Received Token:", token);
    console.log("JWT Secret:", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded ID:", decoded.id);
    
    // 4️⃣ Fetch full user from DB
    const user = await User.findById(decoded.id).select("-password");
    console.log("User from DB:", user);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
}
// 5️⃣ Attach user
req.user = user;
next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token failed",
    });
  }
};

module.exports = protect;
