import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["text", "image", "video"],
            required: true,
        },

        data: {
            type: String, // for text content
        },

        url: {
            type: String, // for image URL
        },

        optimizedUrl: {
            type: String,
            trim: true,
            default: "",
        },

        audioOnlyUrl: {
            type: String,
            trim: true,
            default: "",
        },

        thumbnailUrl: {
            type: String,
            trim: true,
            default: "",
        },

        codec: {
            type: String,
            trim: true,
            default: "",
        },

        duration: {
            type: Number,
            default: 0,
        },

        originalSize: {
            type: Number,
            default: 0,
        },

        optimizedSize: {
            type: Number,
            default: 0,
        },

        audioOnlySize: {
            type: Number,
            default: 0,
        },

        isLowBandwidthOptimized: {
            type: Boolean,
            default: false,
        },

        order: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const lectureSchema = new mongoose.Schema(
    {
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        order: {
            type: Number,
            required: true,
        },

        contents: [contentSchema],

        resources: [
            {
                title: {
                    type: String,
                    required: true,
                    trim: true,
                },
                url: {
                    type: String,
                    required: true,
                    trim: true,
                },
                type: {
                    type: String,
                    enum: ["pdf", "text", "file"],
                    default: "file",
                },
                originalFilename: {
                    type: String,
                    trim: true,
                    default: "",
                },
                extractedText: {
                    type: String,
                    trim: true,
                    default: "",
                },
            },
        ],

        aiSummary: {
            status: {
                type: String,
                enum: ["idle", "processing", "ready", "failed"],
                default: "idle",
            },
            text: {
                type: String,
                trim: true,
                default: "",
            },
            keyPoints: {
                type: [String],
                default: [],
            },
            generatedAt: {
                type: Date,
                default: null,
            },
            error: {
                type: String,
                trim: true,
                default: "",
            },
        },

        aiMcqs: {
            status: {
                type: String,
                enum: ["idle", "processing", "ready", "failed"],
                default: "idle",
            },
            questions: {
                type: [
                    {
                        question: {
                            type: String,
                            trim: true,
                            default: "",
                        },
                        options: {
                            type: [String],
                            default: [],
                        },
                        correctAnswer: {
                            type: Number,
                            default: 0,
                        },
                        explanation: {
                            type: String,
                            trim: true,
                            default: "",
                        },
                    },
                ],
                default: [],
            },
            generatedAt: {
                type: Date,
                default: null,
            },
            error: {
                type: String,
                trim: true,
                default: "",
            },
        },

        transcript: {
            status: {
                type: String,
                enum: ["idle", "processing", "ready", "failed"],
                default: "idle",
            },
            text: {
                type: String,
                trim: true,
                default: "",
            },
            source: {
                type: String,
                trim: true,
                default: "",
            },
            generatedAt: {
                type: Date,
                default: null,
            },
            error: {
                type: String,
                trim: true,
                default: "",
            },
        },
    },
    {
        timestamps: true,
    }
);

const Lecture = mongoose.model("Lecture", lectureSchema);

export default Lecture;
