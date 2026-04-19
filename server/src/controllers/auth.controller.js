import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc Signup
// @route POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Name, email and password are required");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters long");
    }

    if (role && !["student", "teacher"].includes(role)) {
        res.status(400);
        throw new Error("Invalid signup role");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "student",
    });

    res.status(201).json({
        message: "User created successfully",
        token: generateToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio,
            preferredMode: user.preferredMode,
            streakCount: user.streakCount,
            lastActiveAt: user.lastActiveAt,
        },
    });
});

// @desc Login
// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error("Invalid credentials");
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error("Invalid credentials");
    }

    res.status(200).json({
        message: "Login successful",
        token: generateToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio,
            preferredMode: user.preferredMode,
            streakCount: user.streakCount,
            lastActiveAt: user.lastActiveAt,
        },
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { name, bio, preferredMode } = req.body;

    if (preferredMode && !["normal", "low-bandwidth"].includes(preferredMode)) {
        res.status(400);
        throw new Error("Invalid preferred mode");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (preferredMode) user.preferredMode = preferredMode;

    await user.save();

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        preferredMode: user.preferredMode,
        streakCount: user.streakCount,
        lastActiveAt: user.lastActiveAt,
    });
});
