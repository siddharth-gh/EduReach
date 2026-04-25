import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

const MAX_IMAGE_DIMENSION = 1920;

const normalizeBytes = (value) => Math.max(0, Math.trunc(Number(value) || 0));

export const optimizeImageUpload = async ({ buffer, mimeType }) => {
    if (!buffer || !mimeType || !mimeType.startsWith("image/")) {
        return {
            buffer,
            mimeType,
            originalBytes: normalizeBytes(buffer?.length),
            optimizedBytes: normalizeBytes(buffer?.length),
            optimized: false,
        };
    }

    const source = sharp(buffer, {
        failOnError: false,
        animated: true,
    }).rotate();

    const metadata = await source.metadata();
    const resized = source.resize({
        width: metadata.width && metadata.width > MAX_IMAGE_DIMENSION
            ? MAX_IMAGE_DIMENSION
            : undefined,
        height: metadata.height && metadata.height > MAX_IMAGE_DIMENSION
            ? MAX_IMAGE_DIMENSION
            : undefined,
        fit: "inside",
        withoutEnlargement: true,
    });

    let optimizedBuffer = buffer;

    if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
        optimizedBuffer = await resized.jpeg({
            quality: 82,
            mozjpeg: true,
        }).toBuffer();
    } else if (mimeType === "image/png") {
        optimizedBuffer = await resized.png({
            compressionLevel: 9,
            adaptiveFiltering: true,
            palette: true,
        }).toBuffer();
    } else if (mimeType === "image/webp") {
        optimizedBuffer = await resized.webp({
            quality: 82,
        }).toBuffer();
    } else if (mimeType === "image/gif") {
        optimizedBuffer = await resized.gif({
            effort: 7,
            reoptimise: true,
        }).toBuffer();
    } else {
        return {
            buffer,
            mimeType,
            originalBytes: normalizeBytes(buffer.length),
            optimizedBytes: normalizeBytes(buffer.length),
            optimized: false,
        };
    }

    return {
        buffer: optimizedBuffer,
        mimeType,
        originalBytes: normalizeBytes(buffer.length),
        optimizedBytes: normalizeBytes(optimizedBuffer.length),
        optimized: optimizedBuffer.length < buffer.length,
    };
};

export const optimizePdfUpload = async ({ buffer, mimeType }) => {
    if (!buffer || mimeType !== "application/pdf") {
        return {
            buffer,
            mimeType,
            originalBytes: normalizeBytes(buffer?.length),
            optimizedBytes: normalizeBytes(buffer?.length),
            optimized: false,
        };
    }

    try {
        const pdfDocument = await PDFDocument.load(buffer, {
            ignoreEncryption: true,
        });

        const optimizedBuffer = Buffer.from(
            await pdfDocument.save({
                useObjectStreams: true,
                addDefaultPage: false,
            })
        );

        return {
            buffer: optimizedBuffer,
            mimeType,
            originalBytes: normalizeBytes(buffer.length),
            optimizedBytes: normalizeBytes(optimizedBuffer.length),
            optimized: optimizedBuffer.length < buffer.length,
        };
    } catch {
        return {
            buffer,
            mimeType,
            originalBytes: normalizeBytes(buffer.length),
            optimizedBytes: normalizeBytes(buffer.length),
            optimized: false,
        };
    }
};
