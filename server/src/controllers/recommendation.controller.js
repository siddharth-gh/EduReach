import Enrollment from "../models/enrollment.model.js";
import Lecture from "../models/lecture.model.js";
import Module from "../models/module.model.js";
import Progress from "../models/progress.model.js";
import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import Course from "../models/course.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMyRecommendations = asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({
        studentId: req.user._id,
        status: { $in: ["active", "completed"] },
    })
        .populate("courseId", "title description")
        .sort({ updatedAt: -1 });

    const recommendations = [];

    for (const enrollment of enrollments) {
        const modules = await Module.find({ courseId: enrollment.courseId._id }).sort({
            order: 1,
        });
        const moduleIds = modules.map((moduleItem) => moduleItem._id);
        const lectures = await Lecture.find({ moduleId: { $in: moduleIds } }).sort({
            order: 1,
        });
        const progress = await Progress.find({
            studentId: req.user._id,
            courseId: enrollment.courseId._id,
        });

        const completedLectureIds = new Set(
            progress
                .filter((item) => item.completed)
                .map((item) => item.lectureId.toString())
        );

        const nextLecture = lectures.find(
            (lecture) => !completedLectureIds.has(lecture._id.toString())
        );

        if (nextLecture) {
            recommendations.push({
                type: "lecture",
                targetId: nextLecture._id,
                title: nextLecture.title,
                courseTitle: enrollment.courseId.title,
                reason: "Continue your next incomplete lecture",
            });
        }

        const quizzes = await Quiz.find({ courseId: enrollment.courseId._id });
        if (quizzes.length > 0) {
            const attempts = await QuizAttempt.find({
                studentId: req.user._id,
                quizId: { $in: quizzes.map((quiz) => quiz._id) },
            }).sort({ attemptedAt: -1 });

            const weakAttempt = attempts.find((attempt) => !attempt.passed);
            if (weakAttempt) {
                const weakQuiz = quizzes.find(
                    (quiz) => quiz._id.toString() === weakAttempt.quizId.toString()
                );

                if (weakQuiz) {
                    recommendations.push({
                        type: "revision",
                        targetId: weakQuiz._id,
                        title: weakQuiz.title,
                        courseTitle: enrollment.courseId.title,
                        reason: "Revise a quiz where you need more practice",
                    });
                }
            }
        }
    }

    if (recommendations.length === 0) {
        const starterCourses = await Course.find().limit(3).select("title description");
        starterCourses.forEach((course) => {
            recommendations.push({
                type: "course",
                targetId: course._id,
                title: course.title,
                courseTitle: course.title,
                reason: "Start with a featured course",
            });
        });
    }

    res.json(recommendations.slice(0, 5));
});
