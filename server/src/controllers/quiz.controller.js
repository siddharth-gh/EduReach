import Course from "../models/course.model.js";
import Module from "../models/module.model.js";
import Quiz from "../models/quiz.model.js";
import Lecture from "../models/lecture.model.js";
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
    const moduleId = req.params.moduleId;
    const module = await Module.findById(moduleId);
    if (!module) {
        res.status(404);
        throw new Error("Module not found");
    }

    const course = await Course.findById(module?.courseId);

    let canSeeDrafts = false;
    if (req.user) {
        if (req.user.role === "admin" || (req.user.role === "teacher" && course?.teacherId && course.teacherId.toString() === req.user._id.toString())) {
            canSeeDrafts = true;
        }
    }

    let quizzes = await Quiz.find({ moduleId }).sort({ createdAt: -1 });

    if (!canSeeDrafts) {
        // Fetch all lectures in this module to check their published status
        const lectures = await Lecture.find({ moduleId, isPublished: true }, '_id');
        const publishedLectureIds = new Set(lectures.map(l => l._id.toString()));

        quizzes = quizzes.filter(q => {
            // 1. Must be published itself
            if (!q.isPublished) return false;
            
            // 2. If it has a parent lecture, that lecture must be published
            if (q.sourceLectureId) {
                try {
                    if (!publishedLectureIds.has(q.sourceLectureId.toString())) {
                        return false;
                    }
                } catch (e) {
                    console.error("Quiz sourceLectureId check error:", e.message);
                    return false;
                }
            }
            
            return true;
        });
    }

    res.json(quizzes);
});

export const getQuizById = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        res.status(404);
        throw new Error("Quiz not found");
    }

    // Check visibility
    const module = await Module.findById(quiz.moduleId);
    const course = await Course.findById(module?.courseId);
    
    // Auth fallback no longer needed
    let isStaff = false;
    if (req.user) {
        isStaff = req.user.role === 'admin' || (course && course.teacherId && course.teacherId.toString() === req.user._id.toString());
    }

    if (!isStaff) {
        if (!quiz.isPublished) {
            res.status(403);
            throw new Error("This quiz is not yet published.");
        }
        if (quiz.sourceLectureId) {
            const lecture = await Lecture.findById(quiz.sourceLectureId);
            if (!lecture || !lecture.isPublished) {
                res.status(403);
                throw new Error("This quiz belongs to a lecture that is not yet published.");
            }
        }
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
    const courseId = quiz.courseId;
    await quiz.deleteOne();

    res.json({ message: "Quiz deleted successfully" });
});
