import express from "express";
import {
    startAdaptiveQuiz,
    submitAdaptiveQuizAnswer,
} from "../controllers/adaptiveQuiz.controller.js";
import protect from "../middleware/auth.middleware.js";
import {
    validateObjectIdParams,
} from "../middleware/validate.middleware.js";

const router = express.Router();

router.post(
    "/lectures/:lectureId/start",
    protect,
    validateObjectIdParams("lectureId"),
    startAdaptiveQuiz
);

router.post(
    "/sessions/:sessionId/answer",
    protect,
    validateObjectIdParams("sessionId"),
    submitAdaptiveQuizAnswer
);

export default router;
