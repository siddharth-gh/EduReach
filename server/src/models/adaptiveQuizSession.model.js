import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        question: {
            type: String,
            trim: true,
            default: "",
        },
        options: {
            type: [String],
            default: [],
        },
        selectedAnswer: {
            type: Number,
            required: true,
            min: 0,
            max: 3,
        },
        correctAnswer: {
            type: Number,
            required: true,
            min: 0,
            max: 3,
        },
        isCorrect: {
            type: Boolean,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium",
        },
        concept: {
            type: String,
            trim: true,
            default: "Core concept",
        },
        explanation: {
            type: String,
            trim: true,
            default: "",
        },
        remediationHint: {
            type: String,
            trim: true,
            default: "",
        },
        timeTakenSeconds: {
            type: Number,
            default: 0,
            min: 0,
        },
        answeredAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const adaptiveQuizSessionSchema = new mongoose.Schema(
    {
        lectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture",
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active",
        },
        targetQuestionCount: {
            type: Number,
            default: 10,
            min: 1,
            max: 20,
        },
        currentDifficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium",
        },
        currentQuestionId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        servedQuestionIds: {
            type: [mongoose.Schema.Types.ObjectId],
            default: [],
        },
        conceptMastery: {
            type: Map,
            of: Number,
            default: {},
        },
        answers: {
            type: [answerSchema],
            default: [],
        },
        score: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
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

const AdaptiveQuizSession = mongoose.model(
    "AdaptiveQuizSession",
    adaptiveQuizSessionSchema
);

export default AdaptiveQuizSession;
