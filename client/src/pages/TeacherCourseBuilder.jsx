import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import SidebarLayout from "../layouts/SidebarLayout";

const TeacherCourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lecturesByModule, setLecturesByModule] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: "", order: 1 });
  const [editingLectureId, setEditingLectureId] = useState(null);
  
  const emptyLectureForm = {
    title: "",
    order: 1,
    mediaType: "none", // 'none', 'video', 'image', 'pdf'
    textContent: "",
    imageUrl: "",
    imageOriginalSize: 0,
    imageOptimizedSize: 0,
    imageIsOptimized: false,
    videoUrl: "",
    videoOptimizedUrl: "",
    videoAudioOnlyUrl: "",
    videoThumbnailUrl: "",
    videoCodec: "",
    videoDuration: 0,
    videoOriginalSize: 0,
    videoOptimizedSize: 0,
    videoAudioOnlySize: 0,
    videoLowBandwidthOptimized: false,
    transcriptText: "",
    transcriptSource: "whisper",
    resourceUrl: "",
    resourceTitle: "",
    resourceType: "pdf",
    resourceFileName: "",
    resourceExtractedText: "",
    resourceOriginalSize: 0,
    resourceOptimizedSize: 0,
    resourceIsOptimized: false
  };

  const [lectureForms, setLectureForms] = useState({});
  const [activePolls, setActivePolls] = useState({});
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [uploadStatusByModule, setUploadStatusByModule] = useState({});
  const [uploadProgressByModule, setUploadProgressByModule] = useState({});
  const [uploadMessageByModule, setUploadMessageByModule] = useState({});
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCourseData = useCallback(async () => {
    try {
      const res = await API.get(`/courses/${courseId}`);
      setCourse(res.data);
      const modRes = await API.get(`/modules/${courseId}`);
      setModules(modRes.data);
      
      const lectureMap = {};
      for (const m of modRes.data) {
        const lecRes = await API.get(`/lectures/${m._id}`);
        lectureMap[m._id] = lecRes.data;
      }
      setLecturesByModule(lectureMap);
    } catch (err) {
      setError("Failed to load course data");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const stopVideoPolling = (moduleId) => {
    if (activePolls[moduleId]) {
      clearInterval(activePolls[moduleId]);
      setActivePolls(curr => {
        const next = { ...curr };
        delete next[moduleId];
        return next;
      });
    }
  };

  const startVideoPolling = (jobId, moduleId) => {
    stopVideoPolling(moduleId);
    
    const poll = async () => {
      try {
        const res = await API.get(`/uploads/video/status/${jobId}`);
        const job = res.data;
        
        setUploadProgressByModule(curr => ({ ...curr, [moduleId]: job.progress }));
        setUploadStatusByModule(curr => ({ ...curr, [moduleId]: job.status }));
        setUploadMessageByModule(curr => ({ ...curr, [moduleId]: job.message }));

        if (job.status === "ready" && job.result) {
          stopVideoPolling(moduleId);
          const result = job.result;
          
          setLectureForms(curr => {
            const form = curr[moduleId] || emptyLectureForm;
            return {
              ...curr,
              [moduleId]: {
                ...form,
                mediaType: "video",
                videoUrl: result.url,
                videoOptimizedUrl: result.optimizedUrl,
                videoAudioOnlyUrl: result.audioOnlyUrl,
                videoThumbnailUrl: result.thumbnailUrl,
                videoCodec: result.codec,
                videoDuration: result.duration,
                videoOriginalSize: result.bytes,
                videoOptimizedSize: result.optimizedBytes,
                videoAudioOnlySize: result.audioOnlyBytes,
                videoLowBandwidthOptimized: result.isLowBandwidthOptimized,
                transcriptText: result.transcript?.text || "",
                transcriptSource: result.transcript?.source || "whisper",
              }
            };
          });
          setUploadStatusByModule(curr => ({ ...curr, [moduleId]: "ready" }));
          setUploadMessageByModule(curr => ({ ...curr, [moduleId]: "Adaptive media package is ready." }));
        } else if (job.status === "failed") {
          stopVideoPolling(moduleId);
          setError(`Video processing failed: ${job.error || "Unknown error"}`);
          setUploadStatusByModule(curr => ({ ...curr, [moduleId]: "Failed" }));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const interval = setInterval(poll, 3000);
    setActivePolls(curr => ({ ...curr, [moduleId]: interval }));
    poll();
  };

  const buildLecturePayload = (form, moduleId) => {
    const contents = [];
    const mediaType = form?.mediaType || "none";
    const textContent = form?.textContent || "";
    const title = form?.title || "Untitled Lecture";
    const order = Number(form?.order) || 1;

    if (textContent.trim()) {
      contents.push({ type: "text", data: textContent.trim(), order: 1 });
    }

    if (mediaType === "image" && form?.imageUrl?.trim()) {
      contents.push({ 
        type: "image", 
        url: form.imageUrl.trim(), 
        originalSize: Number(form.imageOriginalSize) || 0, 
        optimizedSize: Number(form.imageOptimizedSize) || 0, 
        isOptimized: Boolean(form.imageIsOptimized), 
        order: contents.length + 1 
      });
    }

    if (mediaType === "video" && form?.videoUrl?.trim()) {
      contents.push({ 
        type: "video", 
        url: form.videoUrl.trim(), 
        optimizedUrl: form.videoOptimizedUrl?.trim() || "", 
        audioOnlyUrl: form.videoAudioOnlyUrl?.trim() || "", 
        thumbnailUrl: form.videoThumbnailUrl?.trim() || "", 
        codec: form.videoCodec || "", 
        duration: Number(form.videoDuration) || 0, 
        originalSize: Number(form.videoOriginalSize) || 0, 
        optimizedSize: Number(form.videoOptimizedSize) || 0, 
        audioOnlySize: Number(form.videoAudioOnlySize) || 0, 
        isLowBandwidthOptimized: Boolean(form.videoLowBandwidthOptimized), 
        order: contents.length + 1 
      });
    }

    const transcriptText = form?.transcriptText || "";
    const transcriptSource = form?.transcriptSource || "";

    return {
      moduleId,
      title: title.trim(),
      order,
      contents,
      transcript: { 
        text: mediaType === "video" ? transcriptText.trim() : "", 
        source: (mediaType === "video" && transcriptText.trim()) ? transcriptSource || "whisper" : "" 
      },
      resources: (mediaType === "pdf" && form?.resourceTitle?.trim() && form?.resourceUrl?.trim()) ? [{ 
        title: form.resourceTitle.trim(), 
        url: form.resourceUrl.trim(), 
        type: form.resourceType || "pdf", 
        originalFilename: form.resourceFileName || "", 
        extractedText: form.resourceExtractedText || "", 
        originalSize: Number(form.resourceOriginalSize) || 0, 
        optimizedSize: Number(form.resourceOptimizedSize) || 0, 
        isOptimized: Boolean(form.resourceIsOptimized) 
      }] : []
    };
  };

  const hydrateLectureForm = (lecture) => {
    const videoItem = lecture.contents?.find(c => c.type === "video");
    const imageItem = lecture.contents?.find(c => c.type === "image");
    const textItem = lecture.contents?.find(c => c.type === "text");
    const resourceItem = lecture.resources?.[0];

    return {
      title: lecture.title,
      order: lecture.order,
      mediaType: videoItem ? "video" : imageItem ? "image" : "none",
      textContent: textItem?.data || "",
      imageUrl: imageItem?.url || "",
      imageOriginalSize: imageItem?.originalSize || 0,
      imageOptimizedSize: imageItem?.optimizedSize || 0,
      imageIsOptimized: imageItem?.isOptimized || false,
      videoUrl: videoItem?.url || "",
      videoOptimizedUrl: videoItem?.optimizedUrl || "",
      videoAudioOnlyUrl: videoItem?.audioOnlyUrl || "",
      videoThumbnailUrl: videoItem?.thumbnailUrl || "",
      videoCodec: videoItem?.codec || "",
      videoDuration: videoItem?.duration || 0,
      videoOriginalSize: videoItem?.originalSize || 0,
      videoOptimizedSize: videoItem?.optimizedSize || 0,
      videoAudioOnlySize: videoItem?.audioOnlySize || 0,
      videoLowBandwidthOptimized: videoItem?.isLowBandwidthOptimized || false,
      transcriptText: lecture.transcript?.text || "",
      transcriptSource: lecture.transcript?.source || "whisper",
      resourceUrl: resourceItem?.url || "",
      resourceTitle: resourceItem?.title || "",
      resourceType: resourceItem?.type || "pdf",
      resourceFileName: resourceItem?.originalFilename || "",
      resourceExtractedText: resourceItem?.extractedText || "",
      resourceOriginalSize: resourceItem?.originalSize || 0,
      resourceOptimizedSize: resourceItem?.optimizedSize || 0,
      resourceIsOptimized: resourceItem?.isOptimized || false
    };
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingModuleId) await API.put(`/modules/${editingModuleId}`, moduleForm);
      else await API.post("/modules", { ...moduleForm, courseId });
      setModuleForm({ title: "", order: 1 });
      setEditingModuleId(null);
      fetchCourseData();
    } catch (err) {
      setError("Failed to save module");
    } finally {
      setIsSubmitting(false);
    }
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

  const uploadLectureAsset = async (moduleId, file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    
    setUploadStatusByModule(curr => ({ ...curr, [moduleId]: "Uploading..." }));
    setUploadProgressByModule(curr => ({ ...curr, [moduleId]: 0 }));
    
    try {
      const endpoint = type === "image" ? "/uploads/image" : type === "pdf" ? "/uploads/resource" : "/uploads/video";
      const res = await API.post(endpoint, formData, {
        onUploadProgress: (p) => {
          const progress = Math.round((p.loaded * 100) / p.total);
          setUploadProgressByModule(curr => ({ ...curr, [moduleId]: progress }));
        }
      });
      
      const { data } = res;
      if (type === "video") {
        startVideoPolling(data.jobId, moduleId);
      } else {
        setLectureForms(curr => {
          const form = curr[moduleId] || emptyLectureForm;
          if (type === "image") return { ...curr, [moduleId]: { ...form, mediaType: "image", imageUrl: data.url, imageOriginalSize: data.originalBytes, imageOptimizedSize: data.optimizedBytes, imageIsOptimized: data.isOptimized } };
          return { ...curr, [moduleId]: { ...form, mediaType: "pdf", resourceUrl: data.url, resourceTitle: file.name, resourceFileName: file.name, resourceOriginalSize: data.originalBytes, resourceOptimizedSize: data.optimizedBytes, resourceIsOptimized: data.isOptimized, resourceExtractedText: data.extractedText } };
        });
        setUploadStatusByModule(curr => ({ ...curr, [moduleId]: "Ready!" }));
      }
    } catch (err) {
      setError("Upload failed");
      setUploadStatusByModule(curr => ({ ...curr, [moduleId]: "Error" }));
    }
  };

  const handleLectureSubmit = async (e, moduleId) => {
    e.preventDefault();
    setError("");
    
    const status = uploadStatusByModule[moduleId];
    console.log("Submitting lecture for module:", moduleId, "Status:", status);

    if (status && status !== "ready" && status !== "Error" && status !== "Ready!") {
      setError("Please wait for video processing to complete.");
      return;
    }

    if (!lectureForms[moduleId]?.title?.trim()) {
      setError("Lecture title is required");
      return;
    }

    const payload = buildLecturePayload(lectureForms[moduleId] || emptyLectureForm, moduleId);
    console.log("Lecture payload:", payload);

    setIsSubmitting(true);
    try {
      if (editingLectureId) await API.put(`/lectures/${editingLectureId}`, payload);
      else await API.post("/lectures", payload);
      setLectureForms(curr => ({ ...curr, [moduleId]: emptyLectureForm }));
      setEditingLectureId(null);
      setUploadStatusByModule(curr => { const n = {...curr}; delete n[moduleId]; return n; });
      fetchCourseData();
    } catch (err) {
      setError("Failed to save lecture");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-white">Loading...</div>;

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-[#0B0F19] text-gray-300 font-sans selection:bg-blue-500/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
           
           <header className="mb-12 flex items-center justify-between">
              <div>
                 <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{course?.title}</h1>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Course Architecture & Content Matrix</p>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => navigate('/teacher/dashboard')} className="px-6 py-3 bg-[#111827] border border-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-xl hover:text-white transition-all">Back to Dashboard</button>
                 <button onClick={() => setEditingModuleId('new')} className="px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">Create New Module</button>
              </div>
           </header>

           {error && (
             <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
               <span className="text-xl">⚠️</span>
               <span className="text-xs font-bold uppercase tracking-widest">{error}</span>
             </div>
           )}

           <main className="space-y-16">
              <div className="space-y-6">
                 <h2 className="text-lg font-black text-white uppercase tracking-tight">CURRICULUM MODULES</h2>
                 <div className="grid grid-cols-1 gap-8">
                    {modules.map(m => (
                      <div key={m._id} className="bg-[#111827]/50 border border-gray-800/50 rounded-3xl p-8 backdrop-blur-xl hover:border-gray-700 transition-all">
                         <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-black text-lg">{m.order}</div>
                               <h3 className="text-xl font-black text-white uppercase tracking-tight">{m.title}</h3>
                            </div>
                            <div className="flex gap-4">
                               <button onClick={() => { setEditingModuleId(m._id); setModuleForm({ title: m.title, order: m.order }); }} className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all">Edit Module</button>
                               <button className="text-[10px] font-black text-red-500/50 uppercase tracking-widest hover:text-red-500 transition-all">Delete</button>
                            </div>
                         </div>

                         <form onSubmit={e => handleLectureSubmit(e, m._id)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                               <div className="md:col-span-3 space-y-2">
                                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Lecture Title</label>
                                  <input 
                                    type="text" 
                                    placeholder="Enter compelling lecture title..."
                                    className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-5 py-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500 transition-all"
                                    value={lectureForms[m._id]?.title || ""}
                                    onChange={e => updateLectureForm(m._id, 'title', e.target.value)}
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Order Index</label>
                                  <input 
                                    typyupe="number" 
                                    className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                                    value={lectureForms[m._id]?.order || 1}
                                    onChange={e => updateLectureForm(m._id, 'order', e.target.value)}
                                  />
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Lecture Notes / Text Content</label>
                               <textarea 
                                 placeholder="Add important notes, code snippets, or extra context here..."
                                 className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl px-5 py-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500 transition-all min-h-[100px] resize-none"
                                 value={lectureForms[m._id]?.textContent || ""}
                                 onChange={e => updateLectureForm(m._id, 'textContent', e.target.value)}
                               />
                            </div>

                            <div className="bg-[#0B0F19] border border-gray-800/50 rounded-2xl p-6 space-y-6">
                               <div className="flex items-center gap-6">
                                  <label className="flex items-center gap-2 cursor-pointer group">
                                     <input type="radio" name={`type-${m._id}`} className="hidden" checked={lectureForms[m._id]?.mediaType === 'video'} onChange={() => updateLectureForm(m._id, 'mediaType', 'video')} />
                                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${lectureForms[m._id]?.mediaType === 'video' ? 'border-blue-500 bg-blue-500' : 'border-gray-800'}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-all" />
                                     </div>
                                     <span className={`text-[10px] font-black uppercase tracking-widest ${lectureForms[m._id]?.mediaType === 'video' ? 'text-white' : 'text-gray-500'}`}>Video Master</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer group">
                                     <input type="radio" name={`type-${m._id}`} className="hidden" checked={lectureForms[m._id]?.mediaType === 'pdf'} onChange={() => updateLectureForm(m._id, 'mediaType', 'pdf')} />
                                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${lectureForms[m._id]?.mediaType === 'pdf' ? 'border-blue-500 bg-blue-500' : 'border-gray-800'}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-all" />
                                     </div>
                                     <span className={`text-[10px] font-black uppercase tracking-widest ${lectureForms[m._id]?.mediaType === 'pdf' ? 'text-white' : 'text-gray-500'}`}>Smart Resource</span>
                                  </label>
                               </div>

                               <div className="space-y-4">
                                  {lectureForms[m._id]?.mediaType === 'video' && (
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 text-xl">📁</div>
                                            <div>
                                               <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Video Source</p>
                                               <p className="text-xs text-gray-400 mt-1">{lectureForms[m._id]?.videoUrl ? "Video file attached" : "No video file selected"}</p>
                                            </div>
                                         </div>
                                         <input type="file" id={`video-upload-${m._id}`} className="hidden" accept="video/*" onChange={e => e.target.files[0] && uploadLectureAsset(m._id, e.target.files[0], 'video')} />
                                         <button type="button" onClick={() => document.getElementById(`video-upload-${m._id}`).click()} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400">Change</button>
                                      </div>

                                      {(uploadStatusByModule[m._id] && uploadStatusByModule[m._id] !== "Error") && (
                                        <div className="space-y-3 border-t border-gray-800 pt-4">
                                           {/* Stage 1: Uploading */}
                                           <div className="space-y-1.5">
                                              <div className="flex items-center justify-between">
                                                 <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${uploadStatusByModule[m._id] === "Uploading..." ? "bg-blue-600 text-white animate-pulse" : "bg-emerald-500 text-white"}`}>
                                                       {uploadStatusByModule[m._id] === "Uploading..." ? "1" : "✓"}
                                                    </div>
                                                    <span className={`text-[9px] font-bold ${uploadStatusByModule[m._id] === "Uploading..." ? "text-white" : "text-gray-500"}`}>Uploading video</span>
                                                 </div>
                                                 {uploadStatusByModule[m._id] === "Uploading..." && <span className="text-[9px] font-bold text-blue-500">{uploadProgressByModule[m._id]}%</span>}
                                              </div>
                                              <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                                 <div className={`h-full transition-all duration-500 ${uploadStatusByModule[m._id] === "Uploading..." ? "bg-blue-600" : "bg-emerald-500"}`} style={{ width: uploadStatusByModule[m._id] === "Uploading..." ? `${uploadProgressByModule[m._id]}%` : "100%" }}></div>
                                              </div>
                                           </div>

                                           {/* Stage 2: H.264 Compression */}
                                           <div className="space-y-1.5">
                                              <div className="flex items-center justify-between">
                                                 <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${uploadMessageByModule[m._id]?.includes("H.264") || uploadMessageByModule[m._id]?.includes("Preparing") ? "bg-blue-600 text-white animate-pulse" : (["Extracting audio", "Transcribing", "ready"].some(s => uploadMessageByModule[m._id]?.includes(s) || uploadStatusByModule[m._id] === s) ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-600")}`}>
                                                       {(["Extracting audio", "Transcribing", "ready"].some(s => uploadMessageByModule[m._id]?.includes(s) || uploadStatusByModule[m._id] === s)) ? "✓" : "2"}
                                                    </div>
                                                    <span className={`text-[9px] font-bold ${(uploadMessageByModule[m._id]?.includes("H.264") || uploadMessageByModule[m._id]?.includes("Preparing")) ? "text-white" : "text-gray-500"}`}>H.264 Compression</span>
                                                 </div>
                                              </div>
                                              <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                                 <div className={`h-full transition-all duration-[4000ms] ease-out ${(uploadMessageByModule[m._id]?.includes("H.264") || uploadMessageByModule[m._id]?.includes("Preparing")) ? "bg-blue-600 w-[75%] animate-pulse" : (["Extracting audio", "Transcribing", "ready"].some(s => uploadMessageByModule[m._id]?.includes(s) || uploadStatusByModule[m._id] === s) ? "bg-emerald-500 w-full" : "w-0")}`}></div>
                                              </div>
                                           </div>

                                           {/* Stage 3: Audio Extraction */}
                                           <div className="space-y-1.5">
                                              <div className="flex items-center justify-between">
                                                 <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${uploadMessageByModule[m._id]?.includes("Extracting audio") ? "bg-blue-600 text-white animate-pulse" : (["Transcribing", "ready"].some(s => uploadMessageByModule[m._id]?.includes(s) || uploadStatusByModule[m._id] === s) ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-600")}`}>
                                                       {(["Transcribing", "ready"].some(s => uploadMessageByModule[m._id]?.includes(s) || uploadStatusByModule[m._id] === s)) ? "✓" : "3"}
                                                    </div>
                                                    <span className={`text-[9px] font-bold ${uploadMessageByModule[m._id]?.includes("Extracting audio") ? "text-white" : "text-gray-500"}`}>Audio Extraction</span>
                                                 </div>
                                              </div>
                                              <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                                 <div className={`h-full transition-all duration-[3000ms] ease-out ${uploadMessageByModule[m._id]?.includes("Extracting audio") ? "bg-blue-600 w-[80%] animate-pulse" : (["Transcribing", "ready"].some(s => uploadMessageByModule[m._id]?.includes(s) || uploadStatusByModule[m._id] === s) ? "bg-emerald-500 w-full" : "w-0")}`}></div>
                                              </div>
                                           </div>

                                           {/* Stage 4: AI Transcription */}
                                           <div className="space-y-1.5">
                                              <div className="flex items-center justify-between">
                                                 <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${uploadMessageByModule[m._id]?.includes("Transcribing") ? "bg-blue-600 text-white animate-pulse" : (uploadStatusByModule[m._id] === "ready" ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-600")}`}>
                                                       {uploadStatusByModule[m._id] === "ready" ? "✓" : "4"}
                                                    </div>
                                                    <span className={`text-[9px] font-bold ${uploadMessageByModule[m._id]?.includes("Transcribing") ? "text-white" : "text-gray-500"}`}>AI Transcription</span>
                                                 </div>
                                              </div>
                                              <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                                 <div className={`h-full transition-all duration-[6000ms] ease-out ${uploadMessageByModule[m._id]?.includes("Transcribing") ? "bg-blue-600 w-[90%] animate-pulse" : (uploadStatusByModule[m._id] === "ready" ? "bg-emerald-500 w-full" : "w-0")}`}></div>
                                              </div>
                                           </div>

                                           {uploadStatusByModule[m._id] === "ready" && (
                                              <div className="pt-2 flex items-center gap-2 text-emerald-500 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                                                 <span className="text-sm">✓</span>
                                                 <span className="text-[9px] font-black uppercase tracking-[0.2em]">Ready to save</span>
                                              </div>
                                           )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                               </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                               <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">{uploadMessageByModule[m._id] || "System Ready"}</div>
                               <div className="flex gap-3">
                                  {editingLectureId && <button type="button" onClick={() => { setEditingLectureId(null); setLectureForms(curr => ({ ...curr, [m._id]: emptyLectureForm })); }} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cancel</button>}
                                  <button 
                                    type="submit" 
                                    disabled={isSubmitting || (uploadStatusByModule[m._id] && uploadStatusByModule[m._id] !== "ready" && uploadStatusByModule[m._id] !== "Error" && uploadStatusByModule[m._id] !== "Ready!")}
                                    className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-[0.2em] hover:bg-blue-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                     {isSubmitting ? "Saving..." : "Save Lecture"}
                                  </button>
                               </div>
                            </div>
                         </form>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <h2 className="text-lg font-black text-white uppercase tracking-tight">EXISTING LECTURES</h2>
                 <div className="grid grid-cols-1 gap-4">
                    {modules.map(m => (
                      <div key={m._id} className="space-y-2">
                         <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.title}</span>
                            <div className="h-px flex-1 bg-gray-900" />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {lecturesByModule[m._id]?.map(l => (
                              <div key={l._id} className="bg-[#111827] border border-gray-800 p-6 rounded-2xl group hover:border-blue-500/30 transition-all">
                                 <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-[#0B0F19] flex items-center justify-center text-lg">📽️</div>
                                       <div>
                                          <p className="text-sm font-bold text-white">{l.title}</p>
                                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{l.contents?.length || 0} Assets</p>
                                       </div>
                                    </div>
                                    <div className="flex gap-3">
                                       <button onClick={() => { setEditingLectureId(l._id); setLectureForms(curr => ({ ...curr, [m._id]: hydrateLectureForm(l) })); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400">Edit</button>
                                       <button onClick={async () => { if(window.confirm('Delete lecture?')) { await API.delete(`/lectures/${l._id}`); fetchCourseData(); } }} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400">Delete</button>
                                    </div>
                                 </div>
                                 
                                 <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                                    <div className="flex gap-4">
                                      <div className="flex items-center gap-1.5" title={l.aiSummary?.error}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${l.aiSummary?.status === 'ready' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : l.aiSummary?.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}`}></div>
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Summary</span>
                                      </div>
                                      <div className="flex items-center gap-1.5" title={l.aiQuestionBank?.error}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${l.aiQuestionBank?.status === 'ready' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : l.aiQuestionBank?.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}`}></div>
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Adaptive Quiz</span>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={async () => {
                                        try {
                                          await API.post(`/lectures/single/${l._id}/ai-refresh`);
                                          fetchCourseData();
                                          setStatusMessage("AI generation restarted!");
                                        } catch (err) {
                                          setError("Failed to refresh AI");
                                        }
                                      }}
                                      className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 flex items-center gap-1"
                                    >
                                      <span>↺</span> Refresh AI
                                    </button>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </main>

        </div>
      </div>
    </SidebarLayout>
  );
};

export default TeacherCourseBuilder;
