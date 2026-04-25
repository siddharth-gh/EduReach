import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const Profile = () => {
  const { t } = useTranslation();
  const { user, setCurrentUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [preferredMode, setPreferredMode] = useState(user?.preferredMode || "normal");
  const [achievements, setAchievements] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hydrateProfile = async () => {
      try {
        const response = await API.get("/auth/me");
        setCurrentUser(response.data);
        setName(response.data.name || "");
        setBio(response.data.bio || "");
        setPreferredMode(response.data.preferredMode || "normal");
      } catch {
        return;
      }
    };
    const fetchAchievements = async () => {
      try {
        const response = await API.get("/achievements/me");
        setAchievements(response.data);
      } catch {
        setAchievements([]);
      }
    };
    hydrateProfile();
    if (user?.role === "student") fetchAchievements();
  }, [setCurrentUser, user?.role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatusMessage("");
    setLoading(true);
    try {
      const response = await API.put("/auth/profile", { name, bio, preferredMode });
      setCurrentUser(response.data);
      setStatusMessage(t("profile.updateSuccess"));
    } catch (err) {
      setError(err.response?.data?.message || t("profile.updateError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-12 lg:py-20">
         <div className="bg-white dark:bg-gray-900 rounded-[48px] border border-gray-100 dark:border-gray-800 p-8 lg:p-16 shadow-2xl shadow-blue-600/5 transition-colors duration-200">
            
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-gray-50 dark:border-gray-800">
               <div>
                  <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">{t("profile.title")}</span>
                  <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mt-2 leading-tight">{user?.email}</h1>
                  <div className="flex gap-4 mt-4">
                     <span className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-400 text-[10px] font-black rounded-full uppercase tracking-widest">{t("profile.role")}: {user?.role}</span>
                     {user?.role === "student" && (
                       <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                         🔥 {user?.streakCount ?? 0} {t("dashboard.day")}{(user?.streakCount ?? 0) === 1 ? "" : "s"} Streak
                       </span>
                     )}
                  </div>
               </div>
               <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl text-white font-black uppercase shadow-xl shadow-blue-600/20">
                  {user?.name?.charAt(0) || user?.email?.charAt(0)}
               </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               {/* Form Section */}
               <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Account Details</h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                     {error && <p className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl text-xs font-bold">{error}</p>}
                     {statusMessage && <p className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl text-xs font-bold">{statusMessage}</p>}
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                           <input
                             className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                             value={name}
                             onChange={(e) => setName(e.target.value)}
                             placeholder={t("profile.yourName")}
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Preferred Mode</label>
                           <select
                             className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-700 dark:text-gray-300 font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                             value={preferredMode}
                             onChange={(e) => setPreferredMode(e.target.value)}
                           >
                             <option value="normal">{t("profile.normalMode")}</option>
                             <option value="low-bandwidth">{t("profile.lowBandwidthMode")}</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Short Bio</label>
                        <textarea
                          className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                          rows={4}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder={t("profile.shortBio")}
                        />
                     </div>

                     <button type="submit" disabled={loading} className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1">
                        {loading ? "Saving..." : t("profile.save")}
                     </button>
                  </form>
               </div>

               {/* Achievements Sidebar */}
               {user?.role === "student" && (
                 <div className="lg:col-span-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">{t("profile.achievements")}</h3>
                    <div className="space-y-4">
                       {achievements.length === 0 ? (
                         <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-center text-gray-400 italic text-sm">
                            No achievements yet. Start learning!
                         </div>
                       ) : (
                         achievements.map((a) => (
                           <div key={a._id} className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-start gap-4 group hover:border-blue-500 transition-all">
                              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">🏅</div>
                              <div>
                                 <p className="text-sm font-bold text-gray-900 dark:text-white">{a.title}</p>
                                 <p className="text-[10px] text-gray-400 uppercase font-black mt-1">{a.type}</p>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </AppShell>
  );
};

export default Profile;
