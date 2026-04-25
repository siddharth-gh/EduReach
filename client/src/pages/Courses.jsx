import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import AppShell from "../layouts/AppShell";
import CourseCard from "../components/CourseCard";
import { isCourseDownloaded } from "../utils/offlinePack";

const Courses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await API.get("/courses", {
          params: {
            search: search || undefined,
            category: category !== "all" ? category : undefined,
            level: level !== "all" ? level : undefined,
          },
        });
        setCourses(response.data);
      } catch (err) {
        setError(err.response?.data?.message || t("courses.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [search, category, level, t]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Header */}
        <header className="mb-12 text-center lg:text-left">
           <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">{t("courses.catalog")}</span>
           <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mt-2 mb-4 leading-tight">{t("courses.title")}</h1>
           <p className="text-gray-500 dark:text-gray-400 max-w-2xl">{t("courses.subtitle")}</p>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-12 bg-white dark:bg-gray-900 p-4 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-600/5 transition-colors duration-200">
           <div className="flex-1 relative">
             <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
             <input
               className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
               placeholder={t("courses.search")}
               value={search}
               onChange={(event) => setSearch(event.target.value)}
             />
           </div>
           <div className="grid grid-cols-2 lg:flex gap-4">
              <select
                className="px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-700 dark:text-gray-300 font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all appearance-none min-w-[160px]"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="all">{t("courses.allCategories")}</option>
                <option value="Programming">{t("categories.Programming.label")}</option>
                <option value="Science">{t("categories.Science.label")}</option>
                <option value="Mathematics">{t("categories.Mathematics.label")}</option>
                <option value="Career">{t("categories.Career.label")}</option>
                <option value="General">{t("categories.General.label")}</option>
              </select>
              <select
                className="px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-700 dark:text-gray-300 font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all appearance-none min-w-[160px]"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              >
                <option value="all">{t("courses.allLevels")}</option>
                <option value="beginner">{t("courses.levelBeginner")}</option>
                <option value="intermediate">{t("courses.levelIntermediate")}</option>
                <option value="advanced">{t("courses.levelAdvanced")}</option>
              </select>
           </div>
        </div>

        {error && (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-3xl text-red-600 text-sm font-bold text-center mb-12 animate-in fade-in zoom-in duration-300">
             {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800/50 rounded-[40px] animate-pulse"></div>
             ))}
          </div>
        ) : (
          <>
            {courses.length === 0 ? (
               <div className="py-20 text-center">
                  <span className="text-5xl mb-6 block">🏜️</span>
                  <p className="text-gray-500 dark:text-gray-400 font-bold">No courses found matching your criteria.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={{ ...course, downloaded: isCourseDownloaded(course._id) }}
                      onClick={() => navigate(`/course/${course._id}`)}
                    />
                  ))}
               </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
};

export default Courses;
