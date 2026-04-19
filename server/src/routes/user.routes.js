import express from "express";
import { getUsers, updateUserRole } from "../controllers/user.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
    validate,
    validateObjectIdParams,
} from "../middleware/validate.middleware.js";
import { validateUserRoleUpdate } from "../validators/request.validators.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin"), getUsers);
router.put(
    "/:id/role",
    protect,
    authorizeRoles("admin"),
    validateObjectIdParams("id"),
    validate(validateUserRoleUpdate),
    updateUserRole
);

export default router;
