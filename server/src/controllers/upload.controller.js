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
    optimizeImageUpload,
    optimizePdfUpload,
} from "../utils/uploadOptimization.utils.js";
import {
    createVideoJob,
    getVideoJob,
    pruneExpiredVideoJobs,
    updateVideoJob,
} from "../utils/videoJobStore.js";
import { extractResourceText } from "../utils/resourceText.utils.js";
import {
    getMockTranscription,
    isTranscriptionConfigured,
    transcribeAudioFile,
} from "../services/transcription.service.js";

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

    const optimized = await optimizeImageUpload({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
    });

    const extension = extensionFromName(req.file.originalname, ".jpg");
    const saved = await writeLocalUpload({
        buffer: optimized.buffer,
        folderKey: "images",
        originalFilename: req.file.originalname,
        extension: extension,
    });

    const localUrl = buildPublicUploadUrl(req, "images", saved.filename);

    res.status(201).json({
        url: localUrl,
        bytes: optimized.optimizedBytes,
        originalBytes: optimized.originalBytes,
        optimizedBytes: optimized.optimizedBytes,
        isOptimized: optimized.optimized,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
    });
});

export const uploadResource = asyncHandler(async (req, res) => {
    ensureFile(req.file);

    const optimizedPdf = await optimizePdfUpload({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
    });
    const extractionBuffer =
        req.file.mimetype === "application/pdf"
            ? optimizedPdf.buffer
            : req.file.buffer;

    const extension = extensionFromName(req.file.originalname, ".bin");
    const saved = await writeLocalUpload({
        buffer: optimizedPdf.buffer,
        folderKey: "resources",
        originalFilename: req.file.originalname,
        extension: extension,
    });

    const localUrl = buildPublicUploadUrl(req, "resources", saved.filename);

    let extractedText = "";
    try {
        extractedText = await extractResourceText({
            buffer: extractionBuffer,
            mimeType: req.file.mimetype,
        });
    } catch (error) {
        console.error("Resource text extraction failed:", error.message);
    }

    res.status(201).json({
        url: localUrl,
        bytes: optimizedPdf.optimizedBytes,
        originalBytes: optimizedPdf.originalBytes,
        optimizedBytes: optimizedPdf.optimizedBytes,
        isOptimized: optimizedPdf.optimized,
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

    const originalLocalUrl = buildPublicUploadUrl(req, "videos/original", savedOriginal.filename);

    const job = createVideoJob({
        status: "processing",
        progress: 38,
        message: "Upload complete. Preparing H.264 optimization...",
        stage: "queued",
        originalUrl: originalLocalUrl,
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
        .then(async (optimizedVideo) => {
            const optimizedUrl = buildPublicUploadUrl(req, "videos/optimized", optimizedVideo.optimizedFilename);
            const audioUrl = buildPublicUploadUrl(req, "videos/audio", optimizedVideo.audioFilename);
            const thumbnailUrl = buildPublicUploadUrl(req, "thumbnails", optimizedVideo.thumbnailFilename);

            let transcript = {
                status: "idle",
                text: "",
                source: "",
                error: "",
            };

            if (!isTranscriptionConfigured()) {
                const mockTranscription = getMockTranscription();
                transcript = {
                    status: "ready",
                    text: mockTranscription.text,
                    source: mockTranscription.model,
                    error: "Whisper transcription is not available yet in testing mode.",
                };
            } else {
                updateVideoJob(job.jobId, {
                    status: "processing",
                    progress: 94,
                    message: "Transcribing audio with Whisper...",
                    stage: "transcription",
                });

                try {
                    const transcription = await transcribeAudioFile({
                        audioPath: optimizedVideo.audioPath,
                        audioBytes: optimizedVideo.audioBytes,
                        prompt: req.file.originalname,
                    });

                    transcript = {
                        status: "ready",
                        text: transcription.text,
                        source: transcription.model,
                        error: "",
                    };
                } catch (error) {
                    transcript = {
                        status: "failed",
                        text: "",
                        source: "whisper",
                        error: error.message,
                    };
                    console.error("Video transcription failed:", error.message);
                }
            }

            updateVideoJob(job.jobId, {
                status: "ready",
                progress: 100,
                message: "Video processing finished. Ready to attach.",
                stage: "complete",
                result: {
                    url: originalLocalUrl,
                    optimizedUrl,
                    audioOnlyUrl: audioUrl,
                    thumbnailUrl,
                    bytes: req.file.size,
                    optimizedBytes: optimizedVideo.optimizedBytes,
                    audioOnlyBytes: optimizedVideo.audioBytes,
                    originalFilename: req.file.originalname,
                    mimeType: req.file.mimetype,
                    duration: 0,
                    codec: "h264",
                    isLowBandwidthOptimized: true,
                    transcript,
                },
            });

            // We KEEP local files in this mode because they ARE the storage
            // In S3 mode we would unlink them.
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
                    url: originalLocalUrl,
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
        url: originalLocalUrl,
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
