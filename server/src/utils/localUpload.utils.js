import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { spawn } from "child_process";

const uploadsRoot = path.resolve(process.cwd(), "uploads");

const folders = {
    images: path.join(uploadsRoot, "images"),
    resources: path.join(uploadsRoot, "resources"),
    videosTemp: path.join(uploadsRoot, "videos", "temp"),
    videosOriginal: path.join(uploadsRoot, "videos", "original"),
    videosOptimized: path.join(uploadsRoot, "videos", "optimized"),
    videosAudio: path.join(uploadsRoot, "videos", "audio"),
    thumbnails: path.join(uploadsRoot, "videos", "thumbnails"),
};

const sanitizeBaseName = (filename) =>
    filename
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "file";

const makeUniqueName = (originalFilename, extension) => {
    const base = sanitizeBaseName(originalFilename);
    const suffix = crypto.randomBytes(4).toString("hex");
    return `${base}-${suffix}${extension}`;
};

export const ensureUploadDirectories = async () => {
    await Promise.all(
        Object.values(folders).map((folder) =>
            fs.mkdir(folder, { recursive: true })
        )
    );
};

export const writeLocalUpload = async ({
    buffer,
    folderKey,
    originalFilename,
    extension,
}) => {
    await ensureUploadDirectories();

    const filename = makeUniqueName(originalFilename, extension);
    const absolutePath = path.join(folders[folderKey], filename);

    await fs.writeFile(absolutePath, buffer);

    return {
        filename,
        absolutePath,
    };
};

export const moveLocalUpload = async ({
    sourcePath,
    folderKey,
    originalFilename,
    extension,
}) => {
    await ensureUploadDirectories();

    const filename = makeUniqueName(originalFilename, extension);
    const absolutePath = path.join(folders[folderKey], filename);

    await fs.rename(sourcePath, absolutePath);

    return {
        filename,
        absolutePath,
    };
};

export const buildPublicUploadUrl = (req, ...segments) =>
    `${req.protocol}://${req.get("host")}/uploads/${segments.join("/")}`;

export const resolveUploadUrlToPath = (uploadUrl) => {
    if (!uploadUrl) {
        return "";
    }

    try {
        const parsedUrl = new URL(uploadUrl);

        if (!parsedUrl.pathname.startsWith("/uploads/")) {
            return "";
        }

        const relativePath = decodeURIComponent(
            parsedUrl.pathname.replace("/uploads/", "")
        );

        return path.join(uploadsRoot, relativePath);
    } catch {
        return "";
    }
};

const isFfmpegAvailable = () =>
    new Promise((resolve) => {
        const check = spawn("ffmpeg", ["-version"], { windowsHide: true });
        check.on("error", () => resolve(false));
        check.on("close", (code) => resolve(code === 0));
    });

const runFfmpeg = (args) =>
    new Promise((resolve, reject) => {
        const process = spawn("ffmpeg", args, {
            windowsHide: true,
        });

        let stderr = "";

        process.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        process.on("error", (error) => {
            reject(error);
        });

        process.on("close", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(stderr || "ffmpeg processing failed"));
        });
    });

export const optimizeVideoLocally = async ({
    sourcePath,
    originalFilename,
    onProgress,
}) => {
    await ensureUploadDirectories();

    const optimizedFilename = makeUniqueName(originalFilename, ".mp4");
    const audioFilename = makeUniqueName(originalFilename, ".m4a");
    const thumbnailFilename = makeUniqueName(originalFilename, ".jpg");
    const optimizedPath = path.join(folders.videosOptimized, optimizedFilename);
    const audioPath = path.join(folders.videosAudio, audioFilename);
    const thumbnailPath = path.join(folders.thumbnails, thumbnailFilename);

    const hasFfmpeg = await isFfmpegAvailable();

    if (!hasFfmpeg) {
        console.warn("FFmpeg not found. Skipping video optimization and using original file.");
        
        // In a real fallback, we might not have a thumbnail or audio file.
        // We'll copy the source to optimizedPath just to keep the contract, 
        // though usually we'd just point the DB to the original.
        await fs.copyFile(sourcePath, optimizedPath);
        
        // Return fallback object
        return {
            optimizedFilename,
            optimizedPath,
            optimizedBytes: (await fs.stat(sourcePath)).size,
            audioFilename: "",
            audioPath: "",
            audioBytes: 0,
            thumbnailFilename: "",
            thumbnailPath: "",
            thumbnailBytes: 0,
        };
    }

    onProgress?.({
        progress: 45,
        message: "Optimizing H.264 video stream...",
        stage: "video",
    });

    await runFfmpeg([
        "-y",
        "-i",
        sourcePath,
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "21",
        "-maxrate",
        "4500k",
        "-bufsize",
        "9000k",
        "-vf",
        "scale='min(1280,iw)':-2",
        "-movflags",
        "+faststart",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        optimizedPath,
    ]);

    onProgress?.({
        progress: 72,
        message: "Extracting audio-only mode...",
        stage: "audio",
    });

    await runFfmpeg([
        "-y",
        "-i",
        sourcePath,
        "-vn",
        "-c:a",
        "aac",
        "-b:a",
        "64k",
        audioPath,
    ]);

    onProgress?.({
        progress: 88,
        message: "Generating lecture thumbnail...",
        stage: "thumbnail",
    });

    await runFfmpeg([
        "-y",
        "-i",
        sourcePath,
        "-ss",
        "00:00:01",
        "-frames:v",
        "1",
        thumbnailPath,
    ]);

    const [optimizedStats, audioStats, thumbnailStats] = await Promise.all([
        fs.stat(optimizedPath),
        fs.stat(audioPath),
        fs.stat(thumbnailPath),
    ]);

    onProgress?.({
        progress: 100,
        message: "Adaptive media package is ready.",
        stage: "complete",
    });

    return {
        optimizedFilename,
        optimizedPath,
        optimizedBytes: optimizedStats.size,
        audioFilename,
        audioPath,
        audioBytes: audioStats.size,
        thumbnailFilename,
        thumbnailPath,
        thumbnailBytes: thumbnailStats.size,
    };
};
