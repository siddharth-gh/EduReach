import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
            token = parts[1];
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        res.status(401);
        throw new Error("Not authorized, invalid token signature");
    }
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
    }

    req.user = user;
    next();
});

export const optionalProtect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
            token = parts[1];
        }
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password");
            if (user) {
                req.user = user;
            }
        } catch (err) {
            // Silently ignore invalid tokens in optional auth
            console.error("Optional auth token verification failed:", err.message);
        }
    }
    next();
});

export default protect;
