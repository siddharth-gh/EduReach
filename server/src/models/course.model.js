import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        category: {
            type: String,
            trim: true,
            default: "General",
        },

        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        moduleIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Module",
            },
        ],

        liveSession: {
            isActive: {
                type: Boolean,
                default: false,
            },
            roomId: {
                type: String,
                trim: true,
                default: "",
            },
            startedAt: {
                type: Date,
                default: null,
            },
            startedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
            mode: {
                type: String,
                enum: ["webrtc"],
                default: "webrtc",
            },
        },
    },
    {
        timestamps: true,
    }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
