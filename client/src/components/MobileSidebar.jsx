import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../app/useAuth";

const MobileSidebar = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, getHomeRouteForRole, user, logout } = useAuth();

  const handleLanguageChange = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
    localStorage.setItem("language", nextLanguage);
  };

  const navItems = [
    { label: t("nav.home"), path: "/", icon: "🏠" },
    { label: t("nav.courses"), path: "/courses", icon: "📚" },
    { label: t("nav.offline"), path: "/offline", icon: "📥" },
    ...(isAuthenticated ? [{ label: t("nav.dashboard"), path: getHomeRouteForRole(user?.role), icon: "📊" }] : []),
    { label: t("nav.profile"), path: "/profile", icon: "👤" },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-[#0f172a] z-[70] shadow-2xl transition-transform duration-300 ease-out md:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="text-xl font-black text-gray-900 dark:text-white">
            <span className="text-blue-600">Edu</span>Reach
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm uppercase tracking-widest">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
          {/* Language Switcher */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-4">Language</p>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
              <button onClick={() => handleLanguageChange('en')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${i18n.language.startsWith('en') ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}>English</button>
              <button onClick={() => handleLanguageChange('hi')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${i18n.language.startsWith('hi') ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500'}`}>हिंदी</button>
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => { if(window.confirm('Logout?')) { logout(); onClose(); } }}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
            >
              <span className="text-xl">🚪</span>
              <span className="text-sm uppercase tracking-widest">Logout</span>
            </button>
          )}

          {!isAuthenticated && (
            <div className="grid grid-cols-2 gap-3">
               <NavLink to="/login" onClick={onClose} className="py-4 text-center text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-2xl">Log In</NavLink>
               <NavLink to="/signup" onClick={onClose} className="py-4 text-center text-xs font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl">Sign Up</NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
