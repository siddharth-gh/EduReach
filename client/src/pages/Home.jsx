import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import AppShell from "../layouts/AppShell";
import CourseCard from "../components/CourseCard";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await API.get("/courses");
        setPopularCourses(response.data.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <AppShell>
      <div className="bg-[#f8f9fa] dark:bg-[#0b0e14] min-h-screen font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
        
        {/* Navigation / Header - Integrated style */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 text-center lg:text-left">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-10">
                 <div className="space-y-4">
                    <h2 className="text-blue-600 dark:text-blue-500 font-bold tracking-widest text-sm uppercase">Revolutionizing Rural Education</h2>
                    <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1]">
                       The Future of Learning <br /> is <span className="italic underline decoration-blue-500 underline-offset-8">Intelligent.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                       EduReach brings AI-powered lectures, offline accessibility, and real-time interaction to students everywhere. No boundaries, just knowledge.
                    </p>
                 </div>

                 <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5">
                    <button 
                      onClick={() => navigate('/courses')}
                      className="px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-full hover:scale-105 transition-all shadow-2xl shadow-gray-900/20"
                    >
                       Explore Courses
                    </button>
                    <button 
                      onClick={() => navigate('/signup')}
                      className="px-10 py-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all"
                    >
                       Join as Teacher
                    </button>
                 </div>

                 <div className="flex items-center justify-center lg:justify-start gap-12 pt-6">
                    <div>
                       <p className="text-2xl font-bold text-gray-900 dark:text-white">10k+</p>
                       <p className="text-sm text-gray-500 uppercase tracking-tighter">Students</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
                    <div>
                       <p className="text-2xl font-bold text-gray-900 dark:text-white">500+</p>
                       <p className="text-sm text-gray-500 uppercase tracking-tighter">Courses</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
                    <div>
                       <p className="text-2xl font-bold text-gray-900 dark:text-white">98%</p>
                       <p className="text-sm text-gray-500 uppercase tracking-tighter">Satisfaction</p>
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-5 relative">
                 <div className="relative rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800">
                    <img 
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200" 
                      alt="Modern Learning" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                 </div>
                 
                 {/* Product Badge */}
                 <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-2xl border border-gray-50 dark:border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">A</div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Powered by</p>
                       <p className="text-sm font-bold text-gray-900 dark:text-white">EduReach AI</p>
                    </div>
                 </div>
              </div>

           </div>
        </div>

        {/* Feature Bento Grid */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-8 bg-white dark:bg-gray-900 p-12 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                 <div className="space-y-4 max-w-md">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">Artificial Intelligence that understands you.</h3>
                    <p className="text-gray-500 dark:text-gray-400">Our proprietary models generate personalized summaries, adaptive quizzes, and transcripts for every single lecture.</p>
                 </div>
                 <div className="mt-12 flex gap-4 overflow-hidden py-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex-shrink-0 w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700" />
                    ))}
                 </div>
              </div>

              <div className="md:col-span-4 bg-blue-600 p-12 rounded-[3rem] text-white flex flex-col justify-between overflow-hidden relative">
                 <div className="relative z-10 space-y-4">
                    <h3 className="text-3xl font-bold leading-tight">Learn without Internet.</h3>
                    <p className="text-blue-100 opacity-80">Download full courses including videos, notes, and quizzes to your local device.</p>
                 </div>
                 <div className="mt-8 text-7xl opacity-20 font-bold self-end relative z-10">
                    📂
                 </div>
                 <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-12 translate-y-12 blur-3xl" />
              </div>

              <div className="md:col-span-4 bg-gray-900 dark:bg-gray-800 p-10 rounded-[3rem] text-white space-y-4">
                 <h3 className="text-2xl font-bold">Live Interaction</h3>
                 <p className="text-gray-400 text-sm">Join real-time classrooms with optimized low-latency streaming for rural areas.</p>
                 <div className="pt-6">
                    <button className="text-blue-400 text-sm font-bold hover:underline">Join a session →</button>
                 </div>
              </div>

              <div className="md:col-span-8 bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-8">
                 <div className="hidden sm:block w-32 h-32 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-5xl">🏆</div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Earn Certifications</h3>
                    <p className="text-gray-500 dark:text-gray-400">Complete courses and assessments to receive professional certificates recognized by top institutions.</p>
                 </div>
              </div>

           </div>
        </section>

        {/* Trending Section */}
        <section className="py-24 bg-white dark:bg-gray-950">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between gap-6 mb-16">
                 <div className="space-y-4">
                    <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white">Pick up where <br /> others started.</h2>
                    <p className="text-gray-500 max-w-sm">Join a community of learners mastering the skills of tomorrow, today.</p>
                 </div>
                 <Link to="/courses" className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-full hover:bg-gray-200 transition-all text-sm">
                    Browse All
                 </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {loading ? (
                   [1,2,3,4].map(i => <div key={i} className="h-80 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] animate-pulse" />)
                 ) : (
                   popularCourses.map(course => (
                     <CourseCard key={course._id} course={course} />
                   ))
                 )}
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-100 dark:border-gray-900">
           <div className="flex flex-wrap justify-between items-center gap-8">
              <div className="text-xl font-bold">
                 <span className="text-blue-600">Edu</span>Reach
              </div>
              <div className="flex gap-10 text-sm font-medium text-gray-500">
                 <Link to="/courses" className="hover:text-gray-900 dark:hover:text-white transition-colors">Courses</Link>
                 <Link to="/offline" className="hover:text-gray-900 dark:hover:text-white transition-colors">Offline</Link>
                 <Link to="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">About</Link>
                 <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</Link>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                 © 2026 EduReach Platform
              </div>
           </div>
        </footer>

      </div>
    </AppShell>
  );
};

export default Home;
