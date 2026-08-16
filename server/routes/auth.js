const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tender = require("../models/Tender");
const { authenticateUser, requireSuperAdmin, JWT_SECRET } = require("../middleware/auth");

/**
 * Helper to generate JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            departmentName: user.departmentName,
            designation: user.designation,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// ==========================================
// 1. REGISTER NEW USER
// ==========================================
router.post("/register", async (req, res) => {
    try {
        const {
            fullName,
            email,
            departmentName,
            phone,
            designation,
            dob,
            password,
            confirmPassword,
        } = req.body;

        // Validation
        if (!fullName || !email || !departmentName || !phone || !designation || !dob || !password) {
            return res.status(400).json({ error: "All registration fields are required." });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ error: "An account with this email address already exists." });
        }

        const newUser = new User({
            id: Date.now(),
            fullName: fullName.trim(),
            email: normalizedEmail,
            departmentName: departmentName.trim(),
            phone: phone.trim(),
            designation: designation.trim(),
            dob: dob,
            password: password,
            role: "user",
        });

        await newUser.save();

        const token = generateToken(newUser);
        const userObj = newUser.toObject();
        delete userObj.password;

        res.status(201).json({
            message: "Account created successfully.",
            token,
            user: userObj,
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: err.message || "Failed to register user." });
    }
});

// ==========================================
// 2. LOGIN USER
// ==========================================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password." });
        }

        const token = generateToken(user);
        const userObj = user.toObject();
        delete userObj.password;

        res.json({
            message: "Login successful.",
            token,
            user: userObj,
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message || "Failed to log in." });
    }
});

// ==========================================
// 3. GET CURRENT USER PROFILE
// ==========================================
router.get("/me", authenticateUser, async (req, res) => {
    res.json(req.user);
});

// ==========================================
// 4. GET ALL USERS (SUPER ADMIN ONLY)
// ==========================================
router.get("/users", authenticateUser, requireSuperAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        
        // Fetch tender counts per user
        const tenders = await Tender.find().select("id userId");
        const tenderCounts = {};
        tenders.forEach(t => {
            if (t.userId) {
                tenderCounts[t.userId] = (tenderCounts[t.userId] || 0) + 1;
            }
        });

        const usersWithStats = users.map(u => ({
            ...u.toObject(),
            tenderCount: tenderCounts[u.id] || 0
        }));

        res.json(usersWithStats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
