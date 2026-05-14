import Course from "../models/course.model.js";
import Module from "../models/module.model.js";
import Lecture from "../models/lecture.model.js";
import Quiz from "../models/quiz.model.js";

/**
 * Duration rules:
 *  - Video:  actual duration (stored in seconds → converted to minutes)
 *  - Text:   word count ÷ 200 WPM, minimum 1 minute
 *  - Image:  5 minutes flat
 *  - PDF resource: 5 minutes flat
 *  - Quiz:   10 minutes flat
 */

const READING_WPM = 200;
const IMAGE_MINUTES = 5;
const PDF_MINUTES = 5;
const QUIZ_MINUTES = 10;

function countWords(text) {
    if (!text || typeof text !== "string") return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Recalculate and persist `totalDurationMinutes` for a given course.
 * Safe to call from any controller – catches its own errors so it
 * never breaks the caller's response flow.
 */
export async function recalcCourseDuration(courseId) {
    try {
        const modules = await Module.find({ courseId }).select("_id");
        const moduleIds = modules.map((m) => m._id);

        const [lectures, quizzes] = await Promise.all([
            Lecture.find({ moduleId: { $in: moduleIds } }).select(
                "contents resources"
            ),
            Quiz.countDocuments({ courseId }),
        ]);

        let totalMinutes = 0;

        for (const lecture of lectures) {
            // --- Contents ---
            for (const item of lecture.contents || []) {
                switch (item.type) {
                    case "video":
                        // duration is stored in seconds
                        totalMinutes += (item.duration || 0) / 60;
                        break;
                    case "text": {
                        const words = countWords(item.data);
                        totalMinutes += Math.max(words / READING_WPM, 1);
                        break;
                    }
                    case "image":
                        totalMinutes += IMAGE_MINUTES;
                        break;
                    default:
                        break;
                }
            }

            // --- Resources (PDFs) ---
            for (const res of lecture.resources || []) {
                if (res.type === "pdf") {
                    totalMinutes += PDF_MINUTES;
                }
            }
        }

        // --- Quizzes ---
        totalMinutes += quizzes * QUIZ_MINUTES;

        const rounded = Math.round(totalMinutes);

        await Course.findByIdAndUpdate(courseId, {
            totalDurationMinutes: rounded,
        });

        return rounded;
    } catch (err) {
        console.error(
            `[courseDuration] Failed to recalc for course ${courseId}:`,
            err.message
        );
        return null;
    }
}
