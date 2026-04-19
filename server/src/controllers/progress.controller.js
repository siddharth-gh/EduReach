import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import Lecture from "../models/lecture.model.js";
import Module from "../models/module.model.js";
import Progress from "../models/progress.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { awardCourseCompletionAchievement } from "../utils/achievement.utils.js";
import { trackStudentActivity } from "../utils/activity.utils.js";

const recalculateEnrollmentProgress = async (studentId, courseId) => {
    const modules = await Module.find({ courseId }).select("_id");
    const moduleIds = modules.map((moduleItem) => moduleItem._id);

    const totalLectures = await Lecture.countDocuments({
        moduleId: { $in: moduleIds },
    });

    const completedLectures = await Progress.countDocuments({
        studentId,
        courseId,
        completed: true,
    });

    const progressPercent =
        totalLectures === 0
            ? 0
            : Math.round((completedLectures / totalLectures) * 100);

    const enrollment = await Enrollment.findOne({ studentId, courseId });

    if (!enrollment) {
        return null;
    }

    enrollment.progressPercent = progressPercent;
    enrollment.status = progressPercent === 100 ? "completed" : "active";
    enrollment.completedAt = progressPercent === 100 ? new Date() : null;
    await enrollment.save();

    return enrollment;
};

export const markLectureComplete = asyncHandler(async (req, res) => {
    const { lectureId } = req.params;
    const { completed = true, timeSpentSeconds = 0 } = req.body;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
        res.status(404);
        throw new Error("Lecture not found");
    }

    const moduleItem = await Module.findById(lecture.moduleId);
    if (!moduleItem) {
        res.status(404);
        throw new Error("Module not found");
    }

    const course = await Course.findById(moduleItem.courseId);
    if (!course) {
        res.status(404);
        throw new Error("Course not found");
    }

    const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: course._id,
    });

    if (!enrollment) {
        res.status(403);
        throw new Error("Enroll in the course before tracking progress");
    }

    const progress = await Progress.findOneAndUpdate(
        {
            studentId: req.user._id,
            lectureId: lecture._id,
        },
        {
            studentId: req.user._id,
            courseId: course._id,
            moduleId: moduleItem._id,
            lectureId: lecture._id,
            completed,
            completedAt: completed ? new Date() : null,
            lastViewedAt: new Date(),
            $inc: { timeSpentSeconds: Math.max(Number(timeSpentSeconds) || 0, 0) },
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }
    );

    const updatedEnrollment = await recalculateEnrollmentProgress(
        req.user._id,
        course._id
    );
    const student = await trackStudentActivity(req.user._id);

    if (updatedEnrollment?.status === "completed") {
        await awardCourseCompletionAchievement(req.user._id, course._id);
    }

    res.json({
        progress,
        enrollment: updatedEnrollment,
        student: student
            ? {
                  id: student._id,
                  streakCount: student.streakCount,
                  lastActiveAt: student.lastActiveAt,
              }
            : null,
    });
});

export const getCourseProgress = asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: req.params.courseId,
    });

    if (!enrollment) {
        res.status(404);
        throw new Error("Enrollment not found for this course");
    }

    const progress = await Progress.find({
        studentId: req.user._id,
        courseId: req.params.courseId,
    })
        .populate("lectureId", "title order moduleId")
        .populate("moduleId", "title order")
        .sort({ updatedAt: -1 });

    res.json({
        enrollment,
        progress,
    });
});

export const getMyProgressOverview = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("streakCount lastActiveAt");
    const enrollments = await Enrollment.find({ studentId: req.user._id })
        .populate("courseId", "title description")
        .sort({ updatedAt: -1 });

    const totalCompletedLectures = await Progress.countDocuments({
        studentId: req.user._id,
        completed: true,
    });

    res.json({
        stats: {
            enrolledCourses: enrollments.length,
            completedLectures: totalCompletedLectures,
            completedCourses: enrollments.filter(
                (enrollment) => enrollment.status === "completed"
            ).length,
            streakCount: user?.streakCount ?? 0,
            lastActiveAt: user?.lastActiveAt ?? null,
        },
        enrollments,
    });
});
