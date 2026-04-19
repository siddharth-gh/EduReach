import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true,
        },
        lectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture",
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        lastViewedAt: {
            type: Date,
            default: Date.now,
        },
        timeSpentSeconds: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

progressSchema.index({ studentId: 1, lectureId: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
