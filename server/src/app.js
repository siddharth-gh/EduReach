import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import moduleRoutes from "./routes/module.routes.js";
import lectureRoutes from "./routes/lecture.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import quizAttemptRoutes from "./routes/quizAttempt.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import userRoutes from "./routes/user.routes.js";
import achievementRoutes from "./routes/achievement.routes.js";
import noteRoutes from "./routes/note.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quiz-attempts", quizAttemptRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
