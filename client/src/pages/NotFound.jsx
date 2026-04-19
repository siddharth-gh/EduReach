import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppShell from "../layouts/AppShell";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <AppShell>
      <section className="page-section page-narrow">
        <div className="auth-card">
          <span className="eyebrow">404</span>
          <h2>{t("notFound.title")}</h2>
          <p className="page-subtitle">
            {t("notFound.subtitle")}
          </p>
          <Link className="btn btn-inline" to="/">
            {t("notFound.goHome")}
          </Link>
        </div>
      </section>
    </AppShell>
  );
};

export default NotFound;
