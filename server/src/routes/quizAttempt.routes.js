import express from "express";
import {
    submitQuizAttempt,
    getMyQuizAttempts,
    getAttemptsByQuiz,
    getMyQuizAttemptById,
} from "../controllers/quizAttempt.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
    validate,
    validateObjectIdParams,
} from "../middleware/validate.middleware.js";
import { validateQuizAttemptCreate } from "../validators/request.validators.js";

const router = express.Router();

router.post(
    "/:quizId",
    protect,
    authorizeRoles("student"),
    validateObjectIdParams("quizId"),
    validate(validateQuizAttemptCreate),
    submitQuizAttempt
);
router.get(
    "/my-results",
    protect,
    authorizeRoles("student"),
    getMyQuizAttempts
);
router.get(
    "/:id",
    protect,
    authorizeRoles("student"),
    validateObjectIdParams("id"),
    getMyQuizAttemptById
);
router.get(
    "/quiz/:quizId",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("quizId"),
    getAttemptsByQuiz
);

export default router;
