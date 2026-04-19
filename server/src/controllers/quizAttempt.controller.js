import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import Module from "../models/module.model.js";
import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { awardQuizMasteryAchievement } from "../utils/achievement.utils.js";
import { trackStudentActivity } from "../utils/activity.utils.js";

const computeAttemptResult = (quiz, submittedAnswers = []) => {
    const answers = quiz.questions.map((question, index) => {
        const submitted = submittedAnswers.find(
            (answer) => answer.questionIndex === index
        );
        const selectedOption =
            submitted && Number.isInteger(submitted.selectedOption)
                ? submitted.selectedOption
                : -1;
        const isCorrect = selectedOption === question.correctAnswer;

        return {
            questionIndex: index,
            selectedOption,
            isCorrect,
        };
    });

    const correctCount = answers.filter((answer) => answer.isCorrect).length;
    const score =
        quiz.questions.length === 0
            ? 0
            : Math.round((correctCount / quiz.questions.length) * 100);

    return {
        answers,
        score,
        passed: score >= quiz.passingScore,
    };
};

const ensureTeacherOrAdminForQuiz = async (quiz, user) => {
    const moduleItem = await Module.findById(quiz.moduleId);
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
        const error = new Error("Not authorized to view attempts for this quiz");
        error.statusCode = 403;
        throw error;
    }
};

export const submitQuizAttempt = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
        res.status(404);
        throw new Error("Quiz not found");
    }

    const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: quiz.courseId,
    });

    if (!enrollment) {
        res.status(403);
        throw new Error("Enroll in the course before attempting the quiz");
    }

    const result = computeAttemptResult(quiz, req.body.answers);

    const attempt = await QuizAttempt.create({
        quizId: quiz._id,
        studentId: req.user._id,
        answers: result.answers,
        score: result.score,
        passed: result.passed,
    });

    if (result.score >= 90) {
        await awardQuizMasteryAchievement(req.user._id, quiz._id);
    }

    const student = await trackStudentActivity(req.user._id);

    res.status(201).json({
        attempt,
        student: student
            ? {
                  id: student._id,
                  streakCount: student.streakCount,
                  lastActiveAt: student.lastActiveAt,
              }
            : null,
    });
});

export const getMyQuizAttempts = asyncHandler(async (req, res) => {
    const attempts = await QuizAttempt.find({ studentId: req.user._id })
        .populate("quizId", "title moduleId courseId passingScore")
        .sort({ attemptedAt: -1 });

    res.json(attempts);
});

export const getAttemptsByQuiz = asyncHandler(async (req, res) => {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
        res.status(404);
        throw new Error("Quiz not found");
    }

    await ensureTeacherOrAdminForQuiz(quiz, req.user);

    const attempts = await QuizAttempt.find({ quizId: quiz._id })
        .populate("studentId", "name email")
        .sort({ attemptedAt: -1 });

    res.json(attempts);
});

export const getMyQuizAttemptById = asyncHandler(async (req, res) => {
    const attempt = await QuizAttempt.findById(req.params.id).populate(
        "quizId",
        "title moduleId courseId passingScore questions"
    );

    if (!attempt) {
        res.status(404);
        throw new Error("Quiz attempt not found");
    }

    if (attempt.studentId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to view this quiz attempt");
    }

    res.json(attempt);
});
