import express from "express";
import { signup, login, updateProfile } from "../controllers/auth.controller.js";
import protect from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    validateLogin,
    validateProfileUpdate,
    validateSignup,
} from "../validators/request.validators.js";


const router = express.Router();

router.get("/me", protect, (req, res) => {
    res.json(req.user);
});
router.put("/profile", protect, validate(validateProfileUpdate), updateProfile);
router.post("/signup", validate(validateSignup), signup);
router.post("/login", validate(validateLogin), login);

export default router;
