import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, isAuthenticated, getHomeRouteForRole } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={getHomeRouteForRole()} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await signup({ name, email, password, role });
      navigate(getHomeRouteForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t("auth.signupFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="auth-card">
        <h2>{t("auth.signupTitle")}</h2>
        <p className="page-subtitle">{t("auth.signupSubtitle")}</p>
        <form className="form-stack" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder={t("auth.name")}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="input"
            type="email"
            placeholder={t("auth.email")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder={t("auth.password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <select
            className="input"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="student">{t("auth.student")}</option>
            <option value="teacher">{t("auth.teacher")}</option>
          </select>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("auth.creatingAccount") : t("auth.signup")}
          </button>
        </form>
      </div>
    </AppShell>
  );
};

export default Signup;
