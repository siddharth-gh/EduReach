import fs from "fs";
import path from "path";
import multer from "multer";

const memoryStorage = multer.memoryStorage();
const videoTempDirectory = path.resolve(process.cwd(), "uploads", "videos", "temp");
const videoDiskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdir(videoTempDirectory, { recursive: true }, (error) => {
            cb(error, videoTempDirectory);
        });
    },
    filename: (req, file, cb) => {
        const safeName =
            file.originalname
                ?.replace(/[^a-zA-Z0-9._-]+/g, "-")
                .replace(/-+/g, "-") || `video-${Date.now()}.mp4`;

        cb(null, `${Date.now()}-${safeName}`);
    },
});

const createUploader = (allowedMimeTypes, fileSizeLimit, storage = memoryStorage) =>
    multer({
        storage,
        limits: {
            fileSize: fileSizeLimit,
        },
        fileFilter: (req, file, cb) => {
            if (!allowedMimeTypes.includes(file.mimetype)) {
                cb(new Error("Unsupported file type"));
                return;
            }

            cb(null, true);
        },
    });

export const uploadLectureImage = createUploader(
    ["image/jpeg", "image/png", "image/webp", "image/gif"],
    5 * 1024 * 1024
).single("file");

export const uploadLectureResource = createUploader(
    [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    10 * 1024 * 1024
).single("file");

export const uploadLectureVideo = createUploader(
    [
        "video/mp4",
        "video/quicktime",
        "video/webm",
        "video/x-matroska",
    ],
    1024 * 1024 * 1024,
    videoDiskStorage
).single("file");
