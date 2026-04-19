import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
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
        content: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

noteSchema.index({ studentId: 1, lectureId: 1 }, { unique: true });

const Note = mongoose.model("Note", noteSchema);

export default Note;
