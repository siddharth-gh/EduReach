import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import Module from "../models/module.model.js";
import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getTeacherOverview = asyncHandler(async (req, res) => {
    const teacherId =
        req.user.role === "admin" && req.query.teacherId
            ? req.query.teacherId
            : req.user._id;

    const courses = await Course.find({ teacherId }).select("title");
    const courseIds = courses.map((course) => course._id);
    const modules = await Module.find({ courseId: { $in: courseIds } }).select(
        "courseId title"
    );
    const quizzes = await Quiz.find({ courseId: { $in: courseIds } }).select(
        "courseId title"
    );
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
    const attempts = await QuizAttempt.find({ quizId: { $in: quizzes.map((quiz) => quiz._id) } });

    const averageQuizScore =
        attempts.length === 0
            ? 0
            : Math.round(
                  attempts.reduce((sum, attempt) => sum + attempt.score, 0) /
                      attempts.length
              );

    const coursePerformance = courses
        .map((course) => {
            const courseEnrollments = enrollments.filter(
                (enrollment) => enrollment.courseId.toString() === course._id.toString()
            );
            const courseModules = modules.filter(
                (moduleItem) => moduleItem.courseId.toString() === course._id.toString()
            );
            const courseQuizzes = quizzes.filter(
                (quiz) => quiz.courseId.toString() === course._id.toString()
            );
            const courseAttempts = attempts.filter((attempt) =>
                courseQuizzes.some(
                    (quiz) => quiz._id.toString() === attempt.quizId.toString()
                )
            );

            const averageScore =
                courseAttempts.length === 0
                    ? 0
                    : Math.round(
                          courseAttempts.reduce(
                              (sum, attempt) => sum + attempt.score,
                              0
                          ) / courseAttempts.length
                      );

            return {
                courseId: course._id,
                title: course.title,
                modules: courseModules.length,
                quizzes: courseQuizzes.length,
                enrollments: courseEnrollments.length,
                averageScore,
            };
        })
        .sort((a, b) => b.enrollments - a.enrollments || a.title.localeCompare(b.title));

    const hardestQuiz = quizzes
        .map((quiz) => {
            const quizAttempts = attempts.filter(
                (attempt) => attempt.quizId.toString() === quiz._id.toString()
            );
            const average =
                quizAttempts.length === 0
                    ? 100
                    : quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
                      quizAttempts.length;

            return {
                title: quiz.title,
                averageScore: Math.round(average),
            };
        })
        .sort((a, b) => a.averageScore - b.averageScore)[0] || null;

    res.json({
        stats: {
            totalCourses: courses.length,
            totalModules: modules.length,
            totalEnrollments: enrollments.length,
            averageQuizScore,
        },
        hardestQuiz,
        coursePerformance,
        courses,
    });
});

export const getAdminOverview = asyncHandler(async (req, res) => {
    const [totalUsers, totalStudents, totalTeachers, totalCourses, totalEnrollments] =
        await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "teacher" }),
            Course.countDocuments(),
            Enrollment.countDocuments(),
        ]);

    const completedEnrollments = await Enrollment.countDocuments({
        status: "completed",
    });
    const activeEnrollments = totalEnrollments - completedEnrollments;
    const completionRate =
        totalEnrollments === 0
            ? 0
            : Math.round((completedEnrollments / totalEnrollments) * 100);

    res.json({
        stats: {
            totalUsers,
            totalStudents,
            totalTeachers,
            totalCourses,
            totalEnrollments,
            completedEnrollments,
            activeEnrollments,
            completionRate,
        },
        roleDistribution: [
            { label: "Students", value: totalStudents },
            { label: "Teachers", value: totalTeachers },
            { label: "Admins", value: Math.max(totalUsers - totalStudents - totalTeachers, 0) },
        ],
        enrollmentBreakdown: [
            { label: "Completed", value: completedEnrollments },
            { label: "Active", value: activeEnrollments },
        ],
    });
});
