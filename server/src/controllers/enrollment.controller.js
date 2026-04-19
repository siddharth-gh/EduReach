import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const enrollInCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.body;

    if (!courseId) {
        res.status(400);
        throw new Error("courseId is required");
    }

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error("Course not found");
    }

    const existingEnrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId,
    });

    if (existingEnrollment) {
        res.status(400);
        throw new Error("You are already enrolled in this course");
    }

    const enrollment = await Enrollment.create({
        studentId: req.user._id,
        courseId,
    });

    res.status(201).json(enrollment);
});

export const getMyEnrollments = asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
        .populate({
            path: "courseId",
            populate: { path: "teacherId", select: "name email" },
        })
        .sort({ enrolledAt: -1 });

    res.json(enrollments);
});

export const getCourseEnrollments = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
        res.status(404);
        throw new Error("Course not found");
    }

    if (
        req.user.role !== "admin" &&
        course.teacherId.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error("Not authorized to view enrollments for this course");
    }

    const enrollments = await Enrollment.find({ courseId: req.params.courseId })
        .populate("studentId", "name email role")
        .sort({ enrolledAt: -1 });

    res.json(enrollments);
});
