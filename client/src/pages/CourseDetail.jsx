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
  clearOfflineCourse,
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
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [ratingMessage, setRatingMessage] = useState("");
  const [isRatingLoading, setIsRatingLoading] = useState(false);

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
      setLectures({});
      setQuizzes({});
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

  useEffect(() => {
    if (modules.length === 0) return;

    const fetchAllModuleItems = async () => {
      const lectureResults = await Promise.allSettled(
        modules.map(m => API.get(`/lectures/${m._id}`))
      );
      const quizResults = await Promise.allSettled(
        modules.map(m => API.get(`/quizzes/module/${m._id}`))
      );

      const newLectures = {};
      const newQuizzes = {};

      modules.forEach((m, i) => {
        const mId = String(m._id);
        const lRes = lectureResults[i];
        const qRes = quizResults[i];

        newLectures[mId] = (lRes.status === 'fulfilled' && Array.isArray(lRes.value.data)) 
          ? lRes.value.data.filter(l => l.isPublished)
          : [];
        
        newQuizzes[mId] = (qRes.status === 'fulfilled' && Array.isArray(qRes.value.data)) 
          ? qRes.value.data.filter(q => q.isPublished)
          : [];
      });

      setLectures(newLectures);
      setQuizzes(newQuizzes);
    };

    fetchAllModuleItems();
  }, [modules]);

  const toggleModule = (moduleId) => {
    const mIdStr = String(moduleId);
    setOpenModule(prev => prev === mIdStr ? null : mIdStr);
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

  const handleRemoveOffline = async () => {
    if (!window.confirm(t("courseDetail.confirmRemoveOffline"))) return;
    const success = await clearOfflineCourse(courseId);
    if (success) {
      setOfflineAvailable(false);
      setDownloadMessage(t("courseDetail.offlineRemoved"));
    }
  };
  
  const handleRate = async (rating) => {
    setIsRatingLoading(true);
    setRatingMessage("");
    try {
      const response = await API.post(`/courses/${courseId}/rate`, { rating, review: userReview });
      setRatingMessage(response.data.message);
      setUserRating(rating);
      const courseRes = await API.get(`/courses/${courseId}`);
      setCourse(courseRes.data);
    } catch (err) {
      setRatingMessage(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleStopLive = async () => {
    if (!window.confirm("Are you sure you want to stop this live session for everyone?")) return;
    try {
      await API.post(`/courses/${courseId}/live/stop`);
      setCourse(curr => ({
        ...curr,
        liveSession: { ...curr.liveSession, isActive: false }
      }));
    } catch (err) {
      setError("Failed to stop live session: " + (err.response?.data?.message || err.message));
    }
  };

  if (error) return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-error font-bold bg-error/10 p-6 rounded-[32px] border border-error/20">{error}</p>
      </div>
    </AppShell>
  );

  if (!course) return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-10 bg-surface-muted rounded-xl w-32 mb-8"></div>
        <div className="h-[400px] bg-surface rounded-[48px] mb-12 border border-border"></div>
        <div className="space-y-6">
           {[1,2,3].map(i => <div key={i} className="h-24 bg-surface rounded-[24px] border border-border"></div>)}
        </div>
      </div>
    </AppShell>
  );

  const isTeacherOwner = isAuthenticated && user?.role === "teacher" && course.teacherId?._id === user?.id;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 flex items-center gap-2 text-xs font-black text-secondary hover:text-accent transition-colors uppercase tracking-[0.2em]"
        >
           ← {t("common.back")}
        </button>

        {/* Hero Section */}
        <section className="relative bg-surface border border-border rounded-[48px] p-8 lg:p-16 overflow-hidden shadow-sm mb-12">
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />
           
           <div className="relative z-10">
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-4 py-1.5 bg-accent/10 text-accent text-[10px] font-black rounded-full uppercase tracking-widest">{course.category || "General"}</span>
                <span className="px-4 py-1.5 bg-surface-soft text-secondary text-[10px] font-black rounded-full uppercase tracking-widest">{course.level || "Beginner"}</span>
                {course.liveSession?.isActive && (
                  <span className="px-4 py-1.5 bg-error text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">{t("courseDetail.liveNow")}</span>
                )}
                {offlineAvailable && (
                  <span className="px-4 py-1.5 bg-success text-white text-[10px] font-black rounded-full uppercase tracking-widest">{t("courseDetail.offlineBadge")}</span>
                )}
                {course.averageRating > 0 && (
                  <span className="px-4 py-1.5 bg-warning text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1">
                    ⭐ {course.averageRating}
                  </span>
                )}
              </div>

              <h1 className="text-4xl lg:text-6xl font-black text-primary leading-[1.1] mb-6 tracking-tight">{course.title}</h1>
              <p className="text-lg lg:text-xl text-secondary leading-relaxed max-w-3xl mb-10">{course.description}</p>

              {/* Scheduled Sessions */}
              {course.scheduledSessions?.length > 0 && (
                <div className="mb-10 p-6 bg-surface-soft/30 rounded-[32px] border border-border inline-block">
                   <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4">{t("courseDetail.upcomingLive")}</p>
                   <div className="flex flex-wrap gap-4">
                      {course.scheduledSessions.map((s, i) => (
                        <div key={i} className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border/50">
                           <div className="w-10 h-10 bg-accent/10 text-accent flex items-center justify-center rounded-xl text-xl">📅</div>
                           <div>
                              <p className="text-xs font-black text-primary">{s.title}</p>
                              <p className="text-[10px] text-secondary mt-0.5">{new Date(s.scheduledAt).toLocaleString()}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-10 pb-10 border-b border-border/50">
                 <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg shadow-accent/20">
                    {course.teacherId?.name?.charAt(0) || "T"}
                 </div>
                 <div>
                    <p className="text-secondary font-black uppercase text-[10px] tracking-widest">{t("courseDetail.instructor")}</p>
                    <p className="text-primary font-bold text-lg">{course.teacherId?.name || t("courseDetail.unknownInstructor")}</p>
                 </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-4">
                  {isTeacherOwner ? (
                    <>
                       <button 
                         onClick={() => navigate(`/course/${courseId}/live`)}
                         className={`px-10 py-5 rounded-2xl font-black transition-all shadow-xl ${course.liveSession?.isActive ? 'bg-error hover:bg-error/90 text-white shadow-error/20' : 'bg-accent hover:bg-accent/90 text-white shadow-accent/20'}`}
                       >
                         {course.liveSession?.isActive ? t("courseDetail.openLiveRoom") : t("courseDetail.goLive")}
                       </button>
                       {course.liveSession?.isActive && (
                         <button 
                           onClick={handleStopLive}
                           className="px-10 py-5 bg-surface text-error font-black rounded-2xl border border-error/20 hover:bg-error/5 transition-all"
                         >
                           {t("courseDetail.stopLiveSession")}
                         </button>
                       )}
                    </>
                  ) : (
                    <>
                       {user?.role === "student" && !isEnrolled && (
                         <button 
                           onClick={handleEnroll} 
                           className="px-10 py-5 bg-accent hover:bg-accent/90 text-white font-black rounded-2xl shadow-xl shadow-accent/20 transform hover:-translate-y-1 transition-all"
                         >
                           {isEnrolling ? t("courseDetail.enrolling") : t("courseDetail.enrollNow")}
                         </button>
                       )}
                       {isEnrolled && course.liveSession?.isActive && (
                         <button 
                           onClick={() => navigate(`/course/${courseId}/live`)}
                           className="px-10 py-5 bg-error hover:bg-error/90 text-white font-black rounded-2xl shadow-xl shadow-error/20 transition-all transform hover:-translate-y-1"
                         >
                           {t("courseDetail.joinLive")}
                         </button>
                       )}
                    </>
                  )}

                  {(isEnrolled || isTeacherOwner) && (
                    <>
                      {offlineAvailable ? (
                        <button 
                          onClick={handleRemoveOffline} 
                          className="px-10 py-5 bg-surface text-error font-black rounded-2xl border border-error/20 hover:bg-error/5 transition-all"
                        >
                          {t("courseDetail.removeOffline")}
                        </button>
                      ) : (
                        <button 
                          onClick={handleDownload} 
                          disabled={isDownloading}
                          className="px-10 py-5 bg-surface text-primary font-black rounded-2xl border border-border hover:bg-surface-soft transition-all"
                        >
                          {isDownloading ? t("courseDetail.downloading") : t("courseDetail.downloadOffline")}
                        </button>
                      )}
                    </>
                  )}
              </div>
              
              {enrollmentMessage && <p className="mt-6 text-[10px] font-black text-accent uppercase tracking-widest">{enrollmentMessage}</p>}
              {downloadMessage && <p className="mt-6 text-[10px] font-black text-success uppercase tracking-widest">{downloadMessage}</p>}

              {/* Rating Section */}
              {isEnrolled && (
                <div className="mt-12 pt-10 border-t border-border/50">
                  <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-6">{t("courseDetail.rateCourse")}</h3>
                  <div className="flex items-center gap-6 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        disabled={isRatingLoading}
                        onClick={() => handleRate(star)}
                        className={`text-4xl transition-all transform hover:scale-110 hover:rotate-12 ${star <= (userRating || course.ratings?.find(r => (r.userId?._id || r.userId)?.toString() === user?.id)?.rating || 0) ? 'text-warning drop-shadow-sm' : 'text-surface-muted dark:text-gray-800'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {ratingMessage && <p className="text-[10px] font-black text-accent uppercase tracking-widest">{ratingMessage}</p>}
                </div>
              )}
           </div>
        </section>

        {/* Course Modules Section */}
        <div className="max-w-4xl mx-auto">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h2 className="text-3xl font-black text-primary tracking-tight mb-1">{t("courseDetail.courseContent")}</h2>
                 <p className="text-secondary text-sm font-medium">{t("courseDetail.modulesCount", { count: modules.length })}</p>
              </div>
              <div className="hidden sm:block h-px flex-1 bg-border/50 mx-8" />
           </div>

           <div className="space-y-4">
              {modules.map((module, idx) => {
                const isOpen = openModule === String(module._id);
                return (
                  <div key={module._id} className={`group bg-surface border border-border rounded-[24px] overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-xl shadow-accent/5 ring-1 ring-accent/10 border-accent/20' : 'hover:border-accent/30'}`}>
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleModule(module._id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleModule(module._id);
                        }
                      }}
                      className="w-full flex items-center justify-between p-6 lg:p-8 text-left cursor-pointer outline-none focus:bg-surface-soft"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-300 ${isOpen ? 'bg-accent text-white rotate-90 shadow-lg shadow-accent/20' : 'bg-surface-soft text-secondary'}`}>
                           {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div>
                           <span className={`text-lg font-black transition-colors ${isOpen ? 'text-accent' : 'text-primary group-hover:text-accent'}`}>{module.title}</span>
                           <p className="text-[10px] font-black text-secondary uppercase tracking-widest mt-1">Module {idx + 1}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black uppercase text-secondary tracking-widest hidden sm:inline">{isOpen ? t("common.hide") : t("common.view")}</span>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-surface-soft text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                            ↓
                         </div>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="px-6 lg:px-8 pb-8 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        {!lectures[String(module._id)] ? (
                          <div className="py-12 text-center">
                             <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
                             <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{t("courseDetail.loadingItems")}</p>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                             {(lectures[String(module._id)] || []).map((lecture, lIdx) => (
                               <div key={lecture._id} className="space-y-2">
                                  <button 
                                    onClick={() => navigate(`/lecture/${lecture._id}`, { state: { lectures: lectures[String(module._id)] } })}
                                    className="w-full p-5 bg-surface-soft/50 hover:bg-accent/5 rounded-2xl flex items-center justify-between transition-all group/item border border-transparent hover:border-accent/10"
                                  >
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">📽️</div>
                                       <div className="text-left">
                                          <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-0.5">Lecture {lIdx + 1}</p>
                                          <p className="text-sm font-black text-primary">{lecture.title}</p>
                                       </div>
                                    </div>
                                    <span className="text-accent opacity-0 group-hover/item:opacity-100 transition-opacity font-black text-sm">→</span>
                                  </button>

                                  {(quizzes[String(module._id)] || []).filter(q => q.sourceLectureId === lecture._id).map(quiz => (
                                    <button 
                                      key={quiz._id}
                                      onClick={() => navigate(`/quiz/${quiz._id}`)}
                                      className="ml-14 w-[calc(100%-3.5rem)] p-4 bg-warning/5 hover:bg-warning/10 rounded-2xl flex items-center gap-4 transition-all border border-warning/10"
                                    >
                                      <span className="w-8 h-8 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">📝</span>
                                      <div className="text-left">
                                         <p className="text-[10px] font-black text-warning uppercase tracking-widest mb-0.5">{t("courseDetail.quizPrefix")}</p>
                                         <p className="text-xs font-bold text-primary">{quiz.title}</p>
                                      </div>
                                    </button>
                                  ))}
                               </div>
                             ))}
                             
                             {/* Standalone Module Quizzes */}
                             {(quizzes[String(module._id)] || []).filter(q => !q.sourceLectureId).map(quiz => (
                               <button 
                                  key={quiz._id}
                                  onClick={() => navigate(`/quiz/${quiz._id}`)}
                                  className="w-full p-5 bg-accent/5 hover:bg-accent/10 rounded-2xl flex items-center justify-between transition-all border border-accent/10"
                                >
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">🧠</div>
                                     <div className="text-left">
                                        <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-0.5">Module Quiz</p>
                                        <p className="text-sm font-black text-primary">{quiz.title}</p>
                                     </div>
                                  </div>
                                  <span className="text-accent font-black text-sm">→</span>
                                </button>
                             ))}
                          </div>
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
