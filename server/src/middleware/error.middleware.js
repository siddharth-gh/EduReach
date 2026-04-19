export const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export const errorHandler = (err, req, res, next) => {
    console.error(err.message);

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            message: "Uploaded file exceeds the 1 GB size limit",
        });
    }

    const statusCode =
        err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

    res.status(statusCode).json({
        message:
            err.message === "Unsupported file type"
                ? "Unsupported file type for this upload"
                : err.message,
        ...(err.details ? { details: err.details } : {}),
    });
};
