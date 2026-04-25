import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../app/useAuth";

const SidebarLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    // Keep Vanilla CSS dark mode working
    document.documentElement.setAttribute("data-theme", theme);
    // Add tailwind dark class
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => current === "dark" ? "light" : "dark");
  };

  const navItems = [
    { name: "Dashboard", path: "/teacher/dashboard", icon: "📊" },
    { name: "Courses", path: "/teacher/courses", icon: "📚" },
    { name: "Students", path: "/teacher/students", icon: "👥" },
    { name: "Analytics", path: "/teacher/analytics", icon: "📈" },
    { name: "Calendar", path: "/teacher/calendar", icon: "📅" },
    { name: "Profile", path: "/teacher/profile", icon: "👤" },
  ];

  // In the Figma, "Courses" is highlighted as active. I'll just match exact paths.
  // Note: we're replacing the dashboard page, so /teacher/dashboard is the active one for this task.

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0B0F19] font-sans overflow-hidden">
      
      {/* Slim Modern Sidebar */}
      <aside className="w-16 bg-[#0B0F19] border-r border-gray-800 flex flex-col items-center py-6 gap-8 z-50">
        {/* Logo */}
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-blue-600/30 cursor-pointer hover:scale-105 transition-all">
          E
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all relative group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                    : "text-gray-600 hover:text-white hover:bg-gray-800"
                }`}
              >
                <span>{item.icon}</span>
                
                {/* Tooltip */}
                <div className="absolute left-14 px-2 py-1 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 pointer-events-none translate-x-2 group-hover:translate-x-0 transition-all shadow-2xl border border-gray-800 whitespace-nowrap z-[100]">
                  {item.name}
                </div>

                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute -left-3 w-1 h-5 bg-blue-600 rounded-r-full shadow-[0_0_15px_rgba(37,99,235,0.8)]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4 mt-auto">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl border border-gray-800 flex items-center justify-center text-base text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center text-white text-[10px] font-black border border-gray-700 cursor-pointer hover:border-blue-500 transition-all">
            {user?.name?.charAt(0)?.toUpperCase() || "T"}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#0B0F19]">
        {children}
      </main>

    </div>
  );
};

export default SidebarLayout;
