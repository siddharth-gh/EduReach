import express from "express";
import {
    createQuiz,
    getQuizzesByModule,
    getQuizById,
    updateQuiz,
    deleteQuiz,
} from "../controllers/quiz.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
    validate,
    validateObjectIdParams,
} from "../middleware/validate.middleware.js";
import {
    validateQuizCreate,
    validateQuizUpdate,
} from "../validators/request.validators.js";

const router = express.Router();

router.get("/module/:moduleId", validateObjectIdParams("moduleId"), getQuizzesByModule);
router.get("/:id", protect, validateObjectIdParams("id"), getQuizById);
router.post(
    "/",
    protect,
    authorizeRoles("teacher", "admin"),
    validate(validateQuizCreate),
    createQuiz
);
router.put(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    validate(validateQuizUpdate),
    updateQuiz
);
router.delete(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    deleteQuiz
);

export default router;
