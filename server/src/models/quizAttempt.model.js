import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
    {
        questionIndex: {
            type: Number,
            required: true,
            min: 0,
        },
        selectedOption: {
            type: Number,
            required: true,
            min: 0,
        },
        isCorrect: {
            type: Boolean,
            required: true,
        },
    },
    { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
    {
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        answers: {
            type: [answerSchema],
            default: [],
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        passed: {
            type: Boolean,
            required: true,
        },
        attemptedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
