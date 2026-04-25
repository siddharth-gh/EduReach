import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import AppShell from "../layouts/AppShell";
import {
  clearOfflineCourse,
  getOfflineCoursePack,
  getOfflineIndex,
} from "../utils/offlinePack";

const OfflineLibrary = () => {
  const { t } = useTranslation();
  const [offlineCourses, setOfflineCourses] = useState([]);
  const [error, setError] = useState("");

  const loadOffline = async () => {
    setError("");
    const index = getOfflineIndex();
    const packs = await Promise.all(
      index.map(async (entry) => ({
        entry,
        pack: await getOfflineCoursePack(entry.courseId),
      }))
    );
    setOfflineCourses(
      packs
        .filter((item) => item.pack?.course)
        .map((item) => ({
          courseId: item.entry.courseId,
          title: item.pack.course.title,
          description: item.pack.course.description,
          downloadedAt: item.entry.downloadedAt,
          modules: item.pack.modules?.length || 0,
        }))
    );
  };

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        await loadOffline();
      } catch {
        if (isMounted) setError(t("offlineLibrary.loadError"));
      }
    };
    run();
    return () => { isMounted = false; };
  }, [t]);

  const handleRemove = async (courseId) => {
    await clearOfflineCourse(courseId);
    await loadOffline();
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] font-black rounded-full uppercase tracking-widest mb-4 inline-block">
            {t("offlineLibrary.title")}
          </span>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
            {t("offlineLibrary.downloadedCourses")}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {t("offlineLibrary.subtitle")}
          </p>
        </header>

        {error && (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-3xl text-red-600 font-bold mb-8">
            {error}
          </div>
        )}

        {offlineCourses.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-[48px] border-2 border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-400 font-bold text-lg">{t("offlineLibrary.empty")}</p>
            <Link to="/courses" className="mt-4 inline-block text-blue-600 font-black uppercase text-xs tracking-widest hover:underline">
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {offlineCourses.map((course) => (
              <article key={course.courseId} className="group bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-600/5 hover:shadow-2xl hover:shadow-blue-600/10 transition-all">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest mb-3 inline-block">
                      {t("offlineLibrary.badge")}
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/course/${course.courseId}`}
                      className="px-6 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                    >
                      {t("home.openCourse")}
                    </Link>
                    <button
                      type="button"
                      className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      onClick={() => handleRemove(course.courseId)}
                    >
                      {t("offlineLibrary.remove")}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 pt-6 border-t border-gray-50 dark:border-gray-800">
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("offlineLibrary.modules")}:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{course.modules}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("offlineLibrary.downloadedAt")}:</span>
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{new Date(course.downloadedAt).toLocaleDateString()}</span>
                   </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default OfflineLibrary;
