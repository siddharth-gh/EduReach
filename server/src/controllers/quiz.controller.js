import Course from "../models/course.model.js";
import Module from "../models/module.model.js";
import Quiz from "../models/quiz.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const sanitizeQuizForStudent = (quiz) => {
    const quizObject = quiz.toObject ? quiz.toObject() : quiz;

    return {
        ...quizObject,
        questions: quizObject.questions.map((question) => ({
            questionText: question.questionText,
            options: question.options,
            explanation: question.explanation,
        })),
    };
};

const getAuthorizedCourseForModule = async (moduleId, user) => {
    const moduleItem = await Module.findById(moduleId);
    if (!moduleItem) {
        const error = new Error("Module not found");
        error.statusCode = 404;
        throw error;
    }

    const course = await Course.findById(moduleItem.courseId);
    if (!course) {
        const error = new Error("Course not found");
        error.statusCode = 404;
        throw error;
    }

    if (
        user.role !== "admin" &&
        course.teacherId.toString() !== user._id.toString()
    ) {
        const error = new Error("Not authorized to manage quizzes for this module");
        error.statusCode = 403;
        throw error;
    }

    return { moduleItem, course };
};

export const createQuiz = asyncHandler(async (req, res) => {
    const {
        moduleId,
        title,
        description,
        questions,
        passingScore,
        timeLimitMinutes,
        isPublished,
    } = req.body;

    if (!moduleId || !title || !Array.isArray(questions) || questions.length === 0) {
        res.status(400);
        throw new Error("moduleId, title and at least one question are required");
    }

    const { moduleItem, course } = await getAuthorizedCourseForModule(
        moduleId,
        req.user
    );

    const quiz = await Quiz.create({
        courseId: course._id,
        moduleId: moduleItem._id,
        title,
        description,
        questions,
        passingScore,
        timeLimitMinutes,
        isPublished,
    });

    res.status(201).json(quiz);
});

export const getQuizzesByModule = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({ moduleId: req.params.moduleId }).sort({
        createdAt: -1,
    });

    res.json(quizzes);
});

export const getQuizById = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        res.status(404);
        throw new Error("Quiz not found");
    }

    if (req.user?.role === "student") {
        return res.json(sanitizeQuizForStudent(quiz));
    }

    res.json(quiz);
});

export const updateQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        res.status(404);
        throw new Error("Quiz not found");
    }

    await getAuthorizedCourseForModule(quiz.moduleId, req.user);

    const {
        title,
        description,
        questions,
        passingScore,
        timeLimitMinutes,
        isPublished,
    } = req.body;

    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (questions) quiz.questions = questions;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    if (timeLimitMinutes !== undefined) quiz.timeLimitMinutes = timeLimitMinutes;
    if (isPublished !== undefined) quiz.isPublished = isPublished;

    await quiz.save();

    res.json(quiz);
});

export const deleteQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        res.status(404);
        throw new Error("Quiz not found");
    }

    await getAuthorizedCourseForModule(quiz.moduleId, req.user);
    await quiz.deleteOne();

    res.json({ message: "Quiz deleted successfully" });
});
