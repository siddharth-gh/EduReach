import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const Profile = () => {
  const { t } = useTranslation();
  const { user, setCurrentUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [preferredMode, setPreferredMode] = useState(
    user?.preferredMode || "normal"
  );
  const [achievements, setAchievements] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const hydrateProfile = async () => {
      try {
        const response = await API.get("/auth/me");
        setCurrentUser(response.data);
        setName(response.data.name || "");
        setBio(response.data.bio || "");
        setPreferredMode(response.data.preferredMode || "normal");
      } catch {
        return;
      }
    };

    const fetchAchievements = async () => {
      try {
        const response = await API.get("/achievements/me");
        setAchievements(response.data);
      } catch {
        setAchievements([]);
      }
    };

    hydrateProfile();

    if (user?.role === "student") {
      fetchAchievements();
    }
  }, [setCurrentUser, user?.role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatusMessage("");

    try {
      const response = await API.put("/auth/profile", {
        name,
        bio,
        preferredMode,
      });
      setCurrentUser(response.data);
      setStatusMessage(t("profile.updateSuccess"));
    } catch (err) {
      setError(err.response?.data?.message || t("profile.updateError"));
    }
  };

  return (
    <AppShell>
      <section className="page-section page-narrow">
        <div className="dashboard-card">
          <span className="eyebrow">{t("profile.title")}</span>
          <h2>{user?.email}</h2>
          <p className="meta-text">{t("profile.role")}: {user?.role}</p>
          {user?.role === "student" ? (
            <p className="meta-text">
              {t("profile.currentStreak")}: {user?.streakCount ?? 0} {t("dashboard.day")}{(user?.streakCount ?? 0) === 1 ? "" : "s"}
            </p>
          ) : null}
          {error ? <p className="form-error">{error}</p> : null}
          {statusMessage ? <p className="status-text">{statusMessage}</p> : null}
          <form className="form-stack profile-form" onSubmit={handleSubmit}>
            <input
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("profile.yourName")}
            />
            <textarea
              className="input input-textarea"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder={t("profile.shortBio")}
            />
            <select
              className="input"
              value={preferredMode}
              onChange={(event) => setPreferredMode(event.target.value)}
            >
              <option value="normal">{t("profile.normalMode")}</option>
              <option value="low-bandwidth">{t("profile.lowBandwidthMode")}</option>
            </select>
            <button type="submit" className="btn btn-inline">
              {t("profile.save")}
            </button>
          </form>
          {user?.role === "student" && achievements.length ? (
            <div className="builder-subsection">
              <h3>{t("profile.achievements")}</h3>
              <div className="stack-list">
                {achievements.map((achievement) => (
                  <div key={achievement._id} className="builder-item">
                    <div>
                      <strong>{achievement.title}</strong>
                      <p className="meta-text">{achievement.description}</p>
                    </div>
                    <span className="card-badge">{achievement.type}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
};

export default Profile;
