import express from "express";
import {
    createLecture,
    generateLectureMcqs,
    getLecturesByModule,
    getLectureById,
    refreshLectureAi,
    updateLecture,
    deleteLecture,
    togglePublishLecture,
} from "../controllers/lecture.controller.js";
import protect, { optionalProtect } from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
    validate,
    validateObjectIdParams,
} from "../middleware/validate.middleware.js";
import {
    validateLectureCreate,
    validateLectureAiChat,
    validateLectureUpdate,
} from "../validators/request.validators.js";


const router = express.Router();

// create (teacher/admin)
router.post(
    "/",
    protect,
    authorizeRoles("teacher", "admin"),
    validate(validateLectureCreate),
    createLecture
);

// read (public)
router.get("/:moduleId", optionalProtect, validateObjectIdParams("moduleId"), getLecturesByModule);
router.get("/single/:id", optionalProtect, validateObjectIdParams("id"), getLectureById);
router.post(
    "/single/:id/ai-chat",
    protect,
    validateObjectIdParams("id"),
    validate(validateLectureAiChat),
    generateLectureMcqs
);
router.post(
    "/single/:id/ai-refresh",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    refreshLectureAi
);

// update (teacher/admin)
router.put(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    validate(validateLectureUpdate),
    updateLecture
);

// delete (teacher/admin)
router.delete(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    deleteLecture
);

// publish (teacher/admin)
router.patch(
    "/:id/publish",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    togglePublishLecture
);

export default router;
