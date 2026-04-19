import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const emptyCourseForm = {
  title: "",
  description: "",
  category: "General",
  level: "beginner",
};

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const maxCourseEnrollments = Math.max(
    ...(analytics?.coursePerformance?.map((course) => course.enrollments) ?? [0]),
    1
  );

  const fetchCourses = async () => {
    setLoading(true);

    try {
      const response = await API.get("/courses/teacher/my-courses");
      setCourses(response.data);
      const analyticsResponse = await API.get("/analytics/teacher/overview");
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teacher courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatusMessage("");

    try {
      if (editingCourseId) {
        await API.put(`/courses/${editingCourseId}`, courseForm);
        setStatusMessage("Course updated successfully.");
      } else {
        await API.post("/courses", courseForm);
        setStatusMessage("Course created successfully.");
      }

      setCourseForm(emptyCourseForm);
      setEditingCourseId(null);
      await fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save course");
    }
  };

  const startEdit = (course) => {
    setEditingCourseId(course._id);
      setCourseForm({
        title: course.title,
        description: course.description,
        category: course.category || "General",
        level: course.level || "beginner",
      });
  };

  const handleDelete = async (courseId) => {
    setError("");
    setStatusMessage("");

    try {
      await API.delete(`/courses/${courseId}`);
      setStatusMessage("Course deleted successfully.");
      await fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  return (
    <AppShell>
      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Teacher Dashboard</span>
            <h2>Teaching workspace for {user?.name}</h2>
          </div>
          <p className="page-subtitle">
            Create courses, organize modules, and shape the content your
            students will follow.
          </p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        {statusMessage ? <p className="status-text">{statusMessage}</p> : null}
        <div className="dashboard-grid">
          <article className="dashboard-card">
            <h3>Total Courses</h3>
            <p>{analytics?.stats?.totalCourses ?? 0}</p>
          </article>
          <article className="dashboard-card">
            <h3>Total Enrollments</h3>
            <p>{analytics?.stats?.totalEnrollments ?? 0}</p>
          </article>
          <article className="dashboard-card">
            <h3>Average Quiz Score</h3>
            <p>{analytics?.stats?.averageQuizScore ?? 0}%</p>
          </article>
          <article className="dashboard-card">
            <h3>Hardest Quiz</h3>
            <p>
              {analytics?.hardestQuiz
                ? `${analytics.hardestQuiz.title} (${analytics.hardestQuiz.averageScore}%)`
                : "No quiz attempts yet"}
            </p>
          </article>
        </div>

        {analytics?.coursePerformance?.length ? (
          <article className="dashboard-card analytics-card">
            <div className="builder-header">
              <div>
                <span className="card-badge">Course Performance</span>
                <h3>Enrollment and score distribution</h3>
              </div>
              <p className="meta-text">Top courses by learner activity</p>
            </div>
            <div className="analytics-list">
              {analytics.coursePerformance.map((course) => (
                <div key={course.courseId} className="analytics-row">
                  <div>
                    <strong>{course.title}</strong>
                    <p className="meta-text">
                      {course.modules} modules, {course.quizzes} quizzes
                    </p>
                  </div>
                  <div className="analytics-bar-block">
                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill"
                        style={{
                          width: `${Math.max(
                            12,
                            Math.round((course.enrollments / maxCourseEnrollments) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="analytics-inline-stats">
                      <span>{course.enrollments} enrolled</span>
                      <span>{course.averageScore}% avg score</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        <div className="builder-layout">
          <article className="dashboard-card">
            <h3>{editingCourseId ? "Edit Course" : "Create Course"}</h3>
            <form className="form-stack" onSubmit={handleSubmit}>
              <input
                className="input"
                placeholder="Course title"
                value={courseForm.title}
                onChange={(event) =>
                  setCourseForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
              <textarea
                className="input input-textarea"
                placeholder="Course description"
                value={courseForm.description}
                onChange={(event) =>
                  setCourseForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
              <select
                className="input"
                value={courseForm.category}
                onChange={(event) =>
                  setCourseForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              >
                <option value="General">General</option>
                <option value="Programming">Programming</option>
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Career">Career</option>
              </select>
              <select
                className="input"
                value={courseForm.level}
                onChange={(event) =>
                  setCourseForm((current) => ({
                    ...current,
                    level: event.target.value,
                  }))
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <div className="action-row">
                <button type="submit" className="btn btn-inline">
                  {editingCourseId ? "Update Course" : "Create Course"}
                </button>
                {editingCourseId ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-inline"
                    onClick={() => {
                      setEditingCourseId(null);
                      setCourseForm(emptyCourseForm);
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <div className="stack-list">
            {loading ? <p className="status-text">Loading courses...</p> : null}
            {courses.map((course) => (
              <article key={course._id} className="dashboard-card">
                <span className="card-badge">Course</span>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta-row">
                  <span className="meta-pill">{course.category || "General"}</span>
                  <span className="meta-pill">{course.level || "beginner"}</span>
                </div>
                <div className="action-row">
                  <Link
                    to={`/teacher/courses/${course._id}`}
                    className="btn btn-inline"
                  >
                    Manage Content
                  </Link>
                  <Link
                    to={`/course/${course._id}/live`}
                    className="btn btn-secondary btn-inline"
                  >
                    {course.liveSession?.isActive ? "Join Live" : "Go Live"}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary btn-inline"
                    onClick={() => startEdit(course)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-inline"
                    onClick={() => handleDelete(course._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {!loading && courses.length === 0 ? (
              <article className="dashboard-card">
                <h3>No courses yet</h3>
                <p>Create your first course to begin building content.</p>
              </article>
            ) : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default TeacherDashboard;
