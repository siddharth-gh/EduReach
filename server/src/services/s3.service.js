import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * Uploads a file buffer to S3
 * @param {Buffer} buffer - File content
 * @param {string} key - S3 object key (path/filename)
 * @param {string} contentType - Mime type
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
export const uploadToS3 = async (buffer, key, contentType) => {
    try {
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            },
        });

        await upload.done();
        
        const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
        if (cloudfrontDomain) {
            // Remove trailing slash if user accidentally adds it
            const domain = cloudfrontDomain.replace(/\/$/, "");
            return `https://${domain}/${key}`;
        }

        return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Failed to upload file to S3");
    }
};

/**
 * Deletes an object from S3
 * @param {string} key - S3 object key
 */
export const deleteFromS3 = async (key) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });
        await s3Client.send(command);
    } catch (error) {
        console.error("S3 Delete Error:", error);
    }
};

/**
 * Helper to generate S3 keys
 */
export const generateS3Key = (folder, filename) => {
    return `${folder}/${Date.now()}-${filename}`;
};
