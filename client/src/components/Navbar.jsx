import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../app/useAuth";
import { useTranslation } from "react-i18next";

const Navbar = ({ theme, onToggleTheme, onToggleSidebar }) => {
  const { user, isAuthenticated, logout, getHomeRouteForRole } = useAuth();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem("language", nextLanguage);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-blue-600">Edu</span>Reach
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/courses" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
              {t("nav.courses")}
            </NavLink>
            <NavLink to="/offline" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
              {t("nav.offline")}
            </NavLink>
            
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200 dark:border-gray-800">
              {/* Language Switcher */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button onClick={() => handleLanguageChange('en')} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${i18n.language.startsWith('en') ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}>EN</button>
                <button onClick={() => handleLanguageChange('hi')} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${i18n.language.startsWith('hi') ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}>हिंदी</button>
                <button onClick={() => handleLanguageChange('pa')} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${i18n.language.startsWith('pa') ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}>ਪੰਜਾਬੀ</button>
              </div>

              {/* Theme Toggle */}
              <button onClick={onToggleTheme} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-sm hover:ring-2 hover:ring-blue-500/20 transition-all">
                {theme === "dark" ? "☀️" : "🌙"}
              </button>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <NavLink to={getHomeRouteForRole(user?.role)} className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t("nav.dashboard")}
                  </NavLink>
                  <button onClick={logout} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-all">
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <NavLink to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    {t("nav.login")}
                  </NavLink>
                  <NavLink to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg shadow-blue-600/20 transition-all">
                    {t("nav.signup")}
                  </NavLink>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
             <button onClick={onToggleTheme} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-sm">
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <button 
                onClick={onToggleSidebar}
                className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 active:scale-90 transition-all"
              >
                <div className="w-5 h-0.5 bg-white rounded-full"></div>
                <div className="w-5 h-0.5 bg-white rounded-full"></div>
                <div className="w-5 h-0.5 bg-white rounded-full"></div>
              </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
