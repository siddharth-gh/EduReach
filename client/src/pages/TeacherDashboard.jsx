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
        
        console.log("Dashboard data loaded:", { courses: courseRes.data, analytics: analyticsRes.data });
        
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
    { label: "Avg. Completion", value: `${analytics?.stats?.averageCompletion || 0}%`, icon: "📈", color: "green" },
    { label: "Enrolled Students", value: analytics?.stats?.totalEnrollments || "0", icon: "👥", color: "blue" },
    { label: "Course Rating", value: "4.8", icon: "⭐", color: "orange" },
    { label: "Quiz Accuracy", value: `${analytics?.stats?.averageQuizScore || 0}%`, icon: "🎯", color: "purple" }
  ];

  return (
    <SidebarLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-12">
        
        {/* Welcome Header */}
        <header className="flex flex-wrap justify-between items-center gap-6">
           <div className="space-y-2">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest">Instructor Overview</span>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Hello, {user?.name.split(' ')[0]} 👋</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your academy and track your impact.</p>
           </div>
           <button 
             onClick={() => navigate('/teacher/courses')}
             className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-2xl shadow-gray-900/20 hover:scale-105 transition-all"
           >
              Create New Course
           </button>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {stats.map((stat, i) => (
             <article key={i} className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm group">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                   {stat.icon}
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
             </article>
           ))}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           
           {/* Recent Courses */}
           <div className="xl:col-span-2 space-y-8">
              <div className="flex justify-between items-center px-2">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Courses</h2>
                 <Link to="/teacher/courses" className="text-blue-600 text-sm font-bold hover:underline">View All →</Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                   {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-4">
                   {courses.map(course => (
                     <div key={course._id} className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl">📖</div>
                           <div>
                              <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{course.title}</h4>
                              <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">{course.category || "General"}</p>
                           </div>
                        </div>
                        <div className="flex gap-3">
                           <button onClick={() => navigate(`/teacher/courses/${course._id}`)} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 hover:text-white transition-all">Manage</button>
                        </div>
                     </div>
                   ))}
                   {courses.length === 0 && <p className="text-center py-12 text-gray-400 italic">No courses created yet.</p>}
                </div>
              )}
           </div>

           {/* Quick Actions / Activity */}
           <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white px-2">Quick Actions</h2>
              <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                 <button className="w-full p-4 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-2xl font-bold text-sm text-left hover:bg-blue-100 transition-all flex items-center gap-4">
                    <span>📢</span> Post Announcement
                 </button>
                 <button 
                  onClick={() => navigate('/teacher/students')}
                  className="w-full p-4 bg-purple-50 dark:bg-purple-900/10 text-purple-600 rounded-2xl font-bold text-sm text-left hover:bg-purple-100 transition-all flex items-center gap-4"
                 >
                    <span>👥</span> Message Students
                 </button>
                 <button className="w-full p-4 bg-green-50 dark:bg-green-900/10 text-green-600 rounded-2xl font-bold text-sm text-left hover:bg-green-100 transition-all flex items-center gap-4">
                    <span>📄</span> Bulk Grade Upload
                 </button>
              </div>
           </div>

        </div>

      </div>
    </SidebarLayout>
  );
};

export default TeacherDashboard;
