import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const handleRecommendationClick = (item) => {
    if (item.type === "lecture") {
      navigate(`/lecture/${item.targetId}`);
      return;
    }

    if (item.type === "revision") {
      navigate(`/quiz/${item.targetId}`);
      return;
    }

    navigate(`/course/${item.targetId}`);
  };

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [
          overviewResponse,
          recommendationResponse,
          attemptsResponse,
          achievementsResponse,
          notesResponse,
        ] = await Promise.all([
          API.get("/progress/me/overview"),
          API.get("/recommendations/me"),
          API.get("/quiz-attempts/my-results"),
          API.get("/achievements/me"),
          API.get("/notes/me"),
        ]);
        setOverview(overviewResponse.data);
        setRecommendations(recommendationResponse.data);
        setAttempts(attemptsResponse.data);
        setAchievements(achievementsResponse.data);
        setNotes(notesResponse.data);
      } catch (err) {
        setError(
          err.response?.data?.message || t("dashboard.loadError")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [t]);

  return (
    <AppShell>
      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("dashboard.title")}</span>
            <h2>{t("dashboard.welcome", { name: user?.name })}</h2>
          </div>
          <p className="page-subtitle">
            {t("dashboard.subtitle")}
          </p>
        </div>
        {loading ? <p className="status-text">{t("dashboard.loading")}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        <div className="dashboard-grid">
          <article className="dashboard-card">
            <h3>{t("dashboard.progressTitle")}</h3>
            <p>
              {t("dashboard.enrolledCourses")}: {overview?.stats?.enrolledCourses ?? 0}
              <br />
              {t("dashboard.completedLectures")}: {overview?.stats?.completedLectures ?? 0}
              <br />
              {t("dashboard.completedCourses")}: {overview?.stats?.completedCourses ?? 0}
              <br />
              {t("dashboard.activeStreak")}: {overview?.stats?.streakCount ?? user?.streakCount ?? 0} {t("dashboard.day")}
              {(overview?.stats?.streakCount ?? user?.streakCount ?? 0) === 1 ? "" : "s"}
            </p>
          </article>
          <article className="dashboard-card">
            <h3>{t("dashboard.momentumTitle")}</h3>
            <p>
              {overview?.enrollments?.[0]
                ? `${overview.enrollments[0].courseId?.title}: ${overview.enrollments[0].progressPercent}% complete`
                : t("dashboard.noMomentum")}
            </p>
            {overview?.stats?.lastActiveAt ? (
              <p className="meta-text">
                {t("dashboard.lastActive")} {new Date(overview.stats.lastActiveAt).toLocaleDateString()}
              </p>
            ) : null}
          </article>
          <article className="dashboard-card">
            <h3>{t("dashboard.pathTitle")}</h3>
            <p>
              {recommendations[0]
                ? `${recommendations[0].title}: ${recommendations[0].reason}`
                : t("dashboard.noRecommendations")}
            </p>
          </article>
        </div>
        {recommendations.length ? (
          <div className="stack-list dashboard-list">
            {recommendations.map((item) => (
              <article
                key={`${item.type}-${item.targetId}`}
                className="dashboard-card clickable-card"
                onClick={() => handleRecommendationClick(item)}
              >
                <span className="card-badge">{item.type}</span>
                <h3>{item.title}</h3>
                <p>{item.courseTitle}</p>
                <p className="meta-text">{item.reason}</p>
              </article>
            ))}
          </div>
        ) : null}
        {attempts.length ? (
          <div className="stack-list dashboard-list">
            {attempts.slice(0, 5).map((attempt) => (
              <article key={attempt._id} className="dashboard-card">
                <span className="card-badge">
                  {attempt.passed ? t("dashboard.passed") : t("dashboard.needsWork")}
                </span>
                <h3>{attempt.quizId?.title}</h3>
                <p className="meta-text">{t("dashboard.score")}: {attempt.score}%</p>
              </article>
            ))}
          </div>
        ) : null}
        {achievements.length ? (
          <div className="stack-list dashboard-list">
            {achievements.map((achievement) => (
              <article
                key={achievement._id}
                className="dashboard-card clickable-card"
                onClick={() => {
                  if (achievement.type === "course-completion" && achievement.courseId?._id) {
                    navigate(`/certificate/${achievement.courseId._id}`);
                  }
                }}
              >
                <span className="card-badge">{achievement.type}</span>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                <p className="meta-text">
                  {t("dashboard.awardedOn")} {new Date(achievement.awardedAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        ) : null}
        {overview?.enrollments?.length ? (
          <div className="stack-list dashboard-list">
            {overview.enrollments.map((enrollment) => (
              <article key={enrollment._id} className="dashboard-card">
                <span className="card-badge">
                  {enrollment.progressPercent}% complete
                </span>
                <h3>{enrollment.courseId?.title}</h3>
                <p>{enrollment.courseId?.description}</p>
              </article>
            ))}
          </div>
        ) : null}
        {notes.length ? (
          <div className="stack-list dashboard-list">
            {notes.slice(0, 5).map((item) => (
              <article
                key={item._id}
                className="dashboard-card clickable-card"
                onClick={() => navigate(`/lecture/${item.lectureId?._id}`)}
              >
                <span className="card-badge">{t("dashboard.note")}</span>
                <h3>{item.lectureId?.title}</h3>
                <p>{item.courseId?.title}</p>
                <p className="meta-text">{item.content}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </AppShell>
  );
};

export default Dashboard;
