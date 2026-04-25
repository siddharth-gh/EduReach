import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import SidebarLayout from "../layouts/SidebarLayout";

const emptyModuleForm = { title: "", order: 1 };
const emptyLectureForm = {
  title: "",
  order: 1,
  mediaType: "none",
  textContent: "",
  imageUrl: "",
  imagePublicLabel: "",
  imageFileName: "",
  imageOriginalSize: 0,
  imageOptimizedSize: 0,
  imageIsOptimized: false,
  videoUrl: "",
  videoOptimizedUrl: "",
  videoAudioOnlyUrl: "",
  videoThumbnailUrl: "",
  videoPublicLabel: "",
  videoFileName: "",
  videoSelectedSize: 0,
  videoCodec: "",
  videoDuration: 0,
  videoOriginalSize: 0,
  videoOptimizedSize: 0,
  videoAudioOnlySize: 0,
  videoLowBandwidthOptimized: false,
  transcriptText: "",
  transcriptSource: "",
  resourceTitle: "",
  resourceUrl: "",
  resourceType: "pdf",
  resourcePublicLabel: "",
  resourceFileName: "",
  resourceExtractedText: "",
  resourceOriginalSize: 0,
  resourceOptimizedSize: 0,
  resourceIsOptimized: false,
};
const emptyQuizForm = {
  title: "",
  description: "",
  passingScore: 50,
  timeLimitMinutes: 0,
  questions: [
    {
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: 0,
      explanation: "",
    },
  ],
};

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const TeacherCourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lecturesByModule, setLecturesByModule] = useState({});
  const [quizzesByModule, setQuizzesByModule] = useState({});
  const [attemptsByQuiz, setAttemptsByQuiz] = useState({});
  const [moduleForm, setModuleForm] = useState(emptyModuleForm);
  const [lectureForms, setLectureForms] = useState({});
  const [quizForms, setQuizForms] = useState({});
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingLectureId, setEditingLectureId] = useState(null);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [uploadStatusByModule, setUploadStatusByModule] = useState({});
  const [uploadProgressByModule, setUploadProgressByModule] = useState({});
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const videoPollingRefs = useRef({});

  const stopVideoPolling = (moduleId) => {
    if (videoPollingRefs.current[moduleId]) {
      clearInterval(videoPollingRefs.current[moduleId]);
      delete videoPollingRefs.current[moduleId];
    }
  };

  const buildLecturePayload = (form, moduleId) => {
    const contents = [];
    const mediaType = form.mediaType || "none";
    if (form.textContent.trim()) contents.push({ type: "text", data: form.textContent.trim(), order: 1 });
    if (mediaType === "image" && form.imageUrl.trim()) contents.push({ type: "image", url: form.imageUrl.trim(), originalSize: Number(form.imageOriginalSize) || 0, optimizedSize: Number(form.imageOptimizedSize) || 0, isOptimized: Boolean(form.imageIsOptimized), order: contents.length + 1 });
    if (mediaType === "video" && form.videoUrl.trim()) contents.push({ type: "video", url: form.videoUrl.trim(), optimizedUrl: form.videoOptimizedUrl.trim(), audioOnlyUrl: form.videoAudioOnlyUrl.trim(), thumbnailUrl: form.videoThumbnailUrl.trim(), codec: form.videoCodec || "", duration: Number(form.videoDuration) || 0, originalSize: Number(form.videoOriginalSize) || 0, optimizedSize: Number(form.videoOptimizedSize) || 0, audioOnlySize: Number(form.videoAudioOnlySize) || 0, isLowBandwidthOptimized: Boolean(form.videoLowBandwidthOptimized), order: contents.length + 1 });
    return {
      moduleId, title: form.title, order: Number(form.order), contents,
      transcript: { text: mediaType === "video" ? form.transcriptText.trim() : "", source: (mediaType === "video" && form.transcriptText.trim()) ? form.transcriptSource || "manual" : "" },
      resources: (mediaType === "pdf" && form.resourceTitle.trim() && form.resourceUrl.trim()) ? [{ title: form.resourceTitle.trim(), url: form.resourceUrl.trim(), type: form.resourceType || "pdf", originalFilename: form.resourceFileName || "", extractedText: form.resourceExtractedText || "", originalSize: Number(form.resourceOriginalSize) || 0, optimizedSize: Number(form.resourceOptimizedSize) || 0, isOptimized: Boolean(form.resourceIsOptimized) }] : []
    };
  };

  const hydrateLectureForm = (lecture) => {
    const textItem = lecture.contents?.find((item) => item.type === "text");
    const imageItem = lecture.contents?.find((item) => item.type === "image");
    const videoItem = lecture.contents?.find((item) => item.type === "video");
    return {
      ...emptyLectureForm,
      title: lecture.title,
      order: lecture.order,
      mediaType: imageItem ? "image" : videoItem ? "video" : lecture.resources?.[0] ? "pdf" : "none",
      textContent: textItem?.data || "",
      imageUrl: imageItem?.url || "",
      imageOriginalSize: imageItem?.originalSize || 0,
      imageOptimizedSize: imageItem?.optimizedSize || 0,
      imageIsOptimized: Boolean(imageItem?.isOptimized),
      videoUrl: videoItem?.url || "",
      videoOptimizedUrl: videoItem?.optimizedUrl || "",
      videoAudioOnlyUrl: videoItem?.audioOnlyUrl || "",
      videoThumbnailUrl: videoItem?.thumbnailUrl || "",
      videoPublicLabel: videoItem?.url ? "Video attached" : "",
      videoCodec: videoItem?.codec || "",
      videoDuration: videoItem?.duration || 0,
      videoOriginalSize: videoItem?.originalSize || 0,
      videoOptimizedSize: videoItem?.optimizedSize || 0,
      videoAudioOnlySize: videoItem?.audioOnlySize || 0,
      videoLowBandwidthOptimized: Boolean(videoItem?.isLowBandwidthOptimized),
      transcriptText: lecture.transcript?.text || "",
      transcriptSource: lecture.transcript?.source || "",
      resourceTitle: lecture.resources?.[0]?.title || "",
      resourceUrl: lecture.resources?.[0]?.url || "",
      resourceType: lecture.resources?.[0]?.type || "pdf",
      resourceExtractedText: lecture.resources?.[0]?.extractedText || "",
      resourceOriginalSize: lecture.resources?.[0]?.originalSize || 0,
      resourceOptimizedSize: lecture.resources?.[0]?.optimizedSize || 0,
      resourceIsOptimized: Boolean(lecture.resources?.[0]?.isOptimized),
    };
  };

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const [courseRes, modulesRes] = await Promise.all([API.get(`/courses/${courseId}`), API.get(`/modules/${courseId}`)]);
      setCourse(courseRes.data);
      setModules(modulesRes.data);
      const lecEntries = await Promise.all(modulesRes.data.map(async (m) => [m._id, (await API.get(`/lectures/${m._id}`)).data]));
      const quizEntries = await Promise.all(modulesRes.data.map(async (m) => [m._id, (await API.get(`/quizzes/module/${m._id}`)).data]));
      setLecturesByModule(Object.fromEntries(lecEntries));
      setQuizzesByModule(Object.fromEntries(quizEntries));
      const flattenedQuizzes = quizEntries.flatMap(([, items]) => items);
      const attemptEntries = await Promise.all(flattenedQuizzes.map(async (q) => [q._id, (await API.get(`/quiz-attempts/quiz/${q._id}`)).data]));
      setAttemptsByQuiz(Object.fromEntries(attemptEntries));
    } catch { setError("Failed to load course builder"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourseData(); }, [courseId]);
  
  const startModuleEdit = (m) => {
    setModuleForm({ title: m.title, order: m.order });
    setEditingModuleId(m._id);
    // Scroll to the add module form
    document.querySelector('aside')?.scrollIntoView({ behavior: 'smooth' });
  };

  const updateLectureForm = (moduleId, field, value) => {
    setLectureForms(curr => ({
      ...curr,
      [moduleId]: {
        ...(curr[moduleId] || emptyLectureForm),
        [field]: value
      }
    }));
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingModuleId) await API.put(`/modules/${editingModuleId}`, moduleForm);
      else await API.post("/modules", { ...moduleForm, courseId });
      setModuleForm(emptyModuleForm);
      setEditingModuleId(null);
      await fetchCourseData();
    } catch { setError("Failed to save module"); }
  };

  const uploadLectureAsset = async (moduleId, file, type) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploadStatusByModule(curr => ({ ...curr, [moduleId]: "Uploading..." }));
    try {
      const endpoint = type === "image" ? "/uploads/image" : type === "video" ? "/uploads/video" : "/uploads/resource";
      const res = await API.post(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
      const data = res.data;
      setLectureForms(curr => {
        const form = curr[moduleId] || emptyLectureForm;
        if (type === "video") return { ...curr, [moduleId]: { ...form, videoUrl: data.url, videoThumbnailUrl: data.thumbnailUrl, videoDuration: data.duration, videoOriginalSize: data.bytes } };
        if (type === "image") return { ...curr, [moduleId]: { ...form, imageUrl: data.url, imageOriginalSize: data.bytes } };
        return { ...curr, [moduleId]: { ...form, resourceUrl: data.url, resourceTitle: file.name, resourceOriginalSize: data.bytes } };
      });
      setUploadStatusByModule(curr => ({ ...curr, [moduleId]: "Ready!" }));
    } catch { setError("Upload failed"); }
  };

  const handleLectureSubmit = async (e, moduleId) => {
    e.preventDefault();
    const payload = buildLecturePayload(lectureForms[moduleId] || emptyLectureForm, moduleId);
    try {
      if (editingLectureId) await API.put(`/lectures/${editingLectureId}`, payload);
      else await API.post("/lectures", payload);
      setLectureForms(curr => ({ ...curr, [moduleId]: emptyLectureForm }));
      setEditingLectureId(null);
      await fetchCourseData();
    } catch { setError("Failed to save lecture"); }
  };

  if (loading) return <SidebarLayout><div className="p-10 animate-pulse"><div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl w-1/4 mb-8"></div><div className="h-96 bg-gray-100 dark:bg-gray-800/50 rounded-[40px]"></div></div></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="p-6 lg:p-10 space-y-10">
        
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-6">
           <div>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest mb-3 inline-block">Course Architect</span>
              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">{course?.title}</h1>
              <p className="text-gray-500 mt-2">Manage modules, lectures, and assessments.</p>
           </div>
           <div className="flex gap-3">
              <button onClick={() => navigate(`/course/${courseId}`)} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all">Preview Course</button>
           </div>
        </header>

        {error && <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-3xl text-red-600 font-bold">{error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
           
           {/* Sidebar Module Navigation / Fast Access */}
           <aside className="xl:col-span-1 space-y-6 sticky top-6">
              <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 p-8 shadow-xl shadow-blue-600/5">
                 <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Course Outline</h3>
                 <div className="space-y-2">
                    {modules.map((m) => (
                      <button key={m._id} onClick={() => document.getElementById(`module-${m._id}`).scrollIntoView({ behavior: 'smooth' })} className="w-full text-left p-4 rounded-2xl text-xs font-bold text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all flex items-center gap-3">
                         <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px]">{m.order}</span>
                         {m.title}
                      </button>
                    ))}
                    {modules.length === 0 && <p className="text-gray-400 italic text-sm">No modules created yet.</p>}
                 </div>
              </div>

              <div className="bg-blue-600 rounded-[40px] p-8 text-white shadow-2xl shadow-blue-600/20">
                 <h3 className="text-xl font-black mb-4">Add Module</h3>
                 <form onSubmit={handleModuleSubmit} className="space-y-4">
                    <input 
                      className="w-full bg-blue-500/50 border-none rounded-2xl p-4 text-sm font-bold placeholder-blue-200 focus:ring-2 focus:ring-white" 
                      placeholder="Module Title"
                      value={moduleForm.title}
                      onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                    />
                    <div className="flex gap-2">
                       <input 
                        type="number"
                        className="w-20 bg-blue-500/50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-white" 
                        value={moduleForm.order}
                        onChange={e => setModuleForm({ ...moduleForm, order: e.target.value })}
                       />
                       <button className="flex-1 bg-white text-blue-600 font-black rounded-2xl p-4 text-xs uppercase tracking-widest hover:bg-blue-50 transition-all">
                          {editingModuleId ? "Update" : "Create"}
                       </button>
                    </div>
                 </form>
              </div>
           </aside>

           {/* Main Module Editor Area */}
           <main className="xl:col-span-2 space-y-12">
              {modules.sort((a, b) => a.order - b.order).map((m) => (
                <section key={m._id} id={`module-${m._id}`} className="bg-white dark:bg-gray-900 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-blue-600/5 overflow-hidden transition-all hover:border-blue-500/30">
                   
                   {/* Module Banner */}
                   <div className="bg-gray-50 dark:bg-gray-800/50 p-8 lg:p-10 flex flex-wrap items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-2xl font-black">{m.order}</div>
                         <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{m.title}</h2>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Module Identity: {m._id.slice(-6)}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => startModuleEdit(m)} className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-xl hover:text-blue-600">Edit</button>
                         <button onClick={async () => { if(window.confirm('Delete module?')) { await API.delete(`/modules/${m._id}`); fetchCourseData(); } }} className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-xl hover:text-red-500">Delete</button>
                      </div>
                   </div>

                   <div className="p-8 lg:p-10 space-y-12">
                      
                      {/* Lectures Sub-list */}
                      <div>
                         <div className="flex items-center gap-4 mb-8">
                            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Lectures ({lecturesByModule[m._id]?.length || 0})</h4>
                            <div className="h-px flex-1 bg-gray-50 dark:bg-gray-800" />
                         </div>
                         <div className="grid grid-cols-1 gap-4 mb-8">
                            {lecturesByModule[m._id]?.map(l => (
                              <div key={l._id} className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 flex items-center justify-between group">
                                 <div className="flex items-center gap-4">
                                    <span className="text-2xl">📽️</span>
                                    <div>
                                       <p className="text-sm font-black text-gray-900 dark:text-white">{l.title}</p>
                                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Order: {l.order} | {l.contents?.length || 0} Assets</p>
                                    </div>
                                 </div>
                                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingLectureId(l._id); setLectureForms(curr => ({ ...curr, [m._id]: hydrateLectureForm(l) })); }} className="text-xs font-bold text-blue-600">Edit</button>
                                    <button onClick={async () => { if(window.confirm('Delete lecture?')) { await API.delete(`/lectures/${l._id}`); fetchCourseData(); } }} className="text-xs font-bold text-red-500 ml-4">Delete</button>
                                 </div>
                              </div>
                            ))}
                            {(!lecturesByModule[m._id] || lecturesByModule[m._id].length === 0) && <p className="text-center py-8 text-gray-400 italic text-sm bg-gray-50/50 dark:bg-gray-800/10 rounded-3xl">No lectures added to this module yet.</p>}
                         </div>

                         {/* Add Lecture Form (Nested) */}
                         <div className="bg-white dark:bg-gray-900 border border-blue-500/20 rounded-[40px] p-8 shadow-2xl shadow-blue-600/5">
                            <h5 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                               <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">+</span>
                               {editingLectureId ? "Edit Lecture" : "Add New Lecture"}
                            </h5>
                            <form onSubmit={e => handleLectureSubmit(e, m._id)} className="space-y-6">
                               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div className="md:col-span-3">
                                     <input 
                                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-sm font-bold placeholder-gray-400 focus:ring-2 focus:ring-blue-500" 
                                      placeholder="Lecture Title"
                                      value={lectureForms[m._id]?.title || ""}
                                      onChange={e => updateLectureForm(m._id, 'title', e.target.value)}
                                     />
                                  </div>
                                  <div className="md:col-span-1">
                                     <input 
                                      type="number"
                                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none text-sm font-bold focus:ring-2 focus:ring-blue-500" 
                                      placeholder="Order"
                                      value={lectureForms[m._id]?.order || 1}
                                      onChange={e => updateLectureForm(m._id, 'order', e.target.value)}
                                     />
                                  </div>
                               </div>

                               <textarea 
                                className="w-full p-6 rounded-3xl bg-gray-50 dark:bg-gray-800 border-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                                placeholder="Text content (optional)"
                                rows={3}
                                value={lectureForms[m._id]?.textContent || ""}
                                onChange={e => updateLectureForm(m._id, 'textContent', e.target.value)}
                               />

                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="p-6 rounded-3xl bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Video Asset (Recommended)</p>
                                     <input 
                                      type="file" accept="video/*" 
                                      className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                      onChange={e => uploadLectureAsset(m._id, e.target.files[0], 'video')}
                                     />
                                     {lectureForms[m._id]?.videoUrl && <p className="mt-4 text-[10px] font-bold text-green-600 uppercase">✓ Video Attached ({formatFileSize(lectureForms[m._id].videoOriginalSize)})</p>}
                                  </div>
                                  <div className="p-6 rounded-3xl bg-purple-50/30 dark:bg-purple-900/10 border border-purple-100/50 dark:border-purple-900/20">
                                     <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-4">Supplementary PDF</p>
                                     <input 
                                      type="file" accept=".pdf" 
                                      className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                      onChange={e => uploadLectureAsset(m._id, e.target.files[0], 'pdf')}
                                     />
                                     {lectureForms[m._id]?.resourceUrl && <p className="mt-4 text-[10px] font-bold text-green-600 uppercase">✓ PDF Attached</p>}
                                  </div>
                               </div>

                               <div className="flex items-center justify-between pt-4">
                                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{uploadStatusByModule[m._id] || "All systems ready"}</div>
                                  <div className="flex gap-3">
                                     {editingLectureId && <button type="button" onClick={() => { setEditingLectureId(null); setLectureForms(curr => ({ ...curr, [m._id]: emptyLectureForm })); }} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold rounded-xl">Cancel</button>}
                                     <button type="submit" className="px-10 py-3 bg-blue-600 text-white text-xs font-black rounded-xl uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all hover:scale-105">
                                        {editingLectureId ? "Update Lecture" : "Save Lecture"}
                                     </button>
                                  </div>
                               </div>
                            </form>
                         </div>
                      </div>

                      {/* Quizzes Sub-list */}
                      <div>
                         <div className="flex items-center gap-4 mb-8">
                            <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest">Assessments ({quizzesByModule[m._id]?.length || 0})</h4>
                            <div className="h-px flex-1 bg-gray-50 dark:bg-gray-800" />
                         </div>
                         <div className="grid grid-cols-1 gap-4 mb-8">
                            {quizzesByModule[m._id]?.map(q => (
                              <div key={q._id} className="p-6 rounded-3xl bg-orange-50/20 dark:bg-orange-900/10 border border-orange-100/30 dark:border-orange-900/20 flex items-center justify-between group">
                                 <div className="flex items-center gap-4">
                                    <span className="text-2xl">📝</span>
                                    <div>
                                       <p className="text-sm font-black text-gray-900 dark:text-white">{q.title}</p>
                                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{q.questions?.length || 0} Questions | Passing: {q.passingScore}%</p>
                                    </div>
                                 </div>
                                 <button onClick={async () => { if(window.confirm('Delete quiz?')) { await API.delete(`/quizzes/${q._id}`); fetchCourseData(); } }} className="text-xs font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                              </div>
                            ))}
                            {(!quizzesByModule[m._id] || quizzesByModule[m._id].length === 0) && <p className="text-center py-8 text-gray-400 italic text-sm bg-orange-50/10 dark:bg-orange-900/5 rounded-3xl">No quizzes added yet.</p>}
                         </div>
                         <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quiz management is coming soon to the new builder UI.</p>
                         </div>
                      </div>

                   </div>
                </section>
              ))}

              {modules.length === 0 && (
                <div className="py-20 text-center bg-gray-50 dark:bg-gray-900/50 rounded-[64px] border-2 border-dashed border-gray-200 dark:border-gray-800">
                   <div className="text-6xl mb-6 opacity-20">🏗️</div>
                   <h3 className="text-2xl font-black text-gray-400">Your course is empty</h3>
                   <p className="text-gray-500 mt-2">Start by creating your first module using the blue card on the left.</p>
                </div>
              )}
           </main>

        </div>
      </div>
    </SidebarLayout>
  );
};

export default TeacherCourseBuilder;
