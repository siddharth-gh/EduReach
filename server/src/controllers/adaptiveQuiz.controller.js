import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import Lecture from "../models/lecture.model.js";
import Module from "../models/module.model.js";
import AdaptiveQuizSession from "../models/adaptiveQuizSession.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { trackStudentActivity } from "../utils/activity.utils.js";

const DIFFICULTIES = ["easy", "medium", "hard"];
const TARGET_QUESTION_COUNT = 10;

const asId = (value) => String(value?._id || value || "");

const sanitizeQuestion = (question, session) => ({
    id: asId(question._id),
    question: question.question,
    options: question.options,
    difficulty: question.difficulty,
    concept: question.concept,
    learningObjective: question.learningObjective,
    questionNumber: session.answers.length + 1,
    totalQuestions: session.targetQuestionCount,
});

const getQuestionBank = (lecture) =>
    lecture.aiQuestionBank?.questions?.filter(
        (question) => question.question && question.options?.length === 4
    ) || [];

const getConceptMastery = (session, concept) =>
    Number(session.conceptMastery?.get?.(concept) ?? 50);

const setConceptMastery = (session, concept, value) => {
    session.conceptMastery.set(concept, Math.max(0, Math.min(100, value)));
};

const summarizeSession = (session) => {
    const masteryEntries = Array.from(session.conceptMastery.entries()).map(
        ([concept, mastery]) => ({
            concept,
            mastery: Math.round(mastery),
        })
    );

    return {
        status: session.status,
        answeredCount: session.answers.length,
        targetQuestionCount: session.targetQuestionCount,
        score: session.score,
        correctCount: session.answers.filter((answer) => answer.isCorrect).length,
        weakConcepts: masteryEntries
            .filter((item) => item.mastery < 60)
            .sort((a, b) => a.mastery - b.mastery),
        strongConcepts: masteryEntries
            .filter((item) => item.mastery >= 75)
            .sort((a, b) => b.mastery - a.mastery),
        conceptMastery: masteryEntries.sort((a, b) =>
            a.concept.localeCompare(b.concept)
        ),
    };
};

const ensureLectureAccess = async (lectureId, user) => {
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

    if (user.role === "student") {
        const enrollment = await Enrollment.findOne({
            studentId: user._id,
            courseId: course._id,
        });

        if (!enrollment) {
            const error = new Error(
                "Enroll in the course before starting adaptive practice"
            );
            error.statusCode = 403;
            throw error;
        }
    } else if (
        user.role !== "admin" &&
        course.teacherId.toString() !== user._id.toString()
    ) {
        const error = new Error("Not authorized to practice this lecture");
        error.statusCode = 403;
        throw error;
    }

    return lecture;
};

const chooseDifficulty = ({ currentDifficulty, isCorrect, streak }) => {
    const currentIndex = DIFFICULTIES.indexOf(currentDifficulty);

    if (isCorrect && streak >= 2) {
        return DIFFICULTIES[Math.min(DIFFICULTIES.length - 1, currentIndex + 1)];
    }

    if (!isCorrect) {
        return DIFFICULTIES[Math.max(0, currentIndex - 1)];
    }

    return currentDifficulty;
};

const getRecentStreak = (answers, isCorrect) => {
    let count = 0;

    for (let index = answers.length - 1; index >= 0; index -= 1) {
        if (answers[index].isCorrect !== isCorrect) {
            break;
        }
        count += 1;
    }

    return count;
};

const findQuestionByPreference = ({
    questionBank,
    servedQuestionIds,
    difficulty,
    concept,
}) => {
    const served = new Set(servedQuestionIds.map(asId));
    const unanswered = questionBank.filter(
        (question) => !served.has(asId(question._id))
    );

    const matchingConceptAndDifficulty = unanswered.find(
        (question) =>
            question.concept === concept && question.difficulty === difficulty
    );
    if (matchingConceptAndDifficulty) {
        return matchingConceptAndDifficulty;
    }

    const matchingDifficulty = unanswered.find(
        (question) => question.difficulty === difficulty
    );
    if (matchingDifficulty) {
        return matchingDifficulty;
    }

    const matchingConcept = unanswered.find(
        (question) => question.concept === concept
    );
    if (matchingConcept) {
        return matchingConcept;
    }

    return unanswered[0] || null;
};

const getWeakestConcept = (session) => {
    const entries = Array.from(session.conceptMastery.entries());

    if (entries.length === 0) {
        return "";
    }

    return entries.sort((a, b) => a[1] - b[1])[0][0];
};

const chooseNextQuestion = ({
    lecture,
    session,
    preferredDifficulty = "medium",
    preferredConcept = "",
}) => {
    const questionBank = getQuestionBank(lecture);
    const concept = preferredConcept || getWeakestConcept(session);

    return findQuestionByPreference({
        questionBank,
        servedQuestionIds: session.servedQuestionIds,
        difficulty: preferredDifficulty,
        concept,
    });
};

const completeSession = async (session) => {
    const correctCount = session.answers.filter((answer) => answer.isCorrect)
        .length;

    session.status = "completed";
    session.currentQuestionId = null;
    session.completedAt = new Date();
    session.score =
        session.answers.length === 0
            ? 0
            : Math.round((correctCount / session.answers.length) * 100);

    await session.save();
};

export const startAdaptiveQuiz = asyncHandler(async (req, res) => {
    const lecture = await ensureLectureAccess(req.params.lectureId, req.user);
    const questionBank = getQuestionBank(lecture);

    if (lecture.aiQuestionBank?.status !== "ready" || questionBank.length === 0) {
        res.status(409);
        throw new Error("Adaptive question bank is not ready yet");
    }

    const firstQuestion =
        questionBank.find((question) => question.difficulty === "medium") ||
        questionBank[0];

    const session = await AdaptiveQuizSession.create({
        lectureId: lecture._id,
        studentId: req.user._id,
        targetQuestionCount: Math.min(TARGET_QUESTION_COUNT, questionBank.length),
        currentDifficulty: firstQuestion.difficulty,
        currentQuestionId: firstQuestion._id,
        servedQuestionIds: [firstQuestion._id],
        conceptMastery: new Map(
            [...new Set(questionBank.map((question) => question.concept))].map(
                (concept) => [concept || "Core concept", 50]
            )
        ),
    });

    res.status(201).json({
        sessionId: session._id,
        session: summarizeSession(session),
        currentQuestion: sanitizeQuestion(firstQuestion, session),
    });
});

export const submitAdaptiveQuizAnswer = asyncHandler(async (req, res) => {
    const { selectedAnswer, questionId, timeTakenSeconds } = req.body;

    if (!Number.isInteger(selectedAnswer) || selectedAnswer < 0 || selectedAnswer > 3) {
        res.status(400);
        throw new Error("selectedAnswer must be 0, 1, 2, or 3");
    }

    const session = await AdaptiveQuizSession.findById(req.params.sessionId);

    if (!session) {
        res.status(404);
        throw new Error("Adaptive quiz session not found");
    }

    if (session.studentId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to submit this adaptive quiz");
    }

    if (session.status === "completed") {
        return res.json({
            sessionId: session._id,
            session: summarizeSession(session),
            currentQuestion: null,
        });
    }

    if (questionId && asId(session.currentQuestionId) !== String(questionId)) {
        res.status(400);
        throw new Error("Answer does not match the current adaptive question");
    }

    const lecture = await Lecture.findById(session.lectureId);
    if (!lecture) {
        res.status(404);
        throw new Error("Lecture not found");
    }

    const currentQuestion = getQuestionBank(lecture).find(
        (question) => asId(question._id) === asId(session.currentQuestionId)
    );

    if (!currentQuestion) {
        res.status(404);
        throw new Error("Current adaptive question was not found");
    }

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const currentMastery = getConceptMastery(session, currentQuestion.concept);
    setConceptMastery(
        session,
        currentQuestion.concept,
        currentMastery + (isCorrect ? 18 : -22)
    );

    session.answers.push({
        questionId: currentQuestion._id,
        question: currentQuestion.question,
        selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        difficulty: currentQuestion.difficulty,
        concept: currentQuestion.concept,
        explanation: currentQuestion.explanation,
        remediationHint: currentQuestion.remediationHint,
        timeTakenSeconds: Number(timeTakenSeconds) || 0,
    });

    const streak = getRecentStreak(session.answers, isCorrect);
    const nextDifficulty = chooseDifficulty({
        currentDifficulty: currentQuestion.difficulty,
        isCorrect,
        streak,
    });
    const nextConcept = isCorrect ? getWeakestConcept(session) : currentQuestion.concept;
    const nextQuestion = chooseNextQuestion({
        lecture,
        session,
        preferredDifficulty: nextDifficulty,
        preferredConcept: nextConcept,
    });

    const shouldComplete =
        session.answers.length >= session.targetQuestionCount || !nextQuestion;

    const feedback = {
        isCorrect,
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
        remediationHint: currentQuestion.remediationHint,
        concept: currentQuestion.concept,
        difficulty: currentQuestion.difficulty,
    };

    if (shouldComplete) {
        await completeSession(session);

        if (req.user.role === "student") {
            await trackStudentActivity(req.user._id);
        }

        return res.json({
            sessionId: session._id,
            session: summarizeSession(session),
            feedback,
            currentQuestion: null,
        });
    }

    session.currentDifficulty = nextQuestion.difficulty;
    session.currentQuestionId = nextQuestion._id;
    session.servedQuestionIds.push(nextQuestion._id);

    const correctCount = session.answers.filter((answer) => answer.isCorrect)
        .length;
    session.score = Math.round((correctCount / session.answers.length) * 100);
    await session.save();

    res.json({
        sessionId: session._id,
        session: summarizeSession(session),
        feedback,
        currentQuestion: sanitizeQuestion(nextQuestion, session),
    });
});
