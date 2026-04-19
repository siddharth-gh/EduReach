const LEVELS = ["beginner", "intermediate", "advanced"];
const USER_ROLES = ["student", "teacher", "admin"];
const SIGNUP_ROLES = ["student", "teacher"];
const PREFERRED_MODES = ["normal", "low-bandwidth"];

const isObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

const trimString = (value) =>
    typeof value === "string" ? value.trim() : value;

const pushError = (errors, condition, message) => {
    if (condition) {
        errors.push(message);
    }
};

const ensureObjectBody = (req) =>
    isObject(req.body) ? req.body : {};

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validateOptionalString = (value, fieldName, errors, options = {}) => {
    if (value === undefined) {
        return undefined;
    }

    const trimmed = trimString(value);
    const allowEmpty = options.allowEmpty ?? false;

    if (typeof trimmed !== "string") {
        errors.push(`${fieldName} must be a string`);
        return undefined;
    }

    if (!allowEmpty && !trimmed) {
        errors.push(`${fieldName} cannot be empty`);
        return undefined;
    }

    return trimmed;
};

const validateRequiredString = (value, fieldName, errors) => {
    const trimmed = validateOptionalString(value, fieldName, errors);

    if (trimmed === undefined) {
        if (value === undefined) {
            errors.push(`${fieldName} is required`);
        }

        return undefined;
    }

    return trimmed;
};

const validateOptionalNumber = (value, fieldName, errors, options = {}) => {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== "number" || Number.isNaN(value)) {
        errors.push(`${fieldName} must be a number`);
        return undefined;
    }

    if (options.integer && !Number.isInteger(value)) {
        errors.push(`${fieldName} must be an integer`);
        return undefined;
    }

    if (options.min !== undefined && value < options.min) {
        errors.push(`${fieldName} must be at least ${options.min}`);
        return undefined;
    }

    if (options.max !== undefined && value > options.max) {
        errors.push(`${fieldName} must be at most ${options.max}`);
        return undefined;
    }

    return value;
};

const validateOptionalBoolean = (value, fieldName, errors) => {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== "boolean") {
        errors.push(`${fieldName} must be a boolean`);
        return undefined;
    }

    return value;
};

const validateResourceList = (resources, errors) => {
    if (resources === undefined) {
        return undefined;
    }

    if (!Array.isArray(resources)) {
        errors.push("resources must be an array");
        return undefined;
    }

    return resources.map((resource, index) => {
        if (!isObject(resource)) {
            errors.push(`resources[${index}] must be an object`);
            return null;
        }

        const title = validateRequiredString(
            resource.title,
            `resources[${index}].title`,
            errors
        );
        const url = validateRequiredString(
            resource.url,
            `resources[${index}].url`,
            errors
        );
        const type =
            validateOptionalString(
                resource.type,
                `resources[${index}].type`,
                errors
            ) ?? "file";
        const originalFilename =
            validateOptionalString(
                resource.originalFilename,
                `resources[${index}].originalFilename`,
                errors,
                { allowEmpty: true }
            ) ?? "";
        const extractedText =
            validateOptionalString(
                resource.extractedText,
                `resources[${index}].extractedText`,
                errors,
                { allowEmpty: true }
            ) ?? "";

        if (!["pdf", "text", "file"].includes(type)) {
            errors.push(`resources[${index}].type must be pdf, text, or file`);
        }

        return title && url
            ? {
                  title,
                  url,
                  type,
                  originalFilename,
                  extractedText,
              }
            : null;
    });
};

const validateLectureContents = (contents, errors) => {
    if (contents === undefined) {
        return undefined;
    }

    if (!Array.isArray(contents)) {
        errors.push("contents must be an array");
        return undefined;
    }

    return contents.map((content, index) => {
        if (!isObject(content)) {
            errors.push(`contents[${index}] must be an object`);
            return null;
        }

        const type = validateRequiredString(
            content.type,
            `contents[${index}].type`,
            errors
        );
        const order = validateOptionalNumber(
            content.order,
            `contents[${index}].order`,
            errors,
            { integer: true, min: 0 }
        );

        if (content.order === undefined) {
            errors.push(`contents[${index}].order is required`);
        }

        if (type && !["text", "image"].includes(type)) {
            if (!["text", "image", "video"].includes(type)) {
                errors.push(`contents[${index}].type must be text, image, or video`);
            }
        }

        const data = validateOptionalString(
            content.data,
            `contents[${index}].data`,
            errors
        );
        const url = validateOptionalString(
            content.url,
            `contents[${index}].url`,
            errors
        );
        const optimizedUrl =
            validateOptionalString(
                content.optimizedUrl,
                `contents[${index}].optimizedUrl`,
                errors,
                { allowEmpty: true }
            ) ?? "";
        const audioOnlyUrl =
            validateOptionalString(
                content.audioOnlyUrl,
                `contents[${index}].audioOnlyUrl`,
                errors,
                { allowEmpty: true }
            ) ?? "";
        const thumbnailUrl =
            validateOptionalString(
                content.thumbnailUrl,
                `contents[${index}].thumbnailUrl`,
                errors,
                { allowEmpty: true }
            ) ?? "";
        const codec =
            validateOptionalString(
                content.codec,
                `contents[${index}].codec`,
                errors,
                { allowEmpty: true }
            ) ?? "";
        const duration =
            validateOptionalNumber(
                content.duration,
                `contents[${index}].duration`,
                errors,
                { min: 0 }
            ) ?? 0;
        const originalSize =
            validateOptionalNumber(
                content.originalSize,
                `contents[${index}].originalSize`,
                errors,
                { min: 0 }
            ) ?? 0;
        const optimizedSize =
            validateOptionalNumber(
                content.optimizedSize,
                `contents[${index}].optimizedSize`,
                errors,
                { min: 0 }
            ) ?? 0;
        const audioOnlySize =
            validateOptionalNumber(
                content.audioOnlySize,
                `contents[${index}].audioOnlySize`,
                errors,
                { min: 0 }
            ) ?? 0;
        const isLowBandwidthOptimized =
            validateOptionalBoolean(
                content.isLowBandwidthOptimized,
                `contents[${index}].isLowBandwidthOptimized`,
                errors
            ) ?? false;

        if (type === "text" && !data) {
            errors.push(`contents[${index}].data is required for text content`);
        }

        if (type === "image" && !url) {
            errors.push(`contents[${index}].url is required for image content`);
        }

        if (type === "video" && !url) {
            errors.push(`contents[${index}].url is required for video content`);
        }

        return {
            type,
            order,
            data: type === "text" ? data : undefined,
            url: type === "text" ? undefined : url,
            optimizedUrl: type === "video" ? optimizedUrl : undefined,
            audioOnlyUrl: type === "video" ? audioOnlyUrl : undefined,
            thumbnailUrl: type === "video" ? thumbnailUrl : undefined,
            codec: type === "video" ? codec : undefined,
            duration: type === "video" ? duration : undefined,
            originalSize: type === "video" ? originalSize : undefined,
            optimizedSize: type === "video" ? optimizedSize : undefined,
            audioOnlySize: type === "video" ? audioOnlySize : undefined,
            isLowBandwidthOptimized:
                type === "video" ? isLowBandwidthOptimized : undefined,
        };
    });
};

const validateQuizQuestions = (questions, errors) => {
    if (questions === undefined) {
        return undefined;
    }

    if (!Array.isArray(questions)) {
        errors.push("questions must be an array");
        return undefined;
    }

    if (questions.length === 0) {
        errors.push("questions must contain at least one question");
    }

    return questions.map((question, index) => {
        if (!isObject(question)) {
            errors.push(`questions[${index}] must be an object`);
            return null;
        }

        const questionText = validateRequiredString(
            question.questionText,
            `questions[${index}].questionText`,
            errors
        );

        if (!Array.isArray(question.options) || question.options.length < 2) {
            errors.push(`questions[${index}].options must contain at least two choices`);
        }

        const options = Array.isArray(question.options)
            ? question.options.map((option, optionIndex) =>
                  validateRequiredString(
                      option,
                      `questions[${index}].options[${optionIndex}]`,
                      errors
                  )
              )
            : [];

        const correctAnswer = validateOptionalNumber(
            question.correctAnswer,
            `questions[${index}].correctAnswer`,
            errors,
            { integer: true, min: 0 }
        );

        if (question.correctAnswer === undefined) {
            errors.push(`questions[${index}].correctAnswer is required`);
        }

        if (
            typeof correctAnswer === "number" &&
            Array.isArray(question.options) &&
            correctAnswer >= question.options.length
        ) {
            errors.push(
                `questions[${index}].correctAnswer must match one of the provided options`
            );
        }

        const explanation =
            validateOptionalString(
                question.explanation,
                `questions[${index}].explanation`,
                errors,
                { allowEmpty: true }
            ) ?? "";

        return {
            questionText,
            options,
            correctAnswer,
            explanation,
        };
    });
};

export const validateSignup = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const name = validateRequiredString(body.name, "name", errors);
    const email = validateRequiredString(body.email, "email", errors);
    const password = validateRequiredString(body.password, "password", errors);
    const role = validateOptionalString(body.role, "role", errors);

    if (email && !validateEmail(email)) {
        errors.push("email must be valid");
    }

    if (password && password.length < 6) {
        errors.push("password must be at least 6 characters");
    }

    if (role && !SIGNUP_ROLES.includes(role)) {
        errors.push("role must be student or teacher");
    }

    return {
        errors,
        value: {
            body: {
                name,
                email: email?.toLowerCase(),
                password,
                role,
            },
        },
    };
};

export const validateLogin = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const email = validateRequiredString(body.email, "email", errors);
    const password = validateRequiredString(body.password, "password", errors);

    if (email && !validateEmail(email)) {
        errors.push("email must be valid");
    }

    return {
        errors,
        value: {
            body: {
                email: email?.toLowerCase(),
                password,
            },
        },
    };
};

export const validateProfileUpdate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const name = validateOptionalString(body.name, "name", errors);
    const bio = validateOptionalString(body.bio, "bio", errors, {
        allowEmpty: true,
    });
    const preferredMode = validateOptionalString(
        body.preferredMode,
        "preferredMode",
        errors
    );

    pushError(
        errors,
        body.name === undefined &&
            body.bio === undefined &&
            body.preferredMode === undefined,
        "At least one profile field must be provided"
    );

    if (preferredMode && !PREFERRED_MODES.includes(preferredMode)) {
        errors.push("preferredMode must be normal or low-bandwidth");
    }

    return {
        errors,
        value: {
            body: {
                ...(name !== undefined ? { name } : {}),
                ...(bio !== undefined ? { bio } : {}),
                ...(preferredMode !== undefined ? { preferredMode } : {}),
            },
        },
    };
};

export const validateCourseCreate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const title = validateRequiredString(body.title, "title", errors);
    const description = validateRequiredString(
        body.description,
        "description",
        errors
    );
    const category = validateOptionalString(body.category, "category", errors, {
        allowEmpty: true,
    });
    const level = validateOptionalString(body.level, "level", errors);

    if (level && !LEVELS.includes(level)) {
        errors.push("level must be beginner, intermediate, or advanced");
    }

    return {
        errors,
        value: {
            body: {
                title,
                description,
                ...(category !== undefined ? { category } : {}),
                ...(level !== undefined ? { level } : {}),
            },
        },
    };
};

export const validateCourseUpdate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const title = validateOptionalString(body.title, "title", errors);
    const description = validateOptionalString(
        body.description,
        "description",
        errors
    );
    const category = validateOptionalString(body.category, "category", errors, {
        allowEmpty: true,
    });
    const level = validateOptionalString(body.level, "level", errors);

    pushError(
        errors,
        title === undefined &&
            description === undefined &&
            category === undefined &&
            level === undefined,
        "At least one course field must be provided"
    );

    if (level && !LEVELS.includes(level)) {
        errors.push("level must be beginner, intermediate, or advanced");
    }

    return {
        errors,
        value: {
            body: {
                ...(title !== undefined ? { title } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(category !== undefined ? { category } : {}),
                ...(level !== undefined ? { level } : {}),
            },
        },
    };
};

export const validateModuleCreate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const courseId = validateRequiredString(body.courseId, "courseId", errors);
    const title = validateRequiredString(body.title, "title", errors);
    const order = validateOptionalNumber(body.order, "order", errors, {
        integer: true,
        min: 1,
    });

    if (body.order === undefined) {
        errors.push("order is required");
    }

    return {
        errors,
        value: {
            body: {
                courseId,
                title,
                order,
            },
        },
    };
};

export const validateModuleUpdate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const title = validateOptionalString(body.title, "title", errors);
    const order = validateOptionalNumber(body.order, "order", errors, {
        integer: true,
        min: 1,
    });

    pushError(
        errors,
        title === undefined && order === undefined,
        "At least one module field must be provided"
    );

    return {
        errors,
        value: {
            body: {
                ...(title !== undefined ? { title } : {}),
                ...(order !== undefined ? { order } : {}),
            },
        },
    };
};

export const validateLectureCreate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const moduleId = validateRequiredString(body.moduleId, "moduleId", errors);
    const title = validateRequiredString(body.title, "title", errors);
    const order = validateOptionalNumber(body.order, "order", errors, {
        integer: true,
        min: 1,
    });
    const contents = validateLectureContents(body.contents, errors) ?? [];
    const resources = validateResourceList(body.resources, errors) ?? [];

    if (body.order === undefined) {
        errors.push("order is required");
    }

    return {
        errors,
        value: {
            body: {
                moduleId,
                title,
                order,
                contents,
                resources,
            },
        },
    };
};

export const validateLectureUpdate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const title = validateOptionalString(body.title, "title", errors);
    const order = validateOptionalNumber(body.order, "order", errors, {
        integer: true,
        min: 1,
    });
    const contents = validateLectureContents(body.contents, errors);
    const resources = validateResourceList(body.resources, errors);

    pushError(
        errors,
        title === undefined &&
            order === undefined &&
            contents === undefined &&
            resources === undefined,
        "At least one lecture field must be provided"
    );

    return {
        errors,
        value: {
            body: {
                ...(title !== undefined ? { title } : {}),
                ...(order !== undefined ? { order } : {}),
                ...(contents !== undefined ? { contents } : {}),
                ...(resources !== undefined ? { resources } : {}),
            },
        },
    };
};

export const validateEnrollmentCreate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const courseId = validateRequiredString(body.courseId, "courseId", errors);

    return {
        errors,
        value: {
            body: { courseId },
        },
    };
};

export const validateQuizCreate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const moduleId = validateRequiredString(body.moduleId, "moduleId", errors);
    const title = validateRequiredString(body.title, "title", errors);
    const description =
        validateOptionalString(body.description, "description", errors, {
            allowEmpty: true,
        }) ?? "";
    const questions = validateQuizQuestions(body.questions, errors);
    const passingScore = validateOptionalNumber(
        body.passingScore,
        "passingScore",
        errors,
        { integer: true, min: 0, max: 100 }
    );
    const timeLimitMinutes = validateOptionalNumber(
        body.timeLimitMinutes,
        "timeLimitMinutes",
        errors,
        { integer: true, min: 0 }
    );
    const isPublished = validateOptionalBoolean(
        body.isPublished,
        "isPublished",
        errors
    );

    return {
        errors,
        value: {
            body: {
                moduleId,
                title,
                description,
                questions,
                ...(passingScore !== undefined ? { passingScore } : {}),
                ...(timeLimitMinutes !== undefined ? { timeLimitMinutes } : {}),
                ...(isPublished !== undefined ? { isPublished } : {}),
            },
        },
    };
};

export const validateQuizUpdate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const title = validateOptionalString(body.title, "title", errors);
    const description = validateOptionalString(
        body.description,
        "description",
        errors,
        { allowEmpty: true }
    );
    const questions = validateQuizQuestions(body.questions, errors);
    const passingScore = validateOptionalNumber(
        body.passingScore,
        "passingScore",
        errors,
        { integer: true, min: 0, max: 100 }
    );
    const timeLimitMinutes = validateOptionalNumber(
        body.timeLimitMinutes,
        "timeLimitMinutes",
        errors,
        { integer: true, min: 0 }
    );
    const isPublished = validateOptionalBoolean(
        body.isPublished,
        "isPublished",
        errors
    );

    pushError(
        errors,
        title === undefined &&
            description === undefined &&
            questions === undefined &&
            passingScore === undefined &&
            timeLimitMinutes === undefined &&
            isPublished === undefined,
        "At least one quiz field must be provided"
    );

    return {
        errors,
        value: {
            body: {
                ...(title !== undefined ? { title } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(questions !== undefined ? { questions } : {}),
                ...(passingScore !== undefined ? { passingScore } : {}),
                ...(timeLimitMinutes !== undefined ? { timeLimitMinutes } : {}),
                ...(isPublished !== undefined ? { isPublished } : {}),
            },
        },
    };
};

export const validateQuizAttemptCreate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];

    if (body.answers !== undefined && !Array.isArray(body.answers)) {
        errors.push("answers must be an array");
    }

    const answers = Array.isArray(body.answers)
        ? body.answers.map((answer, index) => {
              if (!isObject(answer)) {
                  errors.push(`answers[${index}] must be an object`);
                  return null;
              }

              const questionIndex = validateOptionalNumber(
                  answer.questionIndex,
                  `answers[${index}].questionIndex`,
                  errors,
                  { integer: true, min: 0 }
              );
              const selectedOption = validateOptionalNumber(
                  answer.selectedOption,
                  `answers[${index}].selectedOption`,
                  errors,
                  { integer: true, min: 0 }
              );

              if (answer.questionIndex === undefined) {
                  errors.push(`answers[${index}].questionIndex is required`);
              }

              if (answer.selectedOption === undefined) {
                  errors.push(`answers[${index}].selectedOption is required`);
              }

              return {
                  questionIndex,
                  selectedOption,
              };
          })
        : [];

    return {
        errors,
        value: {
            body: { answers },
        },
    };
};

export const validateNoteUpdate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const content =
        validateOptionalString(body.content, "content", errors, {
            allowEmpty: true,
        }) ?? "";

    if (content.length > 5000) {
        errors.push("content must be 5000 characters or fewer");
    }

    return {
        errors,
        value: {
            body: { content },
        },
    };
};

export const validateUserRoleUpdate = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];
    const role = validateRequiredString(body.role, "role", errors);

    if (role && !USER_ROLES.includes(role)) {
        errors.push("role must be student, teacher, or admin");
    }

    return {
        errors,
        value: {
            body: { role },
        },
    };
};

export const validateLectureAiChat = (req) => {
    const body = ensureObjectBody(req);
    const errors = [];

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
        errors.push("messages must be a non-empty array");
    }

    const messages = Array.isArray(body.messages)
        ? body.messages
              .map((message, index) => {
                  if (!isObject(message)) {
                      errors.push(`messages[${index}] must be an object`);
                      return null;
                  }

                  const role = validateRequiredString(
                      message.role,
                      `messages[${index}].role`,
                      errors
                  );
                  const content = validateRequiredString(
                      message.content,
                      `messages[${index}].content`,
                      errors
                  );

                  if (role && !["user", "assistant"].includes(role)) {
                      errors.push(
                          `messages[${index}].role must be user or assistant`
                      );
                  }

                  return role && content
                      ? {
                            role,
                            content,
                        }
                      : null;
              })
              .filter(Boolean)
        : [];

    return {
        errors,
        value: {
            body: { messages },
        },
    };
};
