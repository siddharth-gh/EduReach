import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import SidebarLayout from "../layouts/SidebarLayout";

const emptyCourseForm = {
  title: "",
  description: "",
  category: "General",
  level: "beginner",
};

const TeacherCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await API.get("/courses/teacher/my-courses");
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatusMessage("");
    try {
      if (editingCourseId) {
        await API.put(`/courses/${editingCourseId}`, courseForm);
        setStatusMessage("Course updated successfully.");
      } else {
        await API.post("/courses", courseForm);
        setStatusMessage("Course created successfully.");
      }
      setCourseForm(emptyCourseForm);
      setEditingCourseId(null);
      await fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save course");
    }
  };

  const startEdit = (course) => {
    setEditingCourseId(course._id);
    setCourseForm({
      title: course.title,
      description: course.description,
      category: course.category || "General",
      level: course.level || "beginner",
    });
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    setError("");
    setStatusMessage("");
    try {
      await API.delete(`/courses/${courseId}`);
      setStatusMessage("Course deleted successfully.");
      await fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  return (
    <SidebarLayout>
      <div className="p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h2>
             <p className="text-gray-500 dark:text-gray-400">Manage and build your curriculum.</p>
          </div>
          {!editingCourseId && (
             <button 
               onClick={() => document.getElementById('course-form').scrollIntoView({ behavior: 'smooth' })}
               className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
             >
                + Create New
             </button>
          )}
        </header>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm dark:bg-red-900/20 dark:border-red-900/50">{error}</div>}
        {statusMessage && <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm dark:bg-green-900/20 dark:border-green-900/50">{statusMessage}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           {/* Form Section */}
           <div className="xl:col-span-1" id="course-form">
              <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all sticky top-8">
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    {editingCourseId ? "Edit Course" : "Create New Course"}
                 </h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Title</label>
                       <input
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="e.g. Master React in 30 Days"
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                       <textarea
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                          placeholder="What will students learn?"
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                          <select
                             className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                             value={courseForm.category}
                             onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                          >
                             <option value="General">General</option>
                             <option value="Programming">Programming</option>
                             <option value="Science">Science</option>
                             <option value="Mathematics">Mathematics</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Level</label>
                          <select
                             className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-black/20 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                             value={courseForm.level}
                             onChange={(e) => setCourseForm({...courseForm, level: e.target.value})}
                          >
                             <option value="beginner">Beginner</option>
                             <option value="intermediate">Intermediate</option>
                             <option value="advanced">Advanced</option>
                          </select>
                       </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all mt-4">
                       {editingCourseId ? "Update Course" : "Create Course"}
                    </button>
                    {editingCourseId && (
                       <button type="button" onClick={() => {setEditingCourseId(null); setCourseForm(emptyCourseForm);}} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold py-3 rounded-xl transition-all">
                          Cancel Edit
                       </button>
                    )}
                 </form>
              </div>
           </div>

           {/* List Section */}
           <div className="xl:col-span-2 space-y-6">
              {loading ? (
                 <div className="text-center py-20 text-gray-400">Loading courses...</div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                       <div key={course._id} className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm group hover:shadow-md transition-all flex flex-col">
                          <div className="flex-1">
                             <div className="flex gap-2 mb-4">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold rounded-full uppercase tracking-wider">{course.category || "General"}</span>
                             </div>
                             <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{course.title}</h4>
                             <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6">{course.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50 dark:border-gray-800">
                             <Link to={`/teacher/courses/${course._id}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl text-center transition-colors">Manage</Link>
                             <button onClick={() => startEdit(course)} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 p-3 rounded-xl hover:text-blue-600 transition-colors">✏️</button>
                             <button onClick={() => handleDelete(course._id)} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 p-3 rounded-xl hover:text-red-600 transition-colors">🗑️</button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
              {!loading && courses.length === 0 && (
                 <div className="bg-gray-50 dark:bg-gray-900/30 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-20 text-center text-gray-500">
                    No courses found. Create your first one to get started!
                 </div>
              )}
           </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default TeacherCourses;
