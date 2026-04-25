import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password, role);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t("auth.signupFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
           <div className="text-center mb-6">
              <Link to="/" className="text-3xl font-black text-gray-900 dark:text-white mb-2 inline-block">
                <span className="text-blue-600">Edu</span>Reach
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Join EduReach</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Create your account to start learning</p>
           </div>

           <div className="bg-white dark:bg-gray-900 p-8 lg:p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-blue-600/5">
              <form onSubmit={handleSubmit} className="space-y-5">
                 {error && (
                   <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-xs font-bold text-center">
                      {error}
                   </div>
                 )}
                 
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Account Type</label>
                    <div className="grid grid-cols-2 gap-3 p-1 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                       <button 
                        type="button" 
                        onClick={() => setRole('student')}
                        className={`py-1.5 text-xs font-bold rounded-xl transition-all ${role === 'student' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}
                       >
                         Student
                       </button>
                       <button 
                        type="button" 
                        onClick={() => setRole('teacher')}
                        className={`py-1.5 text-xs font-bold rounded-xl transition-all ${role === 'teacher' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}
                       >
                         Teacher
                       </button>
                    </div>
                 </div>

                 <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1 mt-2"
                 >
                   {loading ? "Creating Account..." : t("auth.signup")}
                 </button>
              </form>

              <div className="mt-6 text-center border-t border-gray-50 dark:border-gray-800 pt-6">
                 <p className="text-xs text-gray-500 dark:text-gray-400">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
                 </p>
              </div>
           </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Signup;
