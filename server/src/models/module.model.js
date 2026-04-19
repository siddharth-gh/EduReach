import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        lectureIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Lecture",
            },
        ],

        order: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Module = mongoose.model("Module", moduleSchema);

export default Module;