import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import AppShell from "../layouts/AppShell";
import {
  clearOfflineCourse,
  getOfflineCoursePack,
  getOfflineIndex,
} from "../utils/offlinePack";

const OfflineLibrary = () => {
  const { t } = useTranslation();
  const [offlineCourses, setOfflineCourses] = useState([]);
  const [error, setError] = useState("");

  const loadOffline = async () => {
    setError("");
    const index = getOfflineIndex();

    const packs = await Promise.all(
      index.map(async (entry) => ({
        entry,
        pack: await getOfflineCoursePack(entry.courseId),
      }))
    );

    setOfflineCourses(
      packs
        .filter((item) => item.pack?.course)
        .map((item) => ({
          courseId: item.entry.courseId,
          title: item.pack.course.title,
          description: item.pack.course.description,
          downloadedAt: item.entry.downloadedAt,
          modules: item.pack.modules?.length || 0,
        }))
    );
  };

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        await loadOffline();
      } catch {
        if (isMounted) {
          setError(t("offlineLibrary.loadError"));
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const handleRemove = async (courseId) => {
    await clearOfflineCourse(courseId);
    await loadOffline();
  };

  return (
    <AppShell>
      <section className="page-section page-narrow">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("offlineLibrary.title")}</span>
            <h2>{t("offlineLibrary.downloadedCourses")}</h2>
          </div>
          <p className="page-subtitle">
            {t("offlineLibrary.subtitle")}
          </p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        {offlineCourses.length === 0 ? (
          <p className="meta-text">{t("offlineLibrary.empty")}</p>
        ) : (
          <div className="stack-list">
            {offlineCourses.map((course) => (
              <article key={course.courseId} className="dashboard-card">
                <span className="card-badge">{t("offlineLibrary.badge")}</span>
                <h3>{course.title}</h3>
                <p className="meta-text">{course.description}</p>
                <p className="meta-text">
                  {t("offlineLibrary.modules")}: {course.modules} | {t("offlineLibrary.downloadedAt")}{" "}
                  {new Date(course.downloadedAt).toLocaleString()}
                </p>
                <div className="action-row">
                  <Link
                    to={`/course/${course.courseId}`}
                    className="btn btn-inline"
                  >
                    {t("home.openCourse")}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary btn-inline"
                    onClick={() => handleRemove(course.courseId)}
                  >
                    {t("offlineLibrary.remove")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
};

export default OfflineLibrary;
