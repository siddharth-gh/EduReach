import express from "express";
import {
    markLectureComplete,
    getCourseProgress,
    getMyProgressOverview,
} from "../controllers/progress.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import { validateObjectIdParams } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post(
    "/lecture/:lectureId/complete",
    protect,
    authorizeRoles("student"),
    validateObjectIdParams("lectureId"),
    markLectureComplete
);
router.get(
    "/course/:courseId",
    protect,
    authorizeRoles("student"),
    validateObjectIdParams("courseId"),
    getCourseProgress
);
router.get(
    "/me/overview",
    protect,
    authorizeRoles("student"),
    getMyProgressOverview
);

export default router;
