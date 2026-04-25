import { useEffect, useState } from "react";
import API from "../api/api";
import SidebarLayout from "../layouts/SidebarLayout";

const TeacherStudents = () => {
  const [courseGroups, setCourseGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await API.get("/analytics/teacher/students");
        setCourseGroups(response.data);
      } catch (err) {
        setError("Failed to load student directory");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredGroups = courseGroups.map(group => ({
    ...group,
    students: group.students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.students.length > 0);

  return (
    <SidebarLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-12">
        <header className="flex flex-wrap justify-between items-end gap-8">
           <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Class Rosters</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your students grouped by their enrolled courses.</p>
           </div>
           <div className="w-full md:w-96">
              <div className="relative group">
                 <input 
                   type="text" 
                   placeholder="Search students by name or email..."
                   className="w-full px-7 py-4 rounded-[2rem] bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm group-hover:border-blue-500/50"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl grayscale opacity-30">🔍</span>
              </div>
           </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
             <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Organizing Class Data...</p>
          </div>
        ) : error ? (
           <div className="p-10 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[3rem] text-red-600 font-bold text-center">
              {error}
           </div>
        ) : (
           <div className="space-y-16">
              {filteredGroups.map((group) => (
                <section key={group.courseId} className="space-y-8">
                   <div className="flex items-center gap-4 px-4">
                      <div className="h-2 w-2 bg-blue-600 rounded-full" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{group.title}</h3>
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                         {group.students.length} {group.students.length === 1 ? 'Learner' : 'Learners'}
                      </span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {group.students.map((student) => (
                        <article key={student.studentId} className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-blue-600/5 transition-all group overflow-hidden relative">
                           <div className="flex items-center gap-6 mb-8 relative z-10">
                              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-600/20">
                                 {student.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">{student.name}</h4>
                                 <p className="text-xs text-gray-400 truncate font-medium">{student.email}</p>
                              </div>
                           </div>

                           <div className="space-y-6 relative z-10">
                              <div className="space-y-2">
                                 <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    <span>Course Progress</span>
                                    <span className="text-blue-600">{student.progressPercent}%</span>
                                 </div>
                                 <div className="h-2 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                                      style={{ width: `${student.progressPercent}%` }}
                                    />
                                 </div>
                              </div>

                              <div className="flex justify-between items-center py-4 px-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                 <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className={`text-xs font-bold uppercase ${student.status === 'active' ? 'text-green-600' : 'text-orange-500'}`}>{student.status}</p>
                                 </div>
                                 <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                                 <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Enrolled</p>
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{new Date(student.enrolledAt).toLocaleDateString()}</p>
                                 </div>
                              </div>
                           </div>
                           
                           {/* Subtle Background Accent */}
                           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:bg-blue-600/10 transition-colors" />
                        </article>
                      ))}
                   </div>
                </section>
              ))}

              {filteredGroups.length === 0 && (
                <div className="py-32 text-center bg-gray-50 dark:bg-[#1e1e1e] rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
                   <p className="text-gray-400 font-bold uppercase tracking-widest italic">No students found in your records</p>
                </div>
              )}
           </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default TeacherStudents;
