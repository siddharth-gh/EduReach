import Course from "../models/course.model.js";
import Lecture from "../models/lecture.model.js";
import Module from "../models/module.model.js";
import Note from "../models/note.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { trackStudentActivity } from "../utils/activity.utils.js";

const getLectureContext = async (lectureId) => {
    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
        const error = new Error("Lecture not found");
        error.statusCode = 404;
        throw error;
    }

    const moduleItem = await Module.findById(lecture.moduleId);

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

    return { lecture, moduleItem, course };
};

export const upsertLectureNote = asyncHandler(async (req, res) => {
    const { content = "" } = req.body;
    const { lecture, moduleItem, course } = await getLectureContext(req.params.lectureId);

    const note = await Note.findOneAndUpdate(
        {
            studentId: req.user._id,
            lectureId: lecture._id,
        },
        {
            studentId: req.user._id,
            courseId: course._id,
            moduleId: moduleItem._id,
            lectureId: lecture._id,
            content,
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }
    );

    const student = await trackStudentActivity(req.user._id);

    res.json({
        note,
        student: student
            ? {
                  id: student._id,
                  streakCount: student.streakCount,
                  lastActiveAt: student.lastActiveAt,
              }
            : null,
    });
});

export const getLectureNote = asyncHandler(async (req, res) => {
    const note = await Note.findOne({
        studentId: req.user._id,
        lectureId: req.params.lectureId,
    });

    res.json(note || null);
});

export const getMyNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ studentId: req.user._id })
        .populate("lectureId", "title")
        .populate("courseId", "title")
        .sort({ updatedAt: -1 });

    res.json(notes);
});
