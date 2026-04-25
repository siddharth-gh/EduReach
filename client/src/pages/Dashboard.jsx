import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const handleRecommendationClick = (item) => {
    if (item.type === "lecture") return navigate(`/lecture/${item.targetId}`);
    if (item.type === "revision") return navigate(`/quiz/${item.targetId}`);
    navigate(`/course/${item.targetId}`);
  };

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [ovRes, recRes, attRes, achRes, noteRes] = await Promise.all([
          API.get("/progress/me/overview"),
          API.get("/recommendations/me"),
          API.get("/quiz-attempts/my-results"),
          API.get("/achievements/me"),
          API.get("/notes/me"),
        ]);
        setOverview(ovRes.data);
        setRecommendations(recRes.data);
        setAttempts(attRes.data);
        setAchievements(achRes.data);
        setNotes(noteRes.data);
      } catch (err) {
        setError(err.response?.data?.message || t("dashboard.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [t]);

  if (loading) return <AppShell><div className="max-w-7xl mx-auto px-4 py-20 animate-pulse"><div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl w-1/4 mb-10"></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="h-48 bg-gray-100 dark:bg-gray-800/50 rounded-[40px]"></div><div className="h-48 bg-gray-100 dark:bg-gray-800/50 rounded-[40px]"></div><div className="h-48 bg-gray-100 dark:bg-gray-800/50 rounded-[40px]"></div></div></div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Welcome Header */}
        <header className="mb-12">
           <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest mb-4 inline-block">Student Portal</span>
           <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
              {t("dashboard.welcome", { name: user?.name })}
           </h1>
           <p className="text-lg text-gray-500 dark:text-gray-400">{t("dashboard.subtitle")}</p>
        </header>

        {error && <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-3xl text-red-600 font-bold mb-10">{error}</div>}

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <article className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-600/5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t("dashboard.progressTitle")}</p>
              <div className="flex items-end gap-2">
                 <span className="text-4xl font-black text-gray-900 dark:text-white">{overview?.stats?.enrolledCourses ?? 0}</span>
                 <span className="text-xs font-bold text-gray-400 mb-2">Courses Enrolled</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between">
                 <span className="text-xs font-bold text-gray-500">Completed Lectures</span>
                 <span className="text-xs font-black text-blue-600">{overview?.stats?.completedLectures ?? 0}</span>
              </div>
           </article>

           <article className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-600/5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Daily Streak</p>
              <div className="flex items-end gap-2">
                 <span className="text-4xl font-black text-orange-500">{user?.streakCount ?? 0}</span>
                 <span className="text-xs font-bold text-gray-400 mb-2">Days Burning</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between">
                 <span className="text-xs font-bold text-gray-500">Last Active</span>
                 <span className="text-xs font-black text-orange-500">{user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 'Today'}</span>
              </div>
           </article>

           <article className="bg-blue-600 p-8 rounded-[40px] shadow-2xl shadow-blue-600/20 text-white">
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Next Milestone</p>
              <h3 className="text-xl font-black mb-2 line-clamp-1">{recommendations[0]?.title || "Keep Learning"}</h3>
              <p className="text-xs font-bold text-blue-100 opacity-80 mb-4">{recommendations[0]?.reason || "Browse new courses to start your journey."}</p>
              <button 
                onClick={() => recommendations[0] ? handleRecommendationClick(recommendations[0]) : navigate('/courses')}
                className="w-full py-3 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all"
              >
                Continue Path
              </button>
           </article>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           {/* Left/Main Column */}
           <div className="lg:col-span-2 space-y-10">
              
              {/* Enrolled Courses */}
              <section>
                 <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Active Enrollments</h2>
                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    {overview?.enrollments?.map((e) => (
                      <article key={e._id} onClick={() => navigate(`/course/${e.courseId?._id}`)} className="group bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-blue-600/5 transition-all cursor-pointer flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 font-black">{e.progressPercent}%</div>
                            <div>
                               <h3 className="text-sm font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{e.courseId?.title}</h3>
                               <p className="text-xs text-gray-400 mt-1 line-clamp-1">{e.courseId?.description}</p>
                            </div>
                         </div>
                         <span className="text-[10px] font-black text-gray-300 uppercase group-hover:text-blue-600">Open →</span>
                      </article>
                    ))}
                    {!overview?.enrollments?.length && <p className="text-gray-400 italic text-sm py-10 text-center">No active enrollments. Time to start something new!</p>}
                 </div>
              </section>

              {/* Quiz Results */}
              {attempts.length > 0 && (
                <section>
                   <div className="flex items-center gap-4 mb-8">
                      <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Recent Assessments</h2>
                      <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {attempts.slice(0, 4).map((a) => (
                        <article key={a._id} onClick={() => navigate(`/quiz-result/${a._id}`)} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-blue-500/30 transition-all cursor-pointer">
                           <div className="flex justify-between items-start mb-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${a.passed ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                                 {a.passed ? 'Passed' : 'Needs Review'}
                              </span>
                              <span className="text-lg font-black text-gray-900 dark:text-white">{a.score}%</span>
                           </div>
                           <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 line-clamp-1">{a.quizId?.title}</h3>
                        </article>
                      ))}
                   </div>
                </section>
              )}

           </div>

           {/* Right/Sidebar Column */}
           <div className="space-y-10">
              
              {/* Achievements */}
              <section className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-600/5">
                 <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <span className="text-2xl">🏆</span> Achievements
                 </h2>
                 <div className="space-y-4">
                    {achievements.slice(0, 3).map((ach) => (
                      <div key={ach._id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                         <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{ach.type}</p>
                         <h4 className="text-xs font-black text-gray-900 dark:text-white">{ach.title}</h4>
                         <p className="text-[10px] text-gray-500 mt-1 italic">{new Date(ach.awardedAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                    {!achievements.length && <p className="text-xs text-gray-400 italic">No achievements yet. Keep learning to unlock!</p>}
                 </div>
              </section>

              {/* Quick Notes */}
              <section className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-600/5">
                 <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <span className="text-2xl">📝</span> Recent Notes
                 </h2>
                 <div className="space-y-4">
                    {notes.slice(0, 3).map((note) => (
                      <div key={note._id} onClick={() => navigate(`/lecture/${note.lectureId?._id}`)} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 cursor-pointer hover:border-blue-500/30 transition-all">
                         <h4 className="text-xs font-black text-gray-900 dark:text-white line-clamp-1">{note.lectureId?.title}</h4>
                         <p className="text-[10px] text-gray-500 mt-2 line-clamp-2 italic">"{note.content}"</p>
                      </div>
                    ))}
                    {!notes.length && <p className="text-xs text-gray-400 italic">Capture key insights during lectures.</p>}
                 </div>
              </section>

           </div>

        </div>

      </div>
    </AppShell>
  );
};

export default Dashboard;
