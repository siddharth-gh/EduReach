import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import AppShell from "../layouts/AppShell";
import CourseCard from "../components/CourseCard";
import { isCourseDownloaded } from "../utils/offlinePack";

const Courses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await API.get("/courses", {
          params: {
            search: search || undefined,
            category: category !== "all" ? category : undefined,
            level: level !== "all" ? level : undefined,
          },
        });
        setCourses(response.data);
      } catch (err) {
        setError(err.response?.data?.message || t("courses.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [search, category, level, t]);

  return (
    <AppShell>
      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("courses.catalog")}</span>
            <h2>{t("courses.title")}</h2>
          </div>
          <p className="page-subtitle">
            {t("courses.subtitle")}
          </p>
        </div>
        <div className="filter-bar">
          <input
            className="input"
            placeholder={t("courses.search")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="input"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">{t("courses.allCategories")}</option>
            <option value="Programming">{t("categories.Programming.label")}</option>
            <option value="Science">{t("categories.Science.label")}</option>
            <option value="Mathematics">{t("categories.Mathematics.label")}</option>
            <option value="Career">{t("categories.Career.label")}</option>
            <option value="General">{t("categories.General.label")}</option>
          </select>
          <select
            className="input"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="all">{t("courses.allLevels")}</option>
            <option value="beginner">{t("courses.levelBeginner")}</option>
            <option value="intermediate">{t("courses.levelIntermediate")}</option>
            <option value="advanced">{t("courses.levelAdvanced")}</option>
          </select>
        </div>
        {loading ? <p className="status-text">{t("courses.loading")}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {!loading && !error ? (
          <div className="grid-list">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                title={course.title}
                description={course.description}
                teacherName={course.teacherId?.name}
                category={course.category}
                level={course.level}
                downloaded={isCourseDownloaded(course._id)}
                onClick={() => navigate(`/course/${course._id}`)}
              />
            ))}
          </div>
        ) : null}
      </section>
    </AppShell>
  );
};

export default Courses;
