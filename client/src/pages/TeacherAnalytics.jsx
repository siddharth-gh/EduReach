import { useEffect, useState } from "react";
import API from "../api/api";
import SidebarLayout from "../layouts/SidebarLayout";

const TeacherAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await API.get("/analytics/teacher/overview");
        setData(response.data);
      } catch (err) {
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <SidebarLayout>
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
         <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
         <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Processing Data...</p>
      </div>
    </SidebarLayout>
  );

  return (
    <SidebarLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-12">
        
        <header>
           <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
           <p className="text-gray-500 dark:text-gray-400 mt-2">In-depth insights into your courses and student engagement.</p>
        </header>

        {/* Top Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           <article className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">Course Performance</h3>
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">By Enrollments</span>
              </div>
              <div className="space-y-8">
                 {data?.coursePerformance?.map((course, i) => (
                   <div key={course.courseId} className="space-y-3">
                      <div className="flex justify-between items-end">
                         <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{course.title}</p>
                         <p className="text-xs text-gray-400 font-bold">{course.enrollments} Students</p>
                      </div>
                      <div className="h-3 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                           style={{ width: `${Math.min((course.enrollments / (data.stats.totalEnrollments || 1)) * 100, 100)}%` }}
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </article>

           <article className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Critical Insight</p>
                 <h3 className="text-2xl font-bold leading-tight">Your students are struggling most with:</h3>
              </div>
              
              <div className="relative z-10 py-8">
                 {data?.hardestQuiz ? (
                   <div className="space-y-2">
                      <p className="text-4xl font-bold text-blue-400">{data.hardestQuiz.averageScore}%</p>
                      <p className="text-sm font-bold opacity-80 uppercase tracking-tight">{data.hardestQuiz.title}</p>
                   </div>
                 ) : (
                   <p className="text-sm italic opacity-50">Not enough quiz data yet.</p>
                 )}
              </div>

              <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-gray-400 italic">
                 Consider adding a remediation lecture for this topic.
              </div>
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
           </article>

        </div>

        {/* Detailed Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
           {[
             { label: "Quiz Accuracy", value: `${data?.stats?.averageQuizScore || 0}%`, icon: "🎯", color: "orange" },
             { label: "Avg. Completion", value: `${data?.stats?.averageCompletion || 0}%`, icon: "📈", color: "green" },
             { label: "Total Modules", value: data?.stats?.totalModules || 0, icon: "📦", color: "purple" },
             { label: "Feedback Rating", value: "4.9/5", icon: "⭐", color: "blue" }
           ].map((stat, i) => (
             <article key={i} className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center text-2xl mb-4`}>
                   {stat.icon}
                </div>
                <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
             </article>
           ))}
        </section>

        {/* Engagement Graph Placeholder */}
        <article className="bg-white dark:bg-[#1e1e1e] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
           <div className="flex justify-between items-center mb-12">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Engagement Over Time</h3>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400">Weekly</button>
                 <button className="px-4 py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white">Monthly</button>
              </div>
           </div>
           <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-gray-50 dark:border-gray-800">
              {data?.monthlyEngagement?.map((m, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-blue-100 dark:bg-blue-900/20 rounded-t-xl hover:bg-blue-600 transition-all duration-500 cursor-pointer group relative"
                  style={{ height: `${Math.max((m.count / (Math.max(...data.monthlyEngagement.map(x => x.count)) || 1)) * 100, 5)}%` }}
                >
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {m.count} Students
                   </div>
                </div>
              ))}
           </div>
           <div className="flex justify-between mt-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {data?.monthlyEngagement?.filter((_, i) => i % 3 === 0).map((m, i) => (
                <span key={i}>{m.month}</span>
              ))}
           </div>
        </article>

      </div>
    </SidebarLayout>
  );
};

export default TeacherAnalytics;
