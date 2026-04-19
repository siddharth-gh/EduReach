import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const maxRoleValue = Math.max(
    ...(analytics?.roleDistribution?.map((item) => item.value) ?? [0]),
    1
  );
  const maxEnrollmentValue = Math.max(
    ...(analytics?.enrollmentBreakdown?.map((item) => item.value) ?? [0]),
    1
  );

  const fetchAdminData = async () => {
    const [analyticsResponse, usersResponse] = await Promise.all([
      API.get("/analytics/admin/overview"),
      API.get("/users"),
    ]);

    return {
      analytics: analyticsResponse.data,
      users: usersResponse.data,
    };
  };

  useEffect(() => {
    let isActive = true;

    const loadAdminData = async () => {
      try {
        const data = await fetchAdminData();

        if (!isActive) {
          return;
        }

        setAnalytics(data.analytics);
        setUsers(data.users);
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.message || "Failed to load admin data");
        }
      }
    };

    loadAdminData();

    return () => {
      isActive = false;
    };
  }, []);

  const updateRole = async (userId, role) => {
    try {
      await API.put(`/users/${userId}/role`, { role });
      const data = await fetchAdminData();
      setAnalytics(data.analytics);
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
    }
  };

  return (
    <AppShell>
      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Admin Dashboard</span>
            <h2>Platform control panel for {user?.name}</h2>
          </div>
          <p className="page-subtitle">
            User management, analytics, and platform governance will live here.
          </p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="dashboard-grid">
          <article className="dashboard-card">
            <h3>User Management</h3>
            <p>Total users: {analytics?.stats?.totalUsers ?? 0}</p>
          </article>
          <article className="dashboard-card">
            <h3>Platform Analytics</h3>
            <p>Total courses: {analytics?.stats?.totalCourses ?? 0}</p>
          </article>
          <article className="dashboard-card">
            <h3>Student Base</h3>
            <p>Total students: {analytics?.stats?.totalStudents ?? 0}</p>
          </article>
          <article className="dashboard-card">
            <h3>Completion Signals</h3>
            <p>
              Completed enrollments: {analytics?.stats?.completedEnrollments ?? 0}
            </p>
          </article>
        </div>
        <div className="dashboard-grid dashboard-grid-double">
          <article className="dashboard-card analytics-card">
            <div className="builder-header">
              <div>
                <span className="card-badge">Role Distribution</span>
                <h3>Who is using the platform</h3>
              </div>
              <p className="meta-text">
                {analytics?.stats?.completionRate ?? 0}% completion rate
              </p>
            </div>
            <div className="analytics-list">
              {(analytics?.roleDistribution ?? []).map((item) => (
                <div key={item.label} className="analytics-row">
                  <strong>{item.label}</strong>
                  <div className="analytics-bar-block">
                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill analytics-bar-fill-secondary"
                        style={{
                          width: `${Math.max(
                            12,
                            Math.round((item.value / maxRoleValue) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="meta-text">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article className="dashboard-card analytics-card">
            <div className="builder-header">
              <div>
                <span className="card-badge">Enrollment Health</span>
                <h3>Completion vs active learners</h3>
              </div>
              <p className="meta-text">
                {analytics?.stats?.totalEnrollments ?? 0} total enrollments
              </p>
            </div>
            <div className="analytics-list">
              {(analytics?.enrollmentBreakdown ?? []).map((item) => (
                <div key={item.label} className="analytics-row">
                  <strong>{item.label}</strong>
                  <div className="analytics-bar-block">
                    <div className="analytics-bar-track">
                      <div
                        className="analytics-bar-fill"
                        style={{
                          width: `${Math.max(
                            12,
                            Math.round((item.value / maxEnrollmentValue) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="meta-text">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
        <div className="stack-list dashboard-list">
          {users.map((platformUser) => (
            <article key={platformUser._id} className="dashboard-card">
              <div className="builder-header">
                <div>
                  <h3>{platformUser.name}</h3>
                  <p className="meta-text">{platformUser.email}</p>
                </div>
                <select
                  className="input role-select"
                  value={platformUser.role}
                  onChange={(event) =>
                    updateRole(platformUser._id, event.target.value)
                  }
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
};

export default AdminDashboard;
