import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            default: null,
        },
        type: {
            type: String,
            enum: ["course-completion", "quiz-mastery", "streak"],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        awardedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

achievementSchema.index(
    { studentId: 1, courseId: 1, type: 1 },
    { unique: true, partialFilterExpression: { courseId: { $type: "objectId" } } }
);

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;
