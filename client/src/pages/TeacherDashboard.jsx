import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import SidebarLayout from "../layouts/SidebarLayout";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, analyticsRes] = await Promise.all([
          API.get("/courses/teacher/my-courses"),
          API.get("/analytics/teacher/overview")
        ]);
        
        if (Array.isArray(courseRes.data)) {
          setCourses(courseRes.data.slice(0, 3));
        }
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error("Dashboard sync error:", err);
        setError(`Sync Error: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: "Total Learners", value: analytics?.stats?.totalLearners || "0", icon: "👥" },
    { label: "Weekly Active", value: analytics?.stats?.activeWeeklyLearners || "0", icon: "⚡" },
    { label: "Avg. Rating", value: analytics?.stats?.globalAverageRating || "0", icon: "⭐" },
    { label: "Total Courses", value: analytics?.stats?.totalCourses || "0", icon: "📚" },
  ];

  const engagement = analytics?.monthlyEngagement || [];
  const maxEngagement = Math.max(...engagement.map(m => m.count), 1);

  const perf = analytics?.coursePerformance || [];
  const maxEnroll = Math.max(...perf.map(c => c.enrollments), 1);

  // SVG line chart calculations
  const chartW = 500;
  const chartH = 140;
  const padX = 10;
  const padY = 10;
  const usableW = chartW - padX * 2;
  const usableH = chartH - padY * 2;

  const points = engagement.map((m, i) => ({
    x: padX + (i / Math.max(engagement.length - 1, 1)) * usableW,
    y: padY + usableH - (m.count / maxEngagement) * usableH,
    label: m.month,
    count: m.count,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = linePath + ` L${points[points.length - 1]?.x},${chartH - padY} L${points[0]?.x},${chartH - padY} Z`;

  return (
    <SidebarLayout>
      <div className="p-4 pt-2 max-w-7xl mx-auto space-y-10">
        
        <header className="flex flex-wrap justify-between items-end gap-6 mb-8">
           <div>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest mb-4 inline-block">Instructor Portal</span>
              <h1 className="text-4xl font-black text-primary mb-4">
                 Hello, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-lg text-secondary">Manage your academy and track your impact.</p>
           </div>
           <button 
             onClick={() => navigate('/teacher/courses')}
             className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all"
           >
              Create New Course
           </button>
        </header>

        {/* Stats Pills */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {stats.map((stat, i) => (
             <article key={i} className="bg-surface p-5 rounded-[24px] border border-border shadow-sm group hover:-translate-y-1 transition-transform">
                <div className="w-9 h-9 rounded-xl bg-surface-soft flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform">
                   {stat.icon}
                </div>
                <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-xl font-black text-primary">{stat.value}</h3>
             </article>
           ))}
        </section>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Monthly Enrollment Trend — Line Graph */}
          <section className="bg-surface rounded-[2rem] border border-border p-8 space-y-4">
            <div>
               <h2 className="text-lg font-black text-primary">Enrollment Trend</h2>
               <p className="text-[10px] text-secondary font-bold mt-1 uppercase tracking-widest">New enrollments per month</p>
            </div>
            
            {points.length > 1 ? (
              <div className="relative">
                <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-40" preserveAspectRatio="none" overflow="visible">
                  {/* Gradient fill under line */}
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path d={areaPath} fill="url(#areaGrad)" />
                  {/* Line */}
                  <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Points with hover tooltips */}
                  {points.map((p, i) => (
                    <g key={i} className="group">
                      {/* Larger invisible hit area */}
                      <circle cx={p.x} cy={p.y} r="14" fill="transparent" className="cursor-pointer" />
                      {/* Visible dot */}
                      <circle cx={p.x} cy={p.y} r="4" fill="#2563eb" stroke="white" strokeWidth="2" className="drop-shadow-sm group-hover:r-[6] transition-all" />
                      {/* Tooltip */}
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ pointerEvents: 'none' }}>
                        <rect x={p.x - 18} y={p.y - 28} width="36" height="20" rx="6" fill="#111827" />
                        <text x={p.x} y={p.y - 15} textAnchor="middle" fill="white" fontSize="10" fontWeight="800">{p.count}</text>
                      </g>
                    </g>
                  ))}
                </svg>
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 px-2">
                  {engagement.map((m, i) => (
                    <span key={i} className="text-[7px] font-bold text-gray-400 uppercase">{m.month}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-secondary text-sm italic">No data yet</div>
            )}
          </section>

          {/* Course Performance */}
          <section className="bg-surface rounded-[2rem] border border-border p-8 space-y-6">
            <div>
               <h2 className="text-lg font-black text-primary">Course Performance</h2>
               <p className="text-[10px] text-secondary font-bold mt-1 uppercase tracking-widest">Enrollments & quiz scores by course</p>
            </div>

            <div className="space-y-5 max-h-48 overflow-y-auto custom-scrollbar pr-2">
               {perf.length > 0 ? perf.map((c, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-primary truncate max-w-[60%]">{c.title}</span>
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] font-black text-secondary uppercase tracking-widest">{c.enrollments} students</span>
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${c.averageScore >= 70 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : c.averageScore >= 40 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'text-gray-400 bg-surface-soft'}`}>
                              {c.averageScore > 0 ? `${c.averageScore}% avg` : 'No quizzes'}
                           </span>
                        </div>
                     </div>
                     <div className="h-2 w-full bg-surface-soft rounded-full overflow-hidden">
                        <div 
                           className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700"
                           style={{ width: `${(c.enrollments / maxEnroll) * 100}%`, minWidth: '4px' }}
                        />
                     </div>
                  </div>
               )) : (
                  <p className="text-sm text-secondary italic text-center py-8">No course data yet</p>
               )}
            </div>
          </section>
        </div>

        {/* Recent Courses */}
        <div className="space-y-6">
           <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-bold text-primary">Recent Courses</h2>
              <Link to="/teacher/courses" className="text-blue-600 text-sm font-bold hover:underline">View All →</Link>
           </div>

           {loading ? (
             <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-surface-soft rounded-3xl animate-pulse" />)}
             </div>
           ) : (
             <div className="space-y-4">
                {courses.map(course => (
                  <div key={course._id} className="bg-surface p-6 rounded-3xl border border-border shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-blue-600/5 transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-surface-soft rounded-2xl flex items-center justify-center text-2xl">📖</div>
                        <div>
                           <h4 className="font-bold text-primary group-hover:text-blue-600 transition-colors">{course.title}</h4>
                           <span className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">{course.category || "General"}</span>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <button onClick={() => navigate(`/teacher/courses/${course._id}`)} className="px-4 py-2 bg-surface text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 hover:text-white transition-all">Manage</button>
                     </div>
                  </div>
                ))}
                {courses.length === 0 && <p className="text-center py-12 text-gray-400 italic">No courses created yet.</p>}
             </div>
           )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default TeacherDashboard;
