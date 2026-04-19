import Achievement from "../models/achievement.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMyAchievements = asyncHandler(async (req, res) => {
    const achievements = await Achievement.find({ studentId: req.user._id })
        .populate("courseId", "title description teacherId")
        .sort({ awardedAt: -1 });

    res.json(achievements);
});

export const getMyCertificate = asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: req.params.courseId,
        status: "completed",
    });

    if (!enrollment) {
        res.status(404);
        throw new Error("Completed enrollment not found for this course");
    }

    const course = await Course.findById(req.params.courseId).populate(
        "teacherId",
        "name email"
    );

    if (!course) {
        res.status(404);
        throw new Error("Course not found");
    }

    res.json({
        student: {
            name: req.user.name,
            email: req.user.email,
        },
        course: {
            id: course._id,
            title: course.title,
            description: course.description,
            teacherName: course.teacherId?.name || "EduReach",
        },
        completedAt: enrollment.completedAt,
    });
});
