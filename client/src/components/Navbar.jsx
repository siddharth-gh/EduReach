import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../app/useAuth";
import { useTranslation } from "react-i18next";

const Navbar = ({ theme, onToggleTheme }) => {
  const { user, isAuthenticated, logout, getHomeRouteForRole } = useAuth();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem("language", nextLanguage);
  };

  return (
    <header className="topbar">
      <Link to="/" className="brand-mark">
        EduReach
      </Link>
      <nav className="nav-links">
        <button
          type="button"
          className="nav-button nav-theme-toggle"
          onClick={onToggleTheme}
        >
          {theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}
        </button>
        <select
          className="nav-button nav-language-toggle"
          value={i18n.language.startsWith("hi") ? "hi" : "en"}
          onChange={handleLanguageChange}
          aria-label={t("nav.language")}
        >
          <option value="en">{t("nav.english")}</option>
          <option value="hi">{t("nav.hindi")}</option>
        </select>
        <NavLink to="/courses">{t("nav.courses")}</NavLink>
        <NavLink to="/offline">{t("nav.offline")}</NavLink>
        {isAuthenticated ? (
          <>
            <NavLink to={getHomeRouteForRole(user?.role)}>{t("nav.dashboard")}</NavLink>
            <NavLink to="/profile">{t("nav.profile")}</NavLink>
            <button type="button" className="nav-button" onClick={logout}>
              {t("nav.logout")}
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">{t("nav.login")}</NavLink>
            <NavLink to="/signup">{t("nav.signup")}</NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
