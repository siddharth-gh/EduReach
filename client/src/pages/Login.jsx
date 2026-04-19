import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated, getHomeRouteForRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const user = await login({ email, password });
      navigate(getHomeRouteForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || t("auth.loginFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="auth-card">
        <h2>{t("auth.loginTitle")}</h2>
        <p className="page-subtitle">{t("auth.loginSubtitle")}</p>
        <form className="form-stack" onSubmit={handleSubmit}>
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
          {error ? <p className="form-error">{error}</p> : null}
          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("auth.signingIn") : t("auth.login")}
          </button>
        </form>
      </div>
    </AppShell>
  );
};

export default Login;
