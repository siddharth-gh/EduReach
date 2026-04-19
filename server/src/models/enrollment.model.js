import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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
        status: {
            type: String,
            enum: ["active", "completed", "dropped"],
            default: "active",
        },
        progressPercent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        enrolledAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
