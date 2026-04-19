import express from "express";
import {
    getLectureNote,
    getMyNotes,
    upsertLectureNote,
} from "../controllers/note.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
    validate,
    validateObjectIdParams,
} from "../middleware/validate.middleware.js";
import { validateNoteUpdate } from "../validators/request.validators.js";

const router = express.Router();

router.get("/me", protect, authorizeRoles("student"), getMyNotes);
router.get(
    "/lecture/:lectureId",
    protect,
    authorizeRoles("student"),
    validateObjectIdParams("lectureId"),
    getLectureNote
);
router.put(
    "/lecture/:lectureId",
    protect,
    authorizeRoles("student"),
    validateObjectIdParams("lectureId"),
    validate(validateNoteUpdate),
    upsertLectureNote
);

export default router;
