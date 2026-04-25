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

    const totalCompletion = enrollments.reduce((sum, e) => sum + (e.progressPercent || 0), 0);
    const averageCompletion = enrollments.length === 0 ? 0 : Math.round(totalCompletion / enrollments.length);

    // Monthly engagement for the last 12 months
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            month: d.toLocaleString('default', { month: 'short' }),
            year: d.getFullYear(),
            count: 0
        });
    }

    enrollments.forEach(e => {
        const ed = new Date(e.enrolledAt);
        const monthIndex = months.findIndex(m => 
            m.month === ed.toLocaleString('default', { month: 'short' }) && 
            m.year === ed.getFullYear()
        );
        if (monthIndex !== -1) months[monthIndex].count++;
    });

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
            averageCompletion,
        },
        monthlyEngagement: months,
        hardestQuiz,
        coursePerformance,
        courses,
    });
});

export const getTeacherStudents = asyncHandler(async (req, res) => {
    const teacherId =
        req.user.role === "admin" && req.query.teacherId
            ? req.query.teacherId
            : req.user._id;

    const courses = await Course.find({ teacherId }).select("_id");
    const courseIds = courses.map((c) => c._id);

    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
        .populate("studentId", "name email profileImage")
        .populate("courseId", "title");

    // Group by Course
    const courseMap = {};
    enrollments.forEach((e) => {
        if (!e.courseId || !e.studentId) return;
        const cId = e.courseId._id.toString();
        if (!courseMap[cId]) {
            courseMap[cId] = {
                courseId: e.courseId._id,
                title: e.courseId.title,
                students: []
            };
        }
        courseMap[cId].students.push({
            studentId: e.studentId._id,
            name: e.studentId.name,
            email: e.studentId.email,
            profileImage: e.studentId.profileImage,
            enrolledAt: e.enrolledAt,
            status: e.status,
            progressPercent: e.progressPercent
        });
    });

    res.json(Object.values(courseMap));
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
