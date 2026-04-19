import fs from "fs/promises";
import path from "path";
import asyncHandler from "../utils/asyncHandler.js";
import {
    buildPublicUploadUrl,
    moveLocalUpload,
    optimizeVideoLocally,
    writeLocalUpload,
} from "../utils/localUpload.utils.js";
import {
    createVideoJob,
    getVideoJob,
    pruneExpiredVideoJobs,
    updateVideoJob,
} from "../utils/videoJobStore.js";
import { extractResourceText } from "../utils/resourceText.utils.js";

const ensureFile = (file) => {
    if (!file) {
        const error = new Error("A file upload is required");
        error.statusCode = 400;
        throw error;
    }
};

const extensionFromName = (originalFilename, fallback) =>
    path.extname(originalFilename || "") || fallback;

export const uploadImage = asyncHandler(async (req, res) => {
    ensureFile(req.file);

    const extension = extensionFromName(req.file.originalname, ".jpg");
    const savedFile = await writeLocalUpload({
        buffer: req.file.buffer,
        folderKey: "images",
        originalFilename: req.file.originalname,
        extension,
    });

    res.status(201).json({
        url: buildPublicUploadUrl(req, "images", savedFile.filename),
        bytes: req.file.size,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
    });
});

export const uploadResource = asyncHandler(async (req, res) => {
    ensureFile(req.file);

    const extension = extensionFromName(req.file.originalname, ".bin");
    const savedFile = await writeLocalUpload({
        buffer: req.file.buffer,
        folderKey: "resources",
        originalFilename: req.file.originalname,
        extension,
    });

    let extractedText = "";
    try {
        extractedText = await extractResourceText({
            buffer: req.file.buffer,
            mimeType: req.file.mimetype,
        });
    } catch (error) {
        console.error("Resource text extraction failed:", error.message);
    }

    res.status(201).json({
        url: buildPublicUploadUrl(req, "resources", savedFile.filename),
        bytes: req.file.size,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        extractedText,
        type:
            req.file.mimetype === "application/pdf"
                ? "pdf"
                : req.file.mimetype === "text/plain"
                  ? "text"
                  : "file",
    });
});

export const uploadVideo = asyncHandler(async (req, res) => {
    ensureFile(req.file);

    const originalExtension = extensionFromName(req.file.originalname, ".mp4");
    const savedOriginal = req.file.path
        ? await moveLocalUpload({
              sourcePath: req.file.path,
              folderKey: "videosOriginal",
              originalFilename: req.file.originalname,
              extension: originalExtension,
          })
        : await writeLocalUpload({
              buffer: req.file.buffer,
              folderKey: "videosOriginal",
              originalFilename: req.file.originalname,
              extension: originalExtension,
          });

    pruneExpiredVideoJobs();

    const originalUrl = buildPublicUploadUrl(
        req,
        "videos",
        "original",
        savedOriginal.filename
    );

    const job = createVideoJob({
        status: "processing",
        progress: 38,
        message: "Upload complete. Preparing H.264 optimization...",
        stage: "queued",
        originalUrl,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        bytes: req.file.size,
        codec: "h264",
        duration: 0,
        isLowBandwidthOptimized: false,
    });

    optimizeVideoLocally({
        sourcePath: savedOriginal.absolutePath,
        originalFilename: req.file.originalname,
        onProgress: ({ progress, message, stage }) => {
            updateVideoJob(job.jobId, {
                status: "processing",
                progress,
                message,
                stage,
            });
        },
    })
        .then((optimizedVideo) => {
            updateVideoJob(job.jobId, {
                status: "ready",
                progress: 100,
                message: "Video processing finished. Ready to attach.",
                stage: "complete",
                result: {
                    url: originalUrl,
                    optimizedUrl: buildPublicUploadUrl(
                        req,
                        "videos",
                        "optimized",
                        optimizedVideo.optimizedFilename
                    ),
                    audioOnlyUrl: buildPublicUploadUrl(
                        req,
                        "videos",
                        "audio",
                        optimizedVideo.audioFilename
                    ),
                    thumbnailUrl: buildPublicUploadUrl(
                        req,
                        "videos",
                        "thumbnails",
                        optimizedVideo.thumbnailFilename
                    ),
                    bytes: req.file.size,
                    optimizedBytes: optimizedVideo.optimizedBytes,
                    audioOnlyBytes: optimizedVideo.audioBytes,
                    originalFilename: req.file.originalname,
                    mimeType: req.file.mimetype,
                    duration: 0,
                    codec: "h264",
                    isLowBandwidthOptimized: true,
                },
            });
        })
        .catch((error) => {
            updateVideoJob(job.jobId, {
                status: "failed",
                progress: 100,
                stage: "failed",
                message:
                    "Original video is uploaded, but optimization failed. You can still save the lecture or retry later.",
                error: error.message,
                result: {
                    url: originalUrl,
                    bytes: req.file.size,
                    originalFilename: req.file.originalname,
                    mimeType: req.file.mimetype,
                    duration: 0,
                    codec: "",
                    isLowBandwidthOptimized: false,
                },
            });
        });

    res.status(202).json({
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        message: job.message,
        url: originalUrl,
        bytes: req.file.size,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
    });
});

export const getUploadVideoStatus = asyncHandler(async (req, res) => {
    const job = getVideoJob(req.params.jobId);

    if (!job) {
        res.status(404);
        throw new Error("Video processing job not found");
    }

    res.json(job);
});
