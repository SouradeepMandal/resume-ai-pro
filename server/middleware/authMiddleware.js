const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
        try {
            // Extract token from "Bearer <token>"
            const token = authHeader.split(" ")[1];

            // Verify JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user details from MongoDB (excluding password)
            req.user = await User.findById(decoded.id).select("-password");

            // Continue to the next middleware/controller
            next();

        } catch (error) {
            return res.status(401).json({
                message: "Not authorized, token failed",
            });
        }
    } else {
        return res.status(401).json({
            message: "Not authorized, no token",
        });
    }
};

module.exports = protect;