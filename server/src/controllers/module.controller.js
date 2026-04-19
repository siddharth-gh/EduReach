import Module from "../models/module.model.js";
import Course from "../models/course.model.js";
import Lecture from "../models/lecture.model.js";
import Progress from "../models/progress.model.js";
import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import Note from "../models/note.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc Create Module
// @route POST /api/modules
export const createModule = asyncHandler(async (req, res) => {
    const { courseId, title, order } = req.body;

    if (!courseId || !title || order === undefined) {
        res.status(400);
        throw new Error("courseId, title and order are required");
    }

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error("Course not found");
    }

    if (
        req.user.role !== "admin" &&
        course.teacherId.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error("Not authorized to modify this course");
    }

    const module = await Module.create({
        courseId,
        title,
        order,
    });

    course.moduleIds.push(module._id);
    await course.save();

    res.status(201).json(module);
});

// @desc Get modules by course
// @route GET /api/modules/:courseId
export const getModulesByCourse = asyncHandler(async (req, res) => {
    const modules = await Module.find({
        courseId: req.params.courseId,
    }).sort({ order: 1 });

    res.json(modules);
});

// @desc Get single module
// @route GET /api/modules/single/:id
export const getModuleById = asyncHandler(async (req, res) => {
    const module = await Module.findById(req.params.id);

    if (!module) {
        res.status(404);
        throw new Error("Module not found");
    }

    res.json(module);
});

export const updateModule = asyncHandler(async (req, res) => {
    const { title, order } = req.body;

    const module = await Module.findById(req.params.id);
    if (!module) {
        res.status(404);
        throw new Error("Module not found");
    }

    const course = await Course.findById(module.courseId);
    if (!course) {
        res.status(404);
        throw new Error("Course not found");
    }

    if (
        req.user.role !== "admin" &&
        course.teacherId.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error("Not authorized to update this module");
    }

    if (title) module.title = title;
    if (order !== undefined) module.order = order;

    await module.save();

    res.json(module);
});

export const deleteModule = asyncHandler(async (req, res) => {
    const module = await Module.findById(req.params.id);

    if (!module) {
        res.status(404);
        throw new Error("Module not found");
    }

    const course = await Course.findById(module.courseId);
    if (!course) {
        res.status(404);
        throw new Error("Course not found");
    }

    if (
        req.user.role !== "admin" &&
        course.teacherId.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error("Not authorized to delete this module");
    }

    course.moduleIds = course.moduleIds.filter(
        (id) => id.toString() !== module._id.toString()
    );
    await course.save();

    const lectures = await Lecture.find({ moduleId: module._id }).select("_id");
    const lectureIds = lectures.map((lecture) => lecture._id);
    const quizzes = await Quiz.find({ moduleId: module._id }).select("_id");
    const quizIds = quizzes.map((quiz) => quiz._id);

    await Progress.deleteMany({ moduleId: module._id });
    await Lecture.deleteMany({ moduleId: module._id });
    await QuizAttempt.deleteMany({ quizId: { $in: quizIds } });
    await Quiz.deleteMany({ moduleId: module._id });
    await Progress.deleteMany({ lectureId: { $in: lectureIds } });
    await Note.deleteMany({ moduleId: module._id });

    await module.deleteOne();

    res.json({ message: "Module deleted successfully" });
});
