import Achievement from "../models/achievement.model.js";
import Course from "../models/course.model.js";
import Quiz from "../models/quiz.model.js";

export const awardCourseCompletionAchievement = async (studentId, courseId) => {
    const course = await Course.findById(courseId).select("title");

    if (!course) {
        return null;
    }

    return Achievement.findOneAndUpdate(
        {
            studentId,
            courseId,
            type: "course-completion",
        },
        {
            studentId,
            courseId,
            type: "course-completion",
            title: `${course.title} Certificate`,
            description: `Awarded for completing ${course.title}.`,
            awardedAt: new Date(),
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }
    );
};

export const awardQuizMasteryAchievement = async (studentId, quizId) => {
    const quiz = await Quiz.findById(quizId).select("title courseId");

    if (!quiz) {
        return null;
    }

    const existingAchievement = await Achievement.findOne({
        studentId,
        courseId: quiz.courseId,
        type: "quiz-mastery",
        title: `${quiz.title} Mastery`,
    });

    if (existingAchievement) {
        return existingAchievement;
    }

    return Achievement.create({
        studentId,
        courseId: quiz.courseId,
        type: "quiz-mastery",
        title: `${quiz.title} Mastery`,
        description: `Awarded for scoring at least 90% on ${quiz.title}.`,
    });
};

export const awardStreakAchievement = async (studentId, streakCount) => {
    const milestones = [3, 7, 14];

    if (!milestones.includes(streakCount)) {
        return null;
    }

    const title = `${streakCount}-Day Learning Streak`;

    const existingAchievement = await Achievement.findOne({
        studentId,
        type: "streak",
        title,
    });

    if (existingAchievement) {
        return existingAchievement;
    }

    return Achievement.create({
        studentId,
        type: "streak",
        title,
        description: `Awarded for staying active for ${streakCount} consecutive days.`,
    });
};
