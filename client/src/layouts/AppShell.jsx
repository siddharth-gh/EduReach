import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import MobileSidebar from "../components/MobileSidebar";

const AppShell = ({ children }) => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors duration-200">
      {isOffline ? (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-medium">
          {t("app.offlineBanner")}
        </div>
      ) : null}
      {!isStandalone ? (
        <div className="bg-blue-600 dark:bg-blue-900/50 text-white text-center py-3 px-4 text-sm flex flex-wrap items-center justify-center gap-3">
          <span>
            {t("app.installBanner")}
            {isIOS && !installEvent ? (
              <span className="opacity-80 ml-2">
                {t("app.iosInstallHint")}
              </span>
            ) : null}
            {!isIOS && !installEvent ? (
              <span className="opacity-80 ml-2">
                {t("app.desktopInstallHint")}
              </span>
            ) : null}
          </span>
          {installEvent ? (
            <button
              type="button"
              className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-100 transition-all"
              onClick={handleInstall}
            >
              {t("app.installApp")}
            </button>
          ) : null}
        </div>
      ) : null}
      <Navbar 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      <main className="shell-content">{children}</main>
      <MobileSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </div>
  );
};

export default AppShell;
