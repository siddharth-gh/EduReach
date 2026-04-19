import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";

const AppShell = ({ children }) => {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [installEvent, setInstallEvent] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent || "") && !window.MSStream;
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const handleDisplayModeChange = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsStandalone(standalone);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.matchMedia("(display-mode: standalone)").addEventListener(
      "change",
      handleDisplayModeChange
    );
    handleDisplayModeChange();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.matchMedia("(display-mode: standalone)").removeEventListener(
        "change",
        handleDisplayModeChange
      );
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  };

  return (
    <div className="app-shell">
      {isOffline ? (
        <div className="app-status-banner">
          {t("app.offlineBanner")}
        </div>
      ) : null}
      {!isStandalone ? (
        <div className="app-status-banner app-status-banner-secondary">
          {t("app.installBanner")}
          {isIOS && !installEvent ? (
            <span className="install-hint">
              {t("app.iosInstallHint")}
            </span>
          ) : null}
          {!isIOS && !installEvent ? (
            <span className="install-hint">
              {t("app.desktopInstallHint")}
            </span>
          ) : null}
          {installEvent ? (
            <button
              type="button"
              className="btn btn-inline install-btn"
              onClick={handleInstall}
            >
              {t("app.installApp")}
            </button>
          ) : null}
        </div>
      ) : null}
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main className="shell-content">{children}</main>
    </div>
  );
};

export default AppShell;
