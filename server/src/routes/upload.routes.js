import express from "express";
import {
    getUploadVideoStatus,
    uploadImage,
    uploadResource,
    uploadVideo,
} from "../controllers/upload.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
    uploadLectureImage,
    uploadLectureResource,
    uploadLectureVideo,
} from "../middleware/upload.middleware.js";

const router = express.Router();

router.post(
    "/image",
    protect,
    authorizeRoles("teacher", "admin"),
    uploadLectureImage,
    uploadImage
);

router.post(
    "/resource",
    protect,
    authorizeRoles("teacher", "admin"),
    uploadLectureResource,
    uploadResource
);

router.post(
    "/video",
    protect,
    authorizeRoles("teacher", "admin"),
    uploadLectureVideo,
    uploadVideo
);

router.get(
    "/video/status/:jobId",
    protect,
    authorizeRoles("teacher", "admin"),
    getUploadVideoStatus
);

export default router;
