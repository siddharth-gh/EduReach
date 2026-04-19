import express from "express";
import {
    createModule,
    getModulesByCourse,
    getModuleById,
    updateModule,
    deleteModule,
} from "../controllers/module.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
    validate,
    validateObjectIdParams,
} from "../middleware/validate.middleware.js";
import {
    validateModuleCreate,
    validateModuleUpdate,
} from "../validators/request.validators.js";

const router = express.Router();

// create (teacher/admin)
router.post(
    "/",
    protect,
    authorizeRoles("teacher", "admin"),
    validate(validateModuleCreate),
    createModule
);

// read (public)
router.get(
    "/single/:id",
    validateObjectIdParams("id"),
    getModuleById
);
router.get("/:courseId", validateObjectIdParams("courseId"), getModulesByCourse);

// update (teacher/admin)
router.put(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    validate(validateModuleUpdate),
    updateModule
);

// delete (teacher/admin)
router.delete(
    "/:id",
    protect,
    authorizeRoles("teacher", "admin"),
    validateObjectIdParams("id"),
    deleteModule
);

export default router;
