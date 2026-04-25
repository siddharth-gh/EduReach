import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import SidebarLayout from "../layouts/SidebarLayout";

const TeacherProfile = () => {
  const { user, setCurrentUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
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
      } catch (err) {
        console.error("Failed to hydrate profile");
      }
    };
    hydrateProfile();
  }, [setCurrentUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatusMessage("");
    setLoading(true);
    try {
      const response = await API.put("/auth/profile", { name, bio });
      setCurrentUser(response.data);
      setStatusMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-12">
        <header>
           <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
           <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your public instructor identity.</p>
        </header>

        <div className="bg-white dark:bg-[#1e1e1e] p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
           
           <div className="flex items-center gap-8 pb-10 border-b border-gray-50 dark:border-gray-800 mb-10">
              <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-3xl text-white font-bold shadow-xl shadow-blue-600/20">
                 {user?.name?.charAt(0) || "T"}
              </div>
              <div>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                 <p className="text-gray-400 font-medium uppercase text-xs tracking-widest mt-1">{user?.role} Portal • {user?.email}</p>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-8">
              {error && <div className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 rounded-2xl text-xs font-bold">{error}</div>}
              {statusMessage && <div className="p-5 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 text-green-600 rounded-2xl text-xs font-bold">{statusMessage}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
                    <input 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your professional name"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-none text-gray-400 cursor-not-allowed"
                      value={user?.email}
                      disabled
                    />
                    <p className="text-[10px] text-gray-400 italic ml-1">Email cannot be changed.</p>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Instructor Bio</label>
                 <textarea 
                   className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                   rows={5}
                   value={bio}
                   onChange={(e) => setBio(e.target.value)}
                   placeholder="Share your experience and teaching philosophy..."
                 />
              </div>

              <div className="pt-4 flex justify-end">
                 <button 
                  type="submit" 
                  disabled={loading}
                  className="px-12 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-2xl shadow-gray-900/20 hover:scale-105 transition-all"
                 >
                    {loading ? "Saving Changes..." : "Save Profile"}
                 </button>
              </div>
           </form>
        </div>

        {/* Account Status / Security Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Account Type</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">Verified Instructor</p>
           </div>
           <div className="p-8 bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Member Since</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{new Date(user?.createdAt).toLocaleDateString()}</p>
           </div>
           <div className="p-8 bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Security</p>
              <p className="text-xl font-bold text-blue-600">Password Active</p>
           </div>
        </section>

      </div>
    </SidebarLayout>
  );
};

export default TeacherProfile;
