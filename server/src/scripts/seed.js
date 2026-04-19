import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Module from "../models/module.model.js";
import Lecture from "../models/lecture.model.js";
import Enrollment from "../models/enrollment.model.js";
import Progress from "../models/progress.model.js";
import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import Achievement from "../models/achievement.model.js";
import Note from "../models/note.model.js";
import { hashPassword } from "../utils/hashPassword.js";

dotenv.config();

const ensureEnv = () => {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
        throw new Error("Missing MONGO_URI or JWT_SECRET in environment");
    }
};

const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

const createLecture = (
    moduleId,
    title,
    order,
    paragraphs,
    imageUrl,
    resources = [],
    extraContents = []
) => {
    const textContents = paragraphs.map((text, index) => ({
        type: "text",
        data: text,
        order: index + 1,
    }));

    const normalizedExtraContents = extraContents.map((content, index) => ({
        ...content,
        order: textContents.length + index + 1,
    }));

    const imageContents = imageUrl
        ? [
              {
                  type: "image",
                  url: imageUrl,
                  order: textContents.length + normalizedExtraContents.length + 1,
              },
          ]
        : [];

    return {
        moduleId,
        title,
        order,
        contents: [...textContents, ...normalizedExtraContents, ...imageContents],
        resources,
    };
};

const createQuiz = (
    courseId,
    moduleId,
    title,
    description,
    questions,
    options = {}
) => ({
    courseId,
    moduleId,
    title,
    description,
    passingScore: options.passingScore ?? 60,
    timeLimitMinutes: options.timeLimitMinutes ?? 10,
    isPublished: options.isPublished ?? true,
    questions,
});

const createQuestion = (questionText, choices, correctAnswer, explanation) => ({
    questionText,
    options: choices,
    correctAnswer,
    explanation,
});

const createAttemptAnswers = (selections, quiz) =>
    selections.map((selectedOption, index) => ({
        questionIndex: index,
        selectedOption,
        isCorrect: selectedOption === quiz.questions[index].correctAnswer,
    }));

const computeScore = (answers) => {
    const correct = answers.filter((answer) => answer.isCorrect).length;
    return answers.length === 0 ? 0 : Math.round((correct / answers.length) * 100);
};

const seed = async () => {
    ensureEnv();
    await connectDB();

    await Promise.all([
        QuizAttempt.deleteMany(),
        Quiz.deleteMany(),
        Progress.deleteMany(),
        Enrollment.deleteMany(),
        Lecture.deleteMany(),
        Module.deleteMany(),
        Course.deleteMany(),
        Achievement.deleteMany(),
        Note.deleteMany(),
        User.deleteMany(),
    ]);

    const password = await hashPassword("password123");

    const [admin, teacherA, teacherB, teacherC, studentA, studentB, studentC] =
        await User.create([
            {
                name: "Admin User",
                email: "admin@edureach.dev",
                password,
                role: "admin",
                bio: "Platform administrator for EduReach demo data.",
            },
            {
                name: "Riya Sharma",
                email: "teacher1@edureach.dev",
                password,
                role: "teacher",
                bio: "Teacher focused on beginner-friendly technology education.",
            },
            {
                name: "Arjun Mehta",
                email: "teacher2@edureach.dev",
                password,
                role: "teacher",
                bio: "Teacher focused on practical science and applied learning.",
            },
            {
                name: "Meera Joseph",
                email: "teacher3@edureach.dev",
                password,
                role: "teacher",
                bio: "Teacher helping students build confidence through communication.",
            },
            {
                name: "Student One",
                email: "student1@edureach.dev",
                password,
                role: "student",
                preferredMode: "low-bandwidth",
                streakCount: 7,
                lastActiveAt: daysAgo(0),
            },
            {
                name: "Student Two",
                email: "student2@edureach.dev",
                password,
                role: "student",
                preferredMode: "normal",
                streakCount: 3,
                lastActiveAt: daysAgo(1),
            },
            {
                name: "Student Three",
                email: "student3@edureach.dev",
                password,
                role: "student",
                preferredMode: "normal",
                streakCount: 1,
                lastActiveAt: daysAgo(4),
            },
        ]);

    const [courseA, courseB, courseC, courseD] = await Course.create([
        {
            title: "Digital Skills for Rural Entrepreneurs",
            description:
                "Learn practical digital tools, online safety, payments, and communication workflows for small businesses.",
            category: "Career",
            level: "beginner",
            teacherId: teacherA._id,
        },
        {
            title: "Foundations of Web Development",
            description:
                "A guided path from HTML basics to frontend application thinking and responsive layouts.",
            category: "Programming",
            level: "intermediate",
            teacherId: teacherA._id,
        },
        {
            title: "Applied Community Science",
            description:
                "Use observation, measurement, and analysis to solve everyday local problems with evidence.",
            category: "Science",
            level: "beginner",
            teacherId: teacherB._id,
        },
        {
            title: "Confident Communication for First-Generation Learners",
            description:
                "Build speaking, note-taking, and interview readiness for academic and career settings.",
            category: "Career",
            level: "beginner",
            teacherId: teacherC._id,
        },
    ]);

    const modules = await Module.create([
        { courseId: courseA._id, title: "Getting Online Safely", order: 1 },
        { courseId: courseA._id, title: "Mobile Productivity Basics", order: 2 },
        { courseId: courseA._id, title: "Digital Payments and Trust", order: 3 },
        { courseId: courseB._id, title: "HTML and Structure", order: 1 },
        { courseId: courseB._id, title: "CSS and Layout", order: 2 },
        { courseId: courseB._id, title: "Components and Reuse", order: 3 },
        { courseId: courseC._id, title: "Observation and Evidence", order: 1 },
        { courseId: courseC._id, title: "Community Problem Solving", order: 2 },
        { courseId: courseD._id, title: "Listening and Note Making", order: 1 },
        { courseId: courseD._id, title: "Presenting with Confidence", order: 2 },
    ]);

    const modulesByCourse = {
        [courseA._id]: modules.filter((item) => item.courseId.toString() === courseA._id.toString()),
        [courseB._id]: modules.filter((item) => item.courseId.toString() === courseB._id.toString()),
        [courseC._id]: modules.filter((item) => item.courseId.toString() === courseC._id.toString()),
        [courseD._id]: modules.filter((item) => item.courseId.toString() === courseD._id.toString()),
    };

    courseA.moduleIds = modulesByCourse[courseA._id].map((item) => item._id);
    courseB.moduleIds = modulesByCourse[courseB._id].map((item) => item._id);
    courseC.moduleIds = modulesByCourse[courseC._id].map((item) => item._id);
    courseD.moduleIds = modulesByCourse[courseD._id].map((item) => item._id);
    await Promise.all([courseA.save(), courseB.save(), courseC.save(), courseD.save()]);

    const lectures = await Lecture.create([
        createLecture(
            modulesByCourse[courseA._id][0]._id,
            "Why online safety matters",
            1,
            [
                "Digital safety protects personal identity, money, and community trust.",
                "Strong passwords and careful app usage reduce everyday risk.",
            ],
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
            [
                {
                    title: "Password Safety Checklist",
                    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    type: "pdf",
                    originalFilename: "password-safety-checklist.pdf",
                },
            ]
        ),
        createLecture(
            modulesByCourse[courseA._id][0]._id,
            "Recognizing scams on mobile",
            2,
            [
                "Scam messages often create urgency, fear, or fake rewards.",
                "A quick pause before clicking can prevent major losses.",
            ],
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
        ),
        createLecture(
            modulesByCourse[courseA._id][1]._id,
            "Using your phone for planning",
            1,
            [
                "Simple mobile habits can improve business planning and communication.",
                "Using reminders and shared notes can organize customer follow-ups.",
            ],
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
        ),
        createLecture(
            modulesByCourse[courseA._id][2]._id,
            "Building trust in digital payments",
            1,
            [
                "Customers adopt digital payments faster when the process feels clear and trustworthy.",
                "Confirming transactions and keeping records builds confidence.",
            ],
            "https://images.unsplash.com/photo-1556740749-887f6717d7e4"
        ),
        createLecture(
            modulesByCourse[courseB._id][0]._id,
            "Understanding HTML tags",
            1,
            [
                "HTML gives structure to headings, text, lists, and links on a webpage.",
                "Semantic tags make a page easier to maintain and understand.",
            ],
            "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
            [
                {
                    title: "HTML Quick Notes",
                    url: "https://www.w3.org/TR/PNG/iso_8859-1.txt",
                    type: "text",
                    originalFilename: "html-quick-notes.txt",
                },
            ]
        ),
        createLecture(
            modulesByCourse[courseB._id][0]._id,
            "Linking pages and navigation",
            2,
            [
                "Navigation depends on meaningful labels and predictable paths.",
                "Links create the flow between pages and learning activities.",
            ],
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
        ),
        createLecture(
            modulesByCourse[courseB._id][1]._id,
            "Building layout with CSS",
            1,
            [
                "CSS controls spacing, typography, and responsive layout behavior.",
                "Well-structured styles improve readability on both large and small screens.",
            ],
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
        ),
        createLecture(
            modulesByCourse[courseB._id][2]._id,
            "Thinking in reusable UI blocks",
            1,
            [
                "Reusable components reduce duplication and make interfaces easier to scale.",
                "A small design system creates consistency across pages.",
            ],
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4"
        ),
        createLecture(
            modulesByCourse[courseC._id][0]._id,
            "How to observe like a scientist",
            1,
            [
                "Good observations are careful, repeatable, and grounded in evidence.",
                "Clear notes help compare changes over time.",
            ],
            "https://images.unsplash.com/photo-1532094349884-543bc11b234d"
        ),
        createLecture(
            modulesByCourse[courseC._id][1]._id,
            "Turning evidence into action",
            1,
            [
                "Local challenges can be broken into measurable steps and tested solutions.",
                "Small experiments reveal which actions are worth expanding.",
            ],
            "https://images.unsplash.com/photo-1521791136064-7986c2920216"
        ),
        createLecture(
            modulesByCourse[courseD._id][0]._id,
            "Note making for retention",
            1,
            [
                "Short structured notes help learners revisit the most useful ideas later.",
                "Questions and action points make notes more valuable than copying text.",
            ],
            "https://images.unsplash.com/photo-1455390582262-044cdead277a"
        ),
        createLecture(
            modulesByCourse[courseD._id][1]._id,
            "Speaking with clarity",
            1,
            [
                "Strong delivery comes from structure, not just confidence.",
                "A simple intro-body-close pattern makes presentations easier to follow.",
            ],
            "https://images.unsplash.com/photo-1515169067868-5387ec356754",
            [],
            [
                {
                    type: "video",
                    url: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
                    optimizedUrl:
                        "https://res.cloudinary.com/demo/video/upload/q_auto:good,vc_h264,w_854,c_limit/dog.mp4",
                    thumbnailUrl:
                        "https://res.cloudinary.com/demo/video/upload/so_1/dog.jpg",
                    codec: "h264",
                    duration: 13,
                    originalSize: 3580000,
                    optimizedSize: 1420000,
                    isLowBandwidthOptimized: true,
                },
            ]
        ),
    ]);

    for (const moduleItem of modules) {
        moduleItem.lectureIds = lectures
            .filter((lecture) => lecture.moduleId.toString() === moduleItem._id.toString())
            .map((lecture) => lecture._id);
        await moduleItem.save();
    }

    const quizzes = await Quiz.create([
        createQuiz(
            courseA._id,
            modulesByCourse[courseA._id][0]._id,
            "Online Safety Check",
            "Assessment for the online safety module.",
            [
                createQuestion(
                    "Which habit most improves online account safety?",
                    ["Using weak passwords", "Sharing OTPs", "Using unique passwords", "Ignoring updates"],
                    2,
                    "Unique passwords reduce the damage from any single account compromise."
                ),
                createQuestion(
                    "What is a common scam warning sign?",
                    ["Urgent pressure to act immediately", "A message from a saved contact", "Clear business information", "A known support ticket number"],
                    0,
                    "Scams often create urgency so you skip verification."
                ),
            ]
        ),
        createQuiz(
            courseB._id,
            modulesByCourse[courseB._id][0]._id,
            "HTML Basics Quiz",
            "Assessment for HTML fundamentals.",
            [
                createQuestion(
                    "What is HTML mainly used for?",
                    ["Styling pages", "Structuring content", "Running databases", "Compressing images"],
                    1,
                    "HTML defines the structure and meaning of page content."
                ),
                createQuestion(
                    "Which tag is used for the largest top-level heading?",
                    ["<p>", "<h1>", "<section>", "<title>"],
                    1,
                    "The h1 tag represents the primary heading on a page."
                ),
            ]
        ),
        createQuiz(
            courseB._id,
            modulesByCourse[courseB._id][1]._id,
            "CSS Layout Quiz",
            "Assessment for CSS layout understanding.",
            [
                createQuestion(
                    "What does CSS primarily control?",
                    ["Structure", "Visual presentation", "Database connections", "Authentication"],
                    1,
                    "CSS handles layout, spacing, colors, and other presentation rules."
                ),
                createQuestion(
                    "Why use responsive layout techniques?",
                    ["To remove navigation", "To avoid images", "To adapt to different screen sizes", "To increase backend speed"],
                    2,
                    "Responsive layouts improve usability on many device sizes."
                ),
            ]
        ),
        createQuiz(
            courseC._id,
            modulesByCourse[courseC._id][0]._id,
            "Observation Skills Quiz",
            "Assessment for scientific observation practices.",
            [
                createQuestion(
                    "Which observation is the most scientific?",
                    ["It feels better", "I think it works", "Measured changes over time", "My friend liked it"],
                    2,
                    "Measured evidence is more reliable than impressions."
                ),
                createQuestion(
                    "Why are repeatable notes useful?",
                    ["They make reports longer", "They allow comparison and verification", "They remove the need for measurements", "They replace experiments entirely"],
                    1,
                    "Repeatable notes help validate whether changes are real."
                ),
            ]
        ),
        createQuiz(
            courseD._id,
            modulesByCourse[courseD._id][1]._id,
            "Confident Speaking Quiz",
            "Assessment for presentation structure and delivery.",
            [
                createQuestion(
                    "What helps listeners follow a presentation more easily?",
                    ["Random ideas", "A clear structure", "Speaking very fast", "Using difficult words"],
                    1,
                    "Clear structure makes talks easier to understand."
                ),
                createQuestion(
                    "What is a strong closing move in a short talk?",
                    ["Introduce a new topic", "Apologize repeatedly", "Summarize the main point", "Stop without a final line"],
                    2,
                    "A summary helps the audience remember the main message."
                ),
            ]
        ),
    ]);

    const [attemptA1Answers, attemptA2Answers, attemptB1Answers, attemptC1Answers, attemptC2Answers] = [
        createAttemptAnswers([2, 0], quizzes[0]),
        createAttemptAnswers([1, 1], quizzes[1]),
        createAttemptAnswers([1, 2], quizzes[2]),
        createAttemptAnswers([1, 1], quizzes[3]),
        createAttemptAnswers([1, 2], quizzes[4]),
    ];

    const enrollments = await Enrollment.create([
        {
            studentId: studentA._id,
            courseId: courseA._id,
            progressPercent: 50,
            status: "active",
        },
        {
            studentId: studentA._id,
            courseId: courseB._id,
            progressPercent: 100,
            status: "completed",
            completedAt: daysAgo(2),
        },
        {
            studentId: studentA._id,
            courseId: courseD._id,
            progressPercent: 0,
            status: "active",
        },
        {
            studentId: studentB._id,
            courseId: courseC._id,
            progressPercent: 50,
            status: "active",
        },
        {
            studentId: studentB._id,
            courseId: courseA._id,
            progressPercent: 25,
            status: "active",
        },
        {
            studentId: studentC._id,
            courseId: courseD._id,
            progressPercent: 100,
            status: "completed",
            completedAt: daysAgo(1),
        },
    ]);

    await Progress.create([
        {
            studentId: studentA._id,
            courseId: courseA._id,
            moduleId: modulesByCourse[courseA._id][0]._id,
            lectureId: lectures[0]._id,
            completed: true,
            completedAt: daysAgo(1),
            lastViewedAt: daysAgo(1),
            timeSpentSeconds: 480,
        },
        {
            studentId: studentA._id,
            courseId: courseA._id,
            moduleId: modulesByCourse[courseA._id][0]._id,
            lectureId: lectures[1]._id,
            completed: false,
            lastViewedAt: daysAgo(0),
            timeSpentSeconds: 220,
        },
        {
            studentId: studentA._id,
            courseId: courseB._id,
            moduleId: modulesByCourse[courseB._id][0]._id,
            lectureId: lectures[4]._id,
            completed: true,
            completedAt: daysAgo(4),
            lastViewedAt: daysAgo(4),
            timeSpentSeconds: 640,
        },
        {
            studentId: studentA._id,
            courseId: courseB._id,
            moduleId: modulesByCourse[courseB._id][0]._id,
            lectureId: lectures[5]._id,
            completed: true,
            completedAt: daysAgo(4),
            lastViewedAt: daysAgo(4),
            timeSpentSeconds: 410,
        },
        {
            studentId: studentA._id,
            courseId: courseB._id,
            moduleId: modulesByCourse[courseB._id][1]._id,
            lectureId: lectures[6]._id,
            completed: true,
            completedAt: daysAgo(3),
            lastViewedAt: daysAgo(3),
            timeSpentSeconds: 720,
        },
        {
            studentId: studentA._id,
            courseId: courseB._id,
            moduleId: modulesByCourse[courseB._id][2]._id,
            lectureId: lectures[7]._id,
            completed: true,
            completedAt: daysAgo(2),
            lastViewedAt: daysAgo(2),
            timeSpentSeconds: 530,
        },
        {
            studentId: studentB._id,
            courseId: courseC._id,
            moduleId: modulesByCourse[courseC._id][0]._id,
            lectureId: lectures[8]._id,
            completed: true,
            completedAt: daysAgo(1),
            lastViewedAt: daysAgo(1),
            timeSpentSeconds: 360,
        },
        {
            studentId: studentB._id,
            courseId: courseC._id,
            moduleId: modulesByCourse[courseC._id][1]._id,
            lectureId: lectures[9]._id,
            completed: false,
            lastViewedAt: daysAgo(0),
            timeSpentSeconds: 185,
        },
        {
            studentId: studentB._id,
            courseId: courseA._id,
            moduleId: modulesByCourse[courseA._id][0]._id,
            lectureId: lectures[0]._id,
            completed: false,
            lastViewedAt: daysAgo(2),
            timeSpentSeconds: 140,
        },
        {
            studentId: studentC._id,
            courseId: courseD._id,
            moduleId: modulesByCourse[courseD._id][0]._id,
            lectureId: lectures[10]._id,
            completed: true,
            completedAt: daysAgo(2),
            lastViewedAt: daysAgo(2),
            timeSpentSeconds: 300,
        },
        {
            studentId: studentC._id,
            courseId: courseD._id,
            moduleId: modulesByCourse[courseD._id][1]._id,
            lectureId: lectures[11]._id,
            completed: true,
            completedAt: daysAgo(1),
            lastViewedAt: daysAgo(1),
            timeSpentSeconds: 330,
        },
    ]);

    await QuizAttempt.create([
        {
            quizId: quizzes[0]._id,
            studentId: studentA._id,
            answers: attemptA1Answers,
            score: computeScore(attemptA1Answers),
            passed: true,
            attemptedAt: daysAgo(1),
        },
        {
            quizId: quizzes[1]._id,
            studentId: studentA._id,
            answers: attemptA2Answers,
            score: computeScore(attemptA2Answers),
            passed: true,
            attemptedAt: daysAgo(3),
        },
        {
            quizId: quizzes[2]._id,
            studentId: studentA._id,
            answers: attemptB1Answers,
            score: computeScore(attemptB1Answers),
            passed: true,
            attemptedAt: daysAgo(2),
        },
        {
            quizId: quizzes[3]._id,
            studentId: studentB._id,
            answers: attemptC1Answers,
            score: computeScore(attemptC1Answers),
            passed: false,
            attemptedAt: daysAgo(1),
        },
        {
            quizId: quizzes[4]._id,
            studentId: studentC._id,
            answers: attemptC2Answers,
            score: computeScore(attemptC2Answers),
            passed: true,
            attemptedAt: daysAgo(0),
        },
    ]);

    await Achievement.create([
        {
            studentId: studentA._id,
            courseId: courseB._id,
            type: "course-completion",
            title: `${courseB.title} Certificate`,
            description: `Awarded for completing ${courseB.title}.`,
            awardedAt: daysAgo(2),
        },
        {
            studentId: studentA._id,
            courseId: courseB._id,
            type: "quiz-mastery",
            title: "HTML Basics Quiz Mastery",
            description: "Awarded for scoring at least 90% on HTML Basics Quiz.",
            awardedAt: daysAgo(3),
        },
        {
            studentId: studentA._id,
            type: "streak",
            title: "7-Day Learning Streak",
            description: "Awarded for staying active for 7 consecutive days.",
            awardedAt: daysAgo(0),
        },
        {
            studentId: studentC._id,
            courseId: courseD._id,
            type: "course-completion",
            title: `${courseD.title} Certificate`,
            description: `Awarded for completing ${courseD.title}.`,
            awardedAt: daysAgo(1),
        },
    ]);

    await Note.create([
        {
            studentId: studentA._id,
            courseId: courseB._id,
            moduleId: modulesByCourse[courseB._id][0]._id,
            lectureId: lectures[4]._id,
            content: "Remember that HTML defines the structure, not the visual styling.",
            updatedAt: daysAgo(2),
        },
        {
            studentId: studentA._id,
            courseId: courseA._id,
            moduleId: modulesByCourse[courseA._id][0]._id,
            lectureId: lectures[1]._id,
            content: "Scam warning signs: urgency, money pressure, strange links.",
            updatedAt: daysAgo(0),
        },
        {
            studentId: studentB._id,
            courseId: courseC._id,
            moduleId: modulesByCourse[courseC._id][0]._id,
            lectureId: lectures[8]._id,
            content: "Need to compare repeated observations before drawing conclusions.",
            updatedAt: daysAgo(1),
        },
    ]);

    console.log("Seed complete.");
    console.log("");
    console.log("Sample Accounts");
    console.log("Admin   :", admin.email, "| password123");
    console.log("Teacher :", teacherA.email, "| password123");
    console.log("Teacher :", teacherB.email, "| password123");
    console.log("Teacher :", teacherC.email, "| password123");
    console.log("Student :", studentA.email, "| password123");
    console.log("Student :", studentB.email, "| password123");
    console.log("Student :", studentC.email, "| password123");
    console.log("");
    console.log("Testing Highlights");
    console.log("- student1 has low-bandwidth mode, active notes, recommendations, streaks, achievements, and a completed course.");
    console.log("- student2 has partial progress, a failed quiz attempt, and note data.");
    console.log("- student3 has a completed communication course and a certificate-ready profile.");
    console.log("- teacher1 owns two courses with quizzes and active enrollments.");
    console.log("- teacher2 and teacher3 each own a different course for dashboard testing.");
    console.log("- admin can test user role updates and platform analytics.");
    console.log("");
    console.log("Created:");
    console.log(`Users: 7`);
    console.log(`Courses: 4`);
    console.log(`Modules: ${modules.length}`);
    console.log(`Lectures: ${lectures.length}`);
    console.log(`Quizzes: ${quizzes.length}`);
    console.log(`Enrollments: ${enrollments.length}`);

    process.exit(0);
};

seed().catch((error) => {
    console.error("Seed failed:", error.message);
    process.exit(1);
});
