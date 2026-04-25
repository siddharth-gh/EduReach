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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#121212] font-sans overflow-hidden transition-colors duration-200">
      
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-500">Edu</span>Platform
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Teacher Portal</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-4"
          >
            <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>

          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "T"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || "Teacher Name"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || "teacher@edu.com"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {children}
      </main>

    </div>
  );
};

export default SidebarLayout;
