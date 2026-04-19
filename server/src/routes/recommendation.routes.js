import express from "express";
import { getMyRecommendations } from "../controllers/recommendation.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/me", protect, authorizeRoles("student"), getMyRecommendations);

export default router;
