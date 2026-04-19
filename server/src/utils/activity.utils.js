import User from "../models/user.model.js";
import { awardStreakAchievement } from "./achievement.utils.js";

const startOfDay = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

export const trackStudentActivity = async (studentId) => {
    const user = await User.findById(studentId);

    if (!user) {
        return null;
    }

    const now = new Date();
    const today = startOfDay(now);
    const lastActiveDate = user.lastActiveAt ? startOfDay(user.lastActiveAt) : null;

    if (!lastActiveDate) {
        user.streakCount = 1;
    } else {
        const dayDifference = Math.round(
            (today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDifference <= 0) {
            user.streakCount = Math.max(user.streakCount, 1);
        } else if (dayDifference === 1) {
            user.streakCount += 1;
        } else {
            user.streakCount = 1;
        }
    }

    user.lastActiveAt = now;
    await user.save();

    await awardStreakAchievement(user._id, user.streakCount);

    return user;
};
