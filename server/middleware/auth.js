const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "tender_app_jwt_secret_key_hpu_2026";

/**
 * Authenticate incoming requests and attach user to req.user
 */
const authenticateUser = async (req, res, next) => {
    try {
        let token = null;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({ error: "Access denied. Authentication token required." });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ id: decoded.id }).select("-password");

        if (!user) {
            return res.status(401).json({ error: "User not found or session expired." });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

/**
 * Require Super Admin role
 */
const requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "superadmin") {
        return res.status(403).json({ error: "Forbidden: Super Administrator access required." });
    }
    next();
};

/**
 * Optional user attachment (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findOne({ id: decoded.id }).select("-password");
            if (user) req.user = user;
        }
    } catch (e) {}
    next();
};

module.exports = {
    authenticateUser,
    requireSuperAdmin,
    optionalAuth,
    JWT_SECRET,
};
