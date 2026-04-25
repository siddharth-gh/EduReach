import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import AppShell from "../layouts/AppShell";

const CertificatePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await API.get(`/achievements/certificate/${courseId}`);
        setCertificate(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load certificate");
      }
    };
    fetchCertificate();
  }, [courseId]);

  if (!certificate) return <AppShell><div className="max-w-4xl mx-auto px-4 py-20 animate-pulse"><div className="h-[600px] bg-gray-100 dark:bg-gray-800 rounded-[64px]"></div></div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        <button onClick={() => navigate(-1)} className="mb-10 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
           ← Back to Dashboard
        </button>

        <div className="relative bg-white dark:bg-gray-900 border-[16px] border-gray-100 dark:border-gray-800 rounded-[64px] p-10 lg:p-24 shadow-2xl shadow-blue-600/10 text-center overflow-hidden">
           {/* Decorative elements */}
           <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
           
           <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-5xl mb-12 shadow-xl shadow-blue-600/30">
                 🎓
              </div>

              <span className="px-6 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full uppercase tracking-[0.2em] mb-8">
                 Certificate of Completion
              </span>

              <p className="text-gray-400 font-medium mb-4 italic">This is to certify that</p>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white mb-10 tracking-tight">
                 {certificate.student.name}
              </h1>

              <div className="w-24 h-px bg-gray-200 dark:bg-gray-800 mb-10" />

              <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">
                 has successfully completed all requirements for the course
              </p>
              <h2 className="text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-500 mb-16 px-10">
                 {certificate.course.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-2xl text-left border-t border-gray-50 dark:border-gray-800 pt-16">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Instructor</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{certificate.course.teacherName}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date Awarded</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date(certificate.completedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                 </div>
              </div>

              <div className="mt-24 pt-10 border-t border-gray-50 dark:border-gray-800 w-full flex justify-center">
                 <div className="flex flex-col items-center opacity-30">
                    <div className="w-16 h-16 border-4 border-gray-400 rounded-full flex items-center justify-center font-black text-gray-400 text-xl">ER</div>
                    <p className="text-[8px] font-black uppercase tracking-widest mt-2">EduReach Official</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-12 flex justify-center gap-4 no-print">
           <button onClick={() => window.print()} className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl transition-all transform hover:-translate-y-1">
              Download as PDF
           </button>
           <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all">
              Return to Portal
           </button>
        </div>
      </div>
    </AppShell>
  );
};

export default CertificatePage;
