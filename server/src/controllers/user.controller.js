import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!["student", "teacher", "admin"].includes(role)) {
        res.status(400);
        throw new Error("Invalid role");
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    user.role = role;
    await user.save();

    res.json(user);
});
