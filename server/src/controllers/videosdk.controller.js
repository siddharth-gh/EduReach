import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * @desc Get VideoSDK Token
 * @route GET /api/videosdk/token
 */
export const getVideoSDKToken = asyncHandler(async (req, res) => {
    const API_KEY = process.env.VIDEOSDK_API_KEY;
    const SECRET_KEY = process.env.VIDEOSDK_SECRET;

    if (!API_KEY || !SECRET_KEY) {
        res.status(500);
        throw new Error("VideoSDK credentials not configured");
    }

    const options = { expiresIn: "120m", algorithm: "HS256" };
    const payload = {
        apikey: API_KEY,
        permissions: ["allow_join", "allow_mod", "ask_join"], // Basic permissions
    };

    const token = jwt.sign(payload, SECRET_KEY, options);
    res.json({ token });
});

/**
 * @desc Create VideoSDK Meeting
 * @route POST /api/videosdk/create-meeting
 */
export const createMeeting = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        res.status(400);
        throw new Error("Token is required to create a meeting");
    }

    try {
        const response = await axios.post(
            "https://api.videosdk.live/v2/rooms",
            {},
            {
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("VideoSDK Create Room Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500);
        throw new Error(error.response?.data?.message || "Failed to create VideoSDK room");
    }
});

/**
 * @desc Validate Meeting ID
 * @route POST /api/videosdk/validate-meeting/:meetingId
 */
export const validateMeeting = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const { meetingId } = req.params;

    try {
        const response = await axios.get(
            `https://api.videosdk.live/v2/rooms/validate/${meetingId}`,
            {
                headers: {
                    Authorization: token,
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500);
        throw new Error("Invalid Meeting ID");
    }
});
