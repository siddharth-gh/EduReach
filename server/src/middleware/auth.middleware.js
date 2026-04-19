import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
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

export default protect;
