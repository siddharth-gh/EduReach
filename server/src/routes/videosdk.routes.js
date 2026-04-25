import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
    getVideoSDKToken,
    createMeeting,
    validateMeeting,
} from "../controllers/videosdk.controller.js";

const router = express.Router();

router.get("/token", protect, getVideoSDKToken);
router.post("/create-meeting", protect, createMeeting);
router.post("/validate-meeting/:meetingId", protect, validateMeeting);

export default router;
