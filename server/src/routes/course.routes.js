import express from "express";
import {
    createCourse,
    getCourseLiveSession,
    getCourses,
    getTeacherCourses,
    getCourseById,
    startCourseLiveSession,
    stopCourseLiveSession,
    updateCourse,
    deleteCourse,
} from "../controllers/course.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
    validate,
    validateObjectIdParams,
} from "../middleware/validate.middleware.js";
import {
    validateCourseCreate,
    validateCourseUpdate,
} from "../validators/request.validators.js";

const router = express.Router();

// create (teacher/admin)
router.post(
    "/",
    protect,
    authorizeRoles("teacher", "admin"),
    validate(validateCourseCreate),
    createCourse
);

// read (public)
router.get("/", getCourses);
router.get(
    "/teacher/my-courses",
    protect,
    authorizeRoles("teacher", "admin"),
    getTeacherCourses
);
router.get("/:id/live", validateObjectIdParams("id"), getCourseLiveSession);
router.get("/:id", validateObjectIdParams("id"), getCourseById);
router.post(
    "/:id/live/start",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    startCourseLiveSession
);
router.post(
    "/:id/live/stop",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    stopCourseLiveSession
);

// update (teacher/admin)
router.put(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    validate(validateCourseUpdate),
    updateCourse
);

// delete (teacher/admin)
router.delete(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    deleteCourse
);

export default router;
