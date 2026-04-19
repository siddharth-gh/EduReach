import Course from "../models/course.model.js";
import Lecture from "../models/lecture.model.js";
import Module from "../models/module.model.js";
import {
    generateLectureMcqSet,
    generateLectureSummary,
    isAiConfigured,
} from "../services/ai.service.js";

const activeLectureJobs = new Set();

const buildLectureText = (lecture) => {
    const contentText =
        lecture.contents
            ?.filter((item) => item.type === "text" && item.data)
            .map((item) => item.data.trim())
            .filter(Boolean)
            .join("\n\n") || "";

    const resourceText =
        lecture.resources
            ?.map((resource) => resource?.extractedText || "")
            .map((value) => value.trim())
            .filter(Boolean)
            .join("\n\n") || "";

    return [contentText, resourceText].filter(Boolean).join("\n\n");
};

const markLectureFailed = async (lectureId, errorMessage) => {
    await Lecture.findByIdAndUpdate(lectureId, {
        $set: {
            "aiSummary.status": "failed",
            "aiSummary.error": errorMessage,
            "aiMcqs.status": "failed",
            "aiMcqs.error": errorMessage,
        },
    });
};

export const queueLectureAiProcessing = async (lectureId) => {
    if (!isAiConfigured() || activeLectureJobs.has(String(lectureId))) {
        return;
    }

    activeLectureJobs.add(String(lectureId));

    try {
        await Lecture.findByIdAndUpdate(lectureId, {
            $set: {
                "aiSummary.status": "processing",
                "aiSummary.error": "",
                "aiMcqs.status": "processing",
                "aiMcqs.error": "",
            },
        });

        const lecture = await Lecture.findById(lectureId).lean();

        if (!lecture) {
            return;
        }

        const [module, lectureCourseText] = await Promise.all([
            Module.findById(lecture.moduleId).lean(),
            Promise.resolve(buildLectureText(lecture)),
        ]);

        const course = module
            ? await Course.findById(module.courseId).lean()
            : null;

        const transcriptText = lecture.transcript?.text || "";

        if (!lectureCourseText && !transcriptText) {
            await Lecture.findByIdAndUpdate(lectureId, {
                $set: {
                    "aiSummary.status": "failed",
                    "aiSummary.error":
                        "Add lecture text first before generating the AI summary.",
                    "aiMcqs.status": "failed",
                    "aiMcqs.error":
                        "Add lecture text first before generating AI MCQs.",
                },
            });
            return;
        }

        const { summary, keyPoints } = await generateLectureSummary({
            courseTitle: course?.title || "Untitled course",
            moduleTitle: module?.title || "Untitled module",
            lectureTitle: lecture.title,
            lectureText: lectureCourseText,
            transcriptText,
        });

        await Lecture.findByIdAndUpdate(lectureId, {
            $set: {
                "aiSummary.status": "ready",
                "aiSummary.text": summary,
                "aiSummary.keyPoints": keyPoints,
                "aiSummary.generatedAt": new Date(),
                "aiSummary.error": "",
                "aiMcqs.status": "processing",
                "aiMcqs.error": "",
            },
        });

        const generatedMcqs = await generateLectureMcqSet({
            courseTitle: course?.title || "Untitled course",
            moduleTitle: module?.title || "Untitled module",
            lectureTitle: lecture.title,
            lectureText: lectureCourseText,
            transcriptText,
        });

        await Lecture.findByIdAndUpdate(lectureId, {
            $set: {
                "aiMcqs.status": "ready",
                "aiMcqs.questions": generatedMcqs,
                "aiMcqs.generatedAt": new Date(),
                "aiMcqs.error": "",
            },
        });
    } catch (error) {
        await markLectureFailed(
            lectureId,
            error.message || "AI lecture processing failed"
        );
    } finally {
        activeLectureJobs.delete(String(lectureId));
    }
};
