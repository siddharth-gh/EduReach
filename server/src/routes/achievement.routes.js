import express from "express";
import {
    getMyAchievements,
    getMyCertificate,
} from "../controllers/achievement.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/me", protect, authorizeRoles("student"), getMyAchievements);
router.get(
    "/certificate/:courseId",
    protect,
    authorizeRoles("student"),
    getMyCertificate
);

export default router;
