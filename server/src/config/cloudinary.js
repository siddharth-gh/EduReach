import { v2 as cloudinary } from "cloudinary";

const getCloudinaryConfig = () => {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
        process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        const error = new Error(
            "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
        );
        error.statusCode = 500;
        throw error;
    }

    return {
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    };
};

export const getConfiguredCloudinary = () => {
    cloudinary.config(getCloudinaryConfig());
    return cloudinary;
};
