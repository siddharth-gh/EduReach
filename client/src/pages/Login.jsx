import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-md">
           <div className="text-center mb-4">
              <Link to="/" className="text-2xl font-black text-gray-900 dark:text-white mb-1 inline-block">
                <span className="text-blue-600">Edu</span>Reach
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs">Please sign in to your account</p>
           </div>

           <div className="bg-white dark:bg-gray-900 p-8 lg:p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-blue-600/5">
              <form onSubmit={handleSubmit} className="space-y-6">
                 {error && (
                   <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-xs font-bold text-center">
                      {error}
                   </div>
                 )}
                 
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="teacher@edureach.edu"
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                 </div>

                 <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1"
                 >
                   {loading ? "Authenticating..." : t("auth.login")}
                 </button>
              </form>

              <div className="mt-6 text-center border-t border-gray-50 dark:border-gray-800 pt-6">
                 <p className="text-xs text-gray-500 dark:text-gray-400">
                    Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create one</Link>
                 </p>
              </div>
           </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Login;
