import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../app/useAuth";

const MobileNav = () => {
  const { t } = useTranslation();
  const { isAuthenticated, getHomeRouteForRole, user, logout } = useAuth();

  const navItems = [
    { label: t("nav.home"), path: "/", icon: "🏠" },
    { label: t("nav.courses"), path: "/courses", icon: "📚" },
    ...(isAuthenticated ? [{ label: t("nav.dashboard"), path: getHomeRouteForRole(user?.role), icon: "📊" }] : []),
    { label: t("nav.profile"), path: "/profile", icon: "👤" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-50 flex items-center justify-around py-3 px-4 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] transition-colors duration-200">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-blue-600 scale-110' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
        </NavLink>
      ))}
      {isAuthenticated && (
        <button
          onClick={() => { if(window.confirm('Logout?')) logout(); }}
          className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">{t("nav.logout")}</span>
        </button>
      )}
    </nav>
  );
};

export default MobileNav;
