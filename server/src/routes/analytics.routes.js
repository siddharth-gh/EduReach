import express from "express";
import {
    getTeacherOverview,
    getAdminOverview,
} from "../controllers/analytics.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
    "/teacher/overview",
    protect,
    authorizeRoles("teacher", "admin"),
    getTeacherOverview
);
router.get(
    "/admin/overview",
    protect,
    authorizeRoles("admin"),
    getAdminOverview
);

export default router;
