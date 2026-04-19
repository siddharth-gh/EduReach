import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import API from "../api/api";
import AppShell from "../layouts/AppShell";
import { isCourseDownloaded } from "../utils/offlinePack";

const Home = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await API.get("/courses");
        setCourses(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || t("home.loadCoursesError"));
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [t]);

  const categories = useMemo(() => {
    const grouped = courses.reduce((acc, course) => {
      const category = course.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(course);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([category, items]) => ({
        category,
        courses: items.slice(0, 3),
      }))
      .sort((a, b) => b.courses.length - a.courses.length);
  }, [courses]);

  const categoryKeys = ["Career", "Programming", "Science", "Mathematics", "General"];

  return (
    <AppShell>
      <section className="home-hero">
        <div className="home-hero-grid">
          <div>
            <span className="eyebrow">EduReach</span>
            <h1>{t("home.title")}</h1>
            <p className="hero-copy">
              {t("home.subtitle")}
            </p>
            <div className="home-hero-actions">
              <Link to="/courses" className="btn btn-inline">
                {t("home.exploreCourses")}
              </Link>
              <Link to="/signup" className="btn btn-secondary btn-inline">
                {t("home.createAccount")}
              </Link>
            </div>
            <div className="home-hero-stats">
              <div>
                <span className="meta-text">{t("home.adaptiveMedia")}</span>
                <p>{t("home.adaptiveMediaValue")}</p>
              </div>
              <div>
                <span className="meta-text">{t("home.aiSupport")}</span>
                <p>{t("home.aiSupportValue")}</p>
              </div>
              <div>
                <span className="meta-text">{t("home.realTime")}</span>
                <p>{t("home.realTimeValue")}</p>
              </div>
            </div>
          </div>
          <div className="home-hero-visual">
            <div className="hero-glass-card">
              <span className="card-badge">{t("home.lowBandwidthMode")}</span>
              <h3>{t("home.keepLearningOffline")}</h3>
              <p className="meta-text">
                {t("home.offlineDescription")}
              </p>
              <div className="hero-glass-metrics">
                <span className="meta-pill">70% data savings</span>
                <span className="meta-pill">Transcript-ready</span>
                <span className="meta-pill">Mobile-first</span>
              </div>
            </div>
            <div className="hero-glass-card hero-glass-card-secondary">
              <span className="card-badge">{t("home.teacherTools")}</span>
              <h3>{t("home.buildOnce")}</h3>
              <p className="meta-text">
                {t("home.buildOnceDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("home.categories")}</span>
            <h2>{t("home.exploreByGoals")}</h2>
          </div>
          <p className="page-subtitle">{t("home.categoriesSubtitle")}</p>
        </div>
        <div className="category-grid">
          {categoryKeys.map(
            (category) => (
              <div key={category} className="category-card">
                <h3>{t(`categories.${category}.label`)}</h3>
                <p className="meta-text">
                  {t(`categories.${category}.description`)}
                </p>
                <Link to="/courses" className="btn btn-secondary btn-inline">
                  {t("home.viewCategory", { category: t(`categories.${category}.label`) })}
                </Link>
              </div>
            )
          )}
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("home.courses")}</span>
            <h2>{t("home.trendingPaths")}</h2>
          </div>
          <p className="page-subtitle">{t("home.coursesSubtitle")}</p>
        </div>
        {loading ? <p className="status-text">{t("home.loadingCourses")}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {!loading && !error && categories.length === 0 ? (
          <p className="meta-text">{t("home.noCourses")}</p>
        ) : null}
        <div className="category-course-stack">
          {categories.map((group) => (
            <div key={group.category} className="category-course-block">
              <div className="builder-header">
                <h3>{group.category}</h3>
                <Link to="/courses" className="meta-text">
                  {t("home.viewAll")}
                </Link>
              </div>
              <div className="course-preview-grid">
                {group.courses.map((course) => (
                  <div key={course._id} className="course-preview-card">
                    <div className="course-meta-row">
                      <span className="meta-pill">{course.level || t("home.beginner")}</span>
                      {isCourseDownloaded(course._id) ? (
                        <span className="meta-pill">{t("home.downloaded")}</span>
                      ) : null}
                    </div>
                    <h4>{course.title}</h4>
                    <p className="meta-text">{course.description}</p>
                    <div className="course-preview-meta">
                      <span className="meta-text">
                        {t("home.instructor")}: {course.teacherId?.name || t("home.staff")}
                      </span>
                      <Link
                        to={`/course/${course._id}`}
                        className="btn btn-inline"
                      >
                        {t("home.openCourse")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section partner-strip">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("home.partners")}</span>
            <h2>{t("home.partnersTitle")}</h2>
          </div>
          <p className="page-subtitle">{t("home.partnersSubtitle")}</p>
        </div>
        <div className="partner-grid">
          {[
            "Rural Skills College",
            "Shakti Polytechnic",
            "Eastern Community University",
            "Greenfield Teacher Institute",
            "Digital Bharat Mission",
          ].map((partner) => (
            <div key={partner} className="partner-card">
              <p>{partner}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <h3>EduReach</h3>
          <p className="meta-text">{t("home.footerText")}</p>
        </div>
        <div className="footer-links">
          <Link to="/courses">{t("home.browseCourses")}</Link>
          <Link to="/signup">{t("home.createAccount")}</Link>
          <Link to="/login">{t("home.teacherLogin")}</Link>
        </div>
        <div>
          <span className="meta-text">{t("home.contact")}</span>
          <p>hello@edureach.edu</p>
          <p className="meta-text">{t("home.footerTagline")}</p>
        </div>
      </footer>
    </AppShell>
  );
};

export default Home;
