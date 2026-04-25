import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        questionText: {
            type: String,
            required: true,
            trim: true,
        },
        options: [
            {
                type: String,
                required: true,
                trim: true,
            },
        ],
        correctAnswer: {
            type: Number,
            required: true,
            min: 0,
        },
        explanation: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { _id: false }
);

const quizSchema = new mongoose.Schema(
    {
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
        sourceLectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture",
            default: null,
        },
        generatedBy: {
            type: String,
            enum: ["manual", "ai"],
            default: "manual",
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        questions: {
            type: [questionSchema],
            default: [],
            validate: {
                validator: (questions) => questions.length > 0,
                message: "Quiz must contain at least one question",
            },
        },
        passingScore: {
            type: Number,
            default: 50,
            min: 0,
            max: 100,
        },
        timeLimitMinutes: {
            type: Number,
            default: 0,
            min: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
