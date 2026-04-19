import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";
import {
  downloadCoursePack,
  getOfflineCoursePack,
  isCourseDownloaded,
} from "../utils/offlinePack";

const CourseDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState({});
  const [quizzes, setQuizzes] = useState({});
  const [openModule, setOpenModule] = useState(null);
  const [error, setError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("");
  const [offlineAvailable, setOfflineAvailable] = useState(false);
  const [isStartingLive, setIsStartingLive] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await API.get(`/courses/${courseId}`);
        setCourse(response.data);
        setOfflineAvailable(isCourseDownloaded(courseId));
      } catch (err) {
        const offlinePack = await getOfflineCoursePack(courseId);
        if (offlinePack?.course) {
          setCourse(offlinePack.course);
          setModules(offlinePack.modules || []);
          setLectures(offlinePack.lecturesByModule || {});
        setOfflineAvailable(true);
        return;
      }
        setError(err.response?.data?.message || t("courseDetail.loadCourseError"));
      }
    };

    fetchCourse();
  }, [courseId, t]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await API.get(`/modules/${courseId}`);
        setModules(response.data);
      } catch (err) {
        const offlinePack = await getOfflineCoursePack(courseId);
        if (offlinePack?.modules) {
          setModules(offlinePack.modules);
          setLectures(offlinePack.lecturesByModule || {});
        setOfflineAvailable(true);
        return;
      }
        setError(err.response?.data?.message || t("courseDetail.loadModulesError"));
      }
    };

    fetchModules();
  }, [courseId, t]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") {
      return;
    }

    const fetchEnrollments = async () => {
      try {
        const response = await API.get("/enrollments/my-courses");
        const enrolled = response.data.some(
          (enrollment) => enrollment.courseId?._id === courseId
        );
        setIsEnrolled(enrolled);
      } catch {
        setIsEnrolled(false);
      }
    };

    fetchEnrollments();
  }, [courseId, isAuthenticated, user?.role]);

  const toggleModule = async (moduleId) => {
    if (openModule === moduleId) {
      setOpenModule(null);
      return;
    }

    setOpenModule(moduleId);

    if (!lectures[moduleId]) {
      try {
        const [lectureResponse, quizResponse] = await Promise.all([
          API.get(`/lectures/${moduleId}`),
          API.get(`/quizzes/module/${moduleId}`),
        ]);
        setLectures((current) => ({
          ...current,
          [moduleId]: lectureResponse.data,
        }));
        setQuizzes((current) => ({
          ...current,
          [moduleId]: quizResponse.data,
        }));
      } catch (err) {
        setError(
          err.response?.data?.message || t("courseDetail.loadItemsError")
        );
      }
    }
  };

  const handleEnroll = async () => {
    setEnrollmentMessage("");
    setIsEnrolling(true);

    try {
      await API.post("/enrollments", { courseId });
      setIsEnrolled(true);
      setEnrollmentMessage(t("courseDetail.enrollSuccess"));
    } catch (err) {
      setEnrollmentMessage(
        err.response?.data?.message || t("courseDetail.enrollError")
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDownload = async () => {
    setDownloadMessage("");
    setIsDownloading(true);

    try {
      const result = await downloadCoursePack(courseId);
      setDownloadMessage(
        t("courseDetail.offlineReady", {
          cachedCount: result.cachedCount,
          assetCount: result.assetCount,
        })
      );
      setOfflineAvailable(true);
    } catch (err) {
      setDownloadMessage(
        err.message || t("courseDetail.downloadError")
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGoLive = async () => {
    setIsStartingLive(true);
    setEnrollmentMessage("");

    try {
      await API.post(`/courses/${courseId}/live/start`);
      navigate(`/course/${courseId}/live`);
    } catch (err) {
      setEnrollmentMessage(
        err.response?.data?.message || t("courseDetail.liveStartError")
      );
    } finally {
      setIsStartingLive(false);
    }
  };

  if (error) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="form-error">{error}</p>
        </section>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="status-text">{t("courseDetail.loading")}</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="page-section page-narrow">
        <button
          type="button"
          className="btn btn-secondary btn-inline"
          onClick={() => navigate(-1)}
        >
          {t("common.back")}
        </button>
        <div className="hero-card hero-card-compact">
          <span className="eyebrow">{t("courseDetail.overview")}</span>
          <h1>{course.title}</h1>
          <p className="hero-copy">{course.description}</p>
          <p className="meta-text">
            {t("home.instructor")}: {course.teacherId?.name || t("courseDetail.unknownInstructor")}
          </p>
          <div className="course-meta-row">
            <span className="meta-pill">{course.category || t("categories.General.label")}</span>
            <span className="meta-pill">{course.level || t("home.beginner")}</span>
            {course.liveSession?.isActive ? (
              <span className="meta-pill">{t("courseDetail.liveNow")}</span>
            ) : null}
            {offlineAvailable ? (
              <span className="meta-pill">{t("courseDetail.offlineBadge")}</span>
            ) : null}
          </div>
          {isAuthenticated &&
          user?.role === "teacher" &&
          course.teacherId?._id === user?._id ? (
            <div className="action-row">
              <button
                type="button"
                className="btn btn-inline"
                onClick={handleGoLive}
                disabled={isStartingLive}
              >
                {isStartingLive ? t("courseDetail.startingLive") : t("courseDetail.goLive")}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-inline"
                onClick={() => navigate(`/course/${courseId}/live`)}
              >
                {t("courseDetail.openLiveRoom")}
              </button>
            </div>
          ) : null}
          {isAuthenticated ? (
            <div className="action-row">
              {user?.role === "student" ? (
                <>
                  <button
                    type="button"
                    className="btn btn-inline"
                    onClick={handleEnroll}
                    disabled={isEnrolling || isEnrolled}
                  >
                    {isEnrolled
                      ? t("courseDetail.enrolled")
                      : isEnrolling
                        ? t("courseDetail.enrolling")
                        : t("courseDetail.enrollNow")}
                  </button>
                  {enrollmentMessage ? (
                    <p className="meta-text">{enrollmentMessage}</p>
                  ) : null}
                </>
              ) : null}
              <button
                type="button"
                className="btn btn-secondary btn-inline"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? t("courseDetail.downloading") : t("courseDetail.downloadOffline")}
              </button>
              {downloadMessage ? (
                <p className="meta-text">{downloadMessage}</p>
              ) : null}
              {course.liveSession?.isActive ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-inline"
                  onClick={() => navigate(`/course/${courseId}/live`)}
                >
                  {t("courseDetail.joinLive")}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="stack-list">
          {modules.map((module) => (
            <div key={module._id} className="content-card">
              <button
                type="button"
                className="module-toggle"
                onClick={() => toggleModule(module._id)}
              >
                <span>{module.title}</span>
                <span>{openModule === module._id ? t("common.hide") : t("common.view")}</span>
              </button>
              {openModule === module._id ? (
                <div className="module-lectures">
                  {!lectures[module._id] ? (
                    <p className="status-text">{t("courseDetail.loadingItems")}</p>
                  ) : (
                    <>
                      {lectures[module._id].length === 0 ? (
                        <p className="meta-text">{t("courseDetail.noLectures")}</p>
                      ) : (
                        lectures[module._id].map((lecture) => (
                          <button
                            key={lecture._id}
                            type="button"
                            className="lecture-link"
                            onClick={() =>
                              navigate(`/lecture/${lecture._id}`, {
                                state: { lectures: lectures[module._id] },
                              })
                            }
                          >
                            {lecture.title}
                          </button>
                        ))
                      )}
                      {(quizzes[module._id] || []).map((quiz) => (
                        <button
                          key={quiz._id}
                          type="button"
                          className="lecture-link quiz-link"
                          onClick={() => navigate(`/quiz/${quiz._id}`)}
                        >
                          {t("courseDetail.quizPrefix")}: {quiz.title}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
};

export default CourseDetail;
