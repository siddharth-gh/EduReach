const buildValidationError = (errors) => {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors;
    return error;
};

export const validate = (validator) => (req, res, next) => {
    const result = validator(req);

    if (result.errors.length > 0) {
        return next(buildValidationError(result.errors));
    }

    if (result.value.body) {
        req.body = result.value.body;
    }

    if (result.value.params) {
        req.params = {
            ...req.params,
            ...result.value.params,
        };
    }

    if (result.value.query) {
        req.query = {
            ...req.query,
            ...result.value.query,
        };
    }

    next();
};

export const validateObjectIdParams = (...paramNames) =>
    validate((req) => {
        const errors = [];
        const params = {};

        for (const paramName of paramNames) {
            const value = req.params[paramName];

            if (
                typeof value !== "string" ||
                !/^[a-f\d]{24}$/i.test(value.trim())
            ) {
                errors.push(`${paramName} must be a valid id`);
                continue;
            }

            params[paramName] = value.trim();
        }

        return {
            errors,
            value: { params },
        };
    });
