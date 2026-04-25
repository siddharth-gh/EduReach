import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";
import {
  downloadCoursePack,
  getOfflineCoursePack,
  isCourseDownloaded,
} from "../utils/offlinePack";

const CourseDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState({});
  const [quizzes, setQuizzes] = useState({});
  const [openModule, setOpenModule] = useState(null);
  const [error, setError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("");
  const [offlineAvailable, setOfflineAvailable] = useState(false);
  const [isStartingLive, setIsStartingLive] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await API.get(`/courses/${courseId}`);
        setCourse(response.data);
        setOfflineAvailable(isCourseDownloaded(courseId));
      } catch (err) {
        const offlinePack = await getOfflineCoursePack(courseId);
        if (offlinePack?.course) {
          setCourse(offlinePack.course);
          setModules(offlinePack.modules || []);
          setLectures(offlinePack.lecturesByModule || {});
          setOfflineAvailable(true);
          return;
        }
        setError(err.response?.data?.message || t("courseDetail.loadCourseError"));
      }
    };
    fetchCourse();
  }, [courseId, t]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await API.get(`/modules/${courseId}`);
        setModules(response.data);
      } catch (err) {
        const offlinePack = await getOfflineCoursePack(courseId);
        if (offlinePack?.modules) {
          setModules(offlinePack.modules);
          setLectures(offlinePack.lecturesByModule || {});
          setOfflineAvailable(true);
          return;
        }
        setError(err.response?.data?.message || t("courseDetail.loadModulesError"));
      }
    };
    fetchModules();
  }, [courseId, t]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") return;
    const fetchEnrollments = async () => {
      try {
        const response = await API.get("/enrollments/my-courses");
        const enrolled = response.data.some(e => e.courseId?._id === courseId);
        setIsEnrolled(enrolled);
      } catch {
        setIsEnrolled(false);
      }
    };
    fetchEnrollments();
  }, [courseId, isAuthenticated, user?.role]);

  const toggleModule = async (moduleId) => {
    if (openModule === moduleId) {
      setOpenModule(null);
      return;
    }
    setOpenModule(moduleId);
    if (!lectures[moduleId]) {
      try {
        const [lectureResponse, quizResponse] = await Promise.all([
          API.get(`/lectures/${moduleId}`),
          API.get(`/quizzes/module/${moduleId}`),
        ]);
        setLectures(curr => ({ ...curr, [moduleId]: lectureResponse.data }));
        setQuizzes(curr => ({ ...curr, [moduleId]: quizResponse.data }));
      } catch (err) {
        setError(err.response?.data?.message || t("courseDetail.loadItemsError"));
      }
    }
  };

  const handleEnroll = async () => {
    setEnrollmentMessage("");
    setIsEnrolling(true);
    try {
      await API.post("/enrollments", { courseId });
      setIsEnrolled(true);
      setEnrollmentMessage(t("courseDetail.enrollSuccess"));
    } catch (err) {
      setEnrollmentMessage(err.response?.data?.message || t("courseDetail.enrollError"));
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDownload = async () => {
    setDownloadMessage("");
    setIsDownloading(true);
    try {
      const result = await downloadCoursePack(courseId);
      setDownloadMessage(t("courseDetail.offlineReady", { cachedCount: result.cachedCount, assetCount: result.assetCount }));
      setOfflineAvailable(true);
    } catch (err) {
      setDownloadMessage(err.message || t("courseDetail.downloadError"));
    } finally {
      setIsDownloading(false);
    }
  };

  if (error) return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-red-600 font-bold bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-200 dark:border-red-900/50">{error}</p>
      </div>
    </AppShell>
  );

  if (!course) return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl w-3/4 mb-6"></div>
        <div className="h-32 bg-gray-100 dark:bg-gray-800/50 rounded-[40px] mb-12"></div>
        <div className="space-y-4">
           {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl"></div>)}
        </div>
      </div>
    </AppShell>
  );

  const isTeacherOwner = isAuthenticated && user?.role === "teacher" && course.teacherId?._id === user?.id;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Breadcrumb / Back */}
        <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
           ← {t("common.back")}
        </button>

        {/* Hero Card */}
        <section className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[48px] p-8 lg:p-16 overflow-hidden shadow-2xl shadow-blue-600/5 mb-12">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
           
           <div className="relative z-10">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full uppercase tracking-widest">{course.category || "General"}</span>
                <span className="px-4 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-black rounded-full uppercase tracking-widest">{course.level || "Beginner"}</span>
                {course.liveSession?.isActive && (
                  <span className="px-4 py-1.5 bg-red-500 text-white text-xs font-black rounded-full uppercase tracking-widest animate-pulse">Live Now</span>
                )}
                {offlineAvailable && (
                  <span className="px-4 py-1.5 bg-green-500 text-white text-xs font-black rounded-full uppercase tracking-widest">Offline Ready</span>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">{course.title}</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl mb-8">{course.description}</p>
              
              <div className="flex items-center gap-3 mb-10 pb-10 border-b border-gray-50 dark:border-gray-800">
                 <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold uppercase">
                    {course.teacherId?.name?.charAt(0) || "T"}
                 </div>
                 <div className="text-sm">
                    <p className="text-gray-400 font-medium uppercase text-[10px] tracking-widest">Instructor</p>
                    <p className="text-gray-900 dark:text-white font-bold">{course.teacherId?.name || t("courseDetail.unknownInstructor")}</p>
                 </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-4">
                 {isTeacherOwner ? (
                   <>
                      <button 
                        onClick={() => navigate(`/course/${courseId}/live`)}
                        className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-xl ${course.liveSession?.isActive ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'}`}
                      >
                        {course.liveSession?.isActive ? "Resume Live Room" : t("courseDetail.goLive")}
                      </button>
                   </>
                 ) : (
                   <>
                      {user?.role === "student" && (
                        <button 
                          onClick={handleEnroll} 
                          disabled={isEnrolled}
                          className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-xl ${isEnrolled ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 transform hover:-translate-y-1'}`}
                        >
                          {isEnrolled ? t("courseDetail.enrolled") : isEnrolling ? t("courseDetail.enrolling") : t("courseDetail.enrollNow")}
                        </button>
                      )}
                      {course.liveSession?.isActive && (
                        <button 
                          onClick={() => navigate(`/course/${courseId}/live`)}
                          className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 transition-all transform hover:-translate-y-1"
                        >
                          {t("courseDetail.joinLive")}
                        </button>
                      )}
                   </>
                 )}
                 <button 
                  onClick={handleDownload} 
                  disabled={isDownloading}
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all"
                 >
                  {isDownloading ? t("courseDetail.downloading") : t("courseDetail.downloadOffline")}
                 </button>
              </div>
              
              {enrollmentMessage && <p className="mt-4 text-xs font-bold text-blue-600 uppercase tracking-wider">{enrollmentMessage}</p>}
              {downloadMessage && <p className="mt-4 text-xs font-bold text-green-600 uppercase tracking-wider">{downloadMessage}</p>}
           </div>
        </section>

        {/* Modules Section */}
        <div className="space-y-6">
           <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Course Content</h2>
              <div className="h-px flex-1 bg-gray-100 dark:border-gray-800" />
              <p className="text-sm font-bold text-gray-400">{modules.length} Modules</p>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {modules.map((module) => {
                const isOpen = openModule === module._id;
                return (
                  <div key={module._id} className={`group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden transition-all ${isOpen ? 'shadow-2xl shadow-blue-600/5 ring-2 ring-blue-500/20' : 'hover:border-gray-300 dark:hover:border-gray-700'}`}>
                    <button 
                      onClick={() => toggleModule(module._id)}
                      className="w-full flex items-center justify-between p-6 lg:p-8 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${isOpen ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600'}`}>
                          {isOpen ? '↓' : '→'}
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{module.title}</span>
                      </div>
                      <span className="text-xs font-black uppercase text-gray-400 tracking-widest">{isOpen ? t("common.hide") : t("common.view")}</span>
                    </button>

                    {isOpen && (
                      <div className="px-8 pb-8 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                        {!lectures[module._id] ? (
                          <div className="py-8 text-center text-gray-400 italic text-sm">{t("courseDetail.loadingItems")}</div>
                        ) : (
                          <>
                             {lectures[module._id].map((lecture) => (
                               <div key={lecture._id} className="space-y-2">
                                  <button 
                                    onClick={() => navigate(`/lecture/${lecture._id}`, { state: { lectures: lectures[module._id] } })}
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl flex items-center gap-4 transition-all group/item"
                                  >
                                    <span className="text-xl">📽️</span>
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover/item:text-blue-600">{lecture.title}</span>
                                  </button>
                                  {(quizzes[module._id] || []).filter(q => q.sourceLectureId === lecture._id).map(quiz => (
                                    <button 
                                      key={quiz._id}
                                      onClick={() => navigate(`/quiz/${quiz._id}`)}
                                      className="ml-8 w-[calc(100%-2rem)] p-4 bg-orange-50/50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-2xl flex items-center gap-4 transition-all"
                                    >
                                      <span className="text-xl">📝</span>
                                      <span className="text-xs font-bold text-orange-700 dark:text-orange-400">{t("courseDetail.quizPrefix")}: {quiz.title}</span>
                                    </button>
                                  ))}
                               </div>
                             ))}
                             {/* Floating Quizzes */}
                             {(quizzes[module._id] || []).filter(q => !q.sourceLectureId).map(quiz => (
                               <button 
                                  key={quiz._id}
                                  onClick={() => navigate(`/quiz/${quiz._id}`)}
                                  className="w-full p-4 bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-2xl flex items-center gap-4 transition-all"
                                >
                                  <span className="text-xl">🧠</span>
                                  <span className="text-xs font-bold text-purple-700 dark:text-purple-400">{t("courseDetail.quizPrefix")}: {quiz.title}</span>
                                </button>
                             ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
           </div>
        </div>

      </div>
    </AppShell>
  );
};

export default CourseDetail;
