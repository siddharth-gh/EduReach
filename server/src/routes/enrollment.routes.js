import express from "express";
import {
    enrollInCourse,
    getMyEnrollments,
    getCourseEnrollments,
} from "../controllers/enrollment.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
    validate,
    validateObjectIdParams,
} from "../middleware/validate.middleware.js";
import { validateEnrollmentCreate } from "../validators/request.validators.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorizeRoles("student"),
    validate(validateEnrollmentCreate),
    enrollInCourse
);
router.get("/my-courses", protect, authorizeRoles("student"), getMyEnrollments);
router.get(
    "/course/:courseId",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("courseId"),
    getCourseEnrollments
);

export default router;
