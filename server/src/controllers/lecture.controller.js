import Lecture from "../models/lecture.model.js";
import Module from "../models/module.model.js";
import Course from "../models/course.model.js";
import Progress from "../models/progress.model.js";
import Note from "../models/note.model.js";
import Quiz from "../models/quiz.model.js";
import AdaptiveQuizSession from "../models/adaptiveQuizSession.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateLectureAssistantReply } from "../services/ai.service.js";
import { queueLectureAiProcessing } from "../utils/lectureAiProcessor.js";

// @desc Create Lecture
// @route POST /api/lectures
export const createLecture = asyncHandler(async (req, res) => {
    const { moduleId, title, order, contents, resources, transcript } = req.body;

    if (!moduleId || !title || order === undefined) {
        res.status(400);
        throw new Error("moduleId, title and order are required");
    }

    const module = await Module.findById(moduleId);
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
        throw new Error("Not authorized to modify this module");
    }

    const lecture = await Lecture.create({
        moduleId,
        title,
        order,
        contents,
        resources,
        transcript,
    });

    module.lectureIds.push(lecture._id);
    await module.save();

    queueLectureAiProcessing(lecture._id).catch((error) => {
        console.error("Lecture AI processing failed after create:", error);
    });

    res.status(201).json(lecture);
});

// @desc Get lectures by module
// @route GET /api/lectures/:moduleId
export const getLecturesByModule = asyncHandler(async (req, res) => {
    const lectures = await Lecture.find({
        moduleId: req.params.moduleId,
    }).sort({ order: 1 });

    res.json(lectures);
});

// @desc Get single lecture
// @route GET /api/lectures/single/:id
export const getLectureById = asyncHandler(async (req, res) => {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
        res.status(404);
        throw new Error("Lecture not found");
    }

    res.json(lecture);
});

// @desc Update Lecture
// @route PUT /api/lectures/:id
export const updateLecture = asyncHandler(async (req, res) => {
    const { title, order, contents, resources, transcript } = req.body;

    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
        res.status(404);
        throw new Error("Lecture not found");
    }

    const module = await Module.findById(lecture.moduleId);
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
        throw new Error("Not authorized to update this lecture");
    }

    if (title) lecture.title = title;
    if (order !== undefined) lecture.order = order;
    if (contents) lecture.contents = contents;
    if (resources) lecture.resources = resources;
    if (transcript) lecture.transcript = transcript;

    await lecture.save();

    queueLectureAiProcessing(lecture._id).catch((error) => {
        console.error("Lecture AI processing failed after update:", error);
    });

    res.json(lecture);
});

export const generateLectureMcqs = asyncHandler(async (req, res) => {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
        res.status(404);
        throw new Error("Lecture not found");
    }

    const module = await Module.findById(lecture.moduleId);
    const course = module ? await Course.findById(module.courseId) : null;
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const lectureText =
        lecture.contents
            ?.filter((item) => item.type === "text" && item.data)
            .map((item) => item.data.trim())
            .filter(Boolean)
            .join("\n\n") || "";

    const response = await generateLectureAssistantReply({
        courseTitle: course?.title || "Untitled course",
        moduleTitle: module?.title || "Untitled module",
        lectureTitle: lecture.title,
        lectureText,
        transcriptText: lecture.transcript?.text || "",
        messages,
    });

    res.json(response);
});

export const refreshLectureAi = asyncHandler(async (req, res) => {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
        res.status(404);
        throw new Error("Lecture not found");
    }

    const module = await Module.findById(lecture.moduleId);
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
        throw new Error("Not authorized to refresh lecture AI");
    }

    queueLectureAiProcessing(lecture._id).catch((error) => {
        console.error("Lecture AI refresh failed:", error);
    });

    res.json({ message: "Lecture AI refresh started." });
});

// @desc Delete Lecture
// @route DELETE /api/lectures/:id
export const deleteLecture = asyncHandler(async (req, res) => {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
        res.status(404);
        throw new Error("Lecture not found");
    }

    const module = await Module.findById(lecture.moduleId);
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
        throw new Error("Not authorized to delete this lecture");
    }

    module.lectureIds = module.lectureIds.filter(
        (id) => id.toString() !== lecture._id.toString()
    );
    await module.save();

    await Progress.deleteMany({ lectureId: lecture._id });
    await Note.deleteMany({ lectureId: lecture._id });
    await Quiz.deleteMany({ sourceLectureId: lecture._id, generatedBy: "ai" });
    await AdaptiveQuizSession.deleteMany({ lectureId: lecture._id });
    await lecture.deleteOne();

    res.json({ message: "Lecture deleted successfully" });
});
