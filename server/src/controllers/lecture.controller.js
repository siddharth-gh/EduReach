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
    const { moduleId, title, order, contents, resources, transcript, videoJobId } = req.body;

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
        videoJobId,
    });

    module.lectureIds.push(lecture._id);
    await module.save();

    // Check if the background job already finished while we were saving
    if (videoJobId) {
        const { getVideoJob } = await import("../utils/videoJobStore.js");
        const job = getVideoJob(videoJobId);
        
        if (job && (job.status === 'completed' || job.status === 'ready') && job.result) {
            console.log(`[Lecture] Found pre-completed job for ${videoJobId}. Applying results immediately.`);
            lecture.transcript = {
                status: 'ready',
                text: job.result.transcript?.text || job.result.extractedText || "",
                source: job.result.transcript?.source || (job.result.mimeType?.includes('pdf') ? "pdf-parser" : "office-parser"),
                error: ""
            };
            
            // Update resource if it's a document/presentation
            if (lecture.resources && lecture.resources.length > 0) {
                lecture.resources[0].extractedText = job.result.extractedText;
                lecture.resources[0].isOptimized = job.result.isOptimized;
            }
            
            await lecture.save();
        }
    }

    if (!lecture.videoJobId || lecture.transcript?.status === 'ready') {
        queueLectureAiProcessing(lecture._id).catch((error) => {
            console.error("Lecture AI processing failed after create:", error);
        });
    }

    res.status(201).json(lecture);
});

// @desc Get lectures by module
// @route GET /api/lectures/:moduleId
export const getLecturesByModule = asyncHandler(async (req, res) => {
    const moduleId = req.params.moduleId;
    const module = await Module.findById(moduleId);
    if (!module) {
        res.status(404);
        throw new Error("Module not found");
    }

    const course = await Course.findById(module.courseId);
    
    let canSeeDrafts = false;
    if (req.user) {
        if (req.user.role === "admin" || (req.user.role === "teacher" && course.teacherId && course.teacherId.toString() === req.user._id.toString())) {
            canSeeDrafts = true;
        }
    }

    const filter = { moduleId };
    if (!canSeeDrafts) {
        filter.isPublished = true;
    }

    const lectures = await Lecture.find(filter).sort({ order: 1 });
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

    if (!lecture.isPublished) {
        const module = await Module.findById(lecture.moduleId);
        const course = await Course.findById(module?.courseId);
        let canSeeDrafts = false;
        if (req.user) {
            if (req.user.role === "admin" || (req.user.role === "teacher" && course.teacherId && course.teacherId.toString() === req.user._id.toString())) {
                canSeeDrafts = true;
            }
        }
        
        if (!canSeeDrafts) {
            res.status(403);
            throw new Error("This lecture is a draft and not yet available.");
        }
    }

    res.json(lecture);
});

// @desc Update Lecture
// @route PUT /api/lectures/:id
export const updateLecture = asyncHandler(async (req, res) => {
    const { title, order, contents, resources, transcript, videoJobId } = req.body;

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
    if (videoJobId !== undefined) lecture.videoJobId = videoJobId;

    await lecture.save();

    if (!lecture.videoJobId || lecture.transcript?.status === 'ready') {
        queueLectureAiProcessing(lecture._id).catch((error) => {
            console.error("Lecture AI processing failed after update:", error);
        });
    }

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

// @desc Publish/Unpublish Lecture
// @route PATCH /api/lectures/:id/publish
export const togglePublishLecture = asyncHandler(async (req, res) => {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
        res.status(404);
        throw new Error("Lecture not found");
    }

    const module = await Module.findById(lecture.moduleId);
    const course = await Course.findById(module?.courseId);

    if (!course || (req.user.role !== "admin" && course.teacherId.toString() !== req.user._id.toString())) {
        res.status(403);
        throw new Error("Not authorized to publish this lecture");
    }

    // Only allow publishing if AI summary and question bank are ready
    if (!lecture.isPublished) {
        if (lecture.aiSummary?.status !== 'ready' || lecture.aiQuestionBank?.status !== 'ready') {
            res.status(400);
            throw new Error("Cannot publish: AI processing (Summary/Quiz) is still in progress.");
        }
    }

    lecture.isPublished = !lecture.isPublished;
    await lecture.save();

    res.json(lecture);
});
