import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";
import { findOfflineLecture } from "../utils/offlinePack";

const inferResourceType = (resource) => {
  if (resource.type) return resource.type;
  const value = `${resource.originalFilename || ""} ${resource.url || ""}`.toLowerCase();
  if (value.includes(".pdf")) return "pdf";
  if (value.includes(".txt") || value.includes("text/plain")) return "text";
  return "file";
};

const formatVideoSize = (bytes) => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const getCompressionSavings = (originalSize, optimizedSize) => {
  if (!originalSize || !optimizedSize || optimizedSize >= originalSize) return null;
  return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
};

const UnifiedPlayer = ({ item }) => {
  const [currentMode, setCurrentMode] = useState("auto"); // auto, original, optimized, audio
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [detectedSpeed, setDetectedSpeed] = useState(null);
  const [autoQuality, setAutoQuality] = useState("optimized");
  const [isChangingMode, setIsChangingMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  const optimizedReady = Boolean(item.optimizedUrl);
  const audioReady = Boolean(item.audioOnlyUrl);

  let effectiveSource = item.url;
  let modeLabel = "Original";

  if (currentMode === "auto") {
    effectiveSource = autoQuality === "optimized" && optimizedReady ? item.optimizedUrl : item.url;
    modeLabel = `Auto (${autoQuality === "optimized" ? "H.264" : "Original"})`;
  } else if (currentMode === "optimized" && optimizedReady) {
    effectiveSource = item.optimizedUrl;
    modeLabel = "H.264 Optimized";
  } else if (currentMode === "audio" && audioReady) {
    effectiveSource = item.audioOnlyUrl;
    modeLabel = "Audio Only";
  }

  useEffect(() => {
    let isActive = true;
    const runDetection = async () => {
      if (!item.url) return;
      const testUrl = optimizedReady ? item.optimizedUrl : item.url;
      const startTime = performance.now();
      try {
        const response = await fetch(testUrl, { headers: { Range: "bytes=0-499999" }, cache: "no-store" });
        const data = await response.blob();
        const durationSeconds = (performance.now() - startTime) / 1000;
        const mbps = (data.size * 8) / durationSeconds / 1_000_000;
        if (isActive) {
          setDetectedSpeed(Number(mbps.toFixed(2)));
          setAutoQuality(mbps < 2.5 ? "optimized" : "original");
        }
      } catch {
        const fallback = navigator?.connection?.downlink;
        if (isActive && fallback) setDetectedSpeed(fallback);
      }
    };
    runDetection();
    const id = setInterval(runDetection, 10000);
    return () => { isActive = false; clearInterval(id); };
  }, [item.url, item.optimizedUrl, optimizedReady]);

  const handleModeChange = (newMode) => {
    setIsChangingMode(true);
    setCurrentMode(newMode);
    setTimeout(() => setIsChangingMode(false), 100);
  };

  useEffect(() => {
    if (videoRef.current && currentTime > 0) {
      videoRef.current.currentTime = currentTime;
      videoRef.current.play().catch(() => null);
    }
  }, [effectiveSource]);

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-black rounded-3xl overflow-hidden shadow-2xl relative group">
      <div className="aspect-video relative">
        <video
          ref={videoRef}
          key={effectiveSource}
          className={`w-full h-full object-contain ${currentMode === "audio" ? "opacity-20 blur-sm" : ""}`}
          controls
          poster={item.thumbnailUrl}
          preload="none"
          src={effectiveSource}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
        >
          Your browser does not support video playback.
        </video>
        
        {currentMode === "audio" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
            <div className="text-6xl mb-4 animate-pulse">📻</div>
            <p className="text-xl font-bold">Audio Mode Enabled</p>
            <p className="text-sm text-gray-400 mt-2">Maximum data savings for low bandwidth areas</p>
          </div>
        )}

        {isChangingMode && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white font-bold">
            Switching Quality...
          </div>
        )}
      </div>

      <div className="bg-gray-900/90 backdrop-blur-xl p-4 lg:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Quality</span>
            <select 
              className="bg-gray-800 text-white text-xs font-bold px-3 py-2 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
              value={currentMode} 
              onChange={(e) => handleModeChange(e.target.value)}
            >
              <option value="auto">Auto Select</option>
              <option value="original">High ({formatVideoSize(item.originalSize)})</option>
              {optimizedReady && <option value="optimized">Compressed ({formatVideoSize(item.optimizedSize)})</option>}
              {audioReady && <option value="audio">Audio Only ({formatVideoSize(item.audioOnlySize)})</option>}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Speed</span>
            <select 
              className="bg-gray-800 text-white text-xs font-bold px-3 py-2 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
              value={playbackSpeed} 
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setPlaybackSpeed(val);
                if (videoRef.current) videoRef.current.playbackRate = val;
              }}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="text-right">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{modeLabel}</p>
              {detectedSpeed && <p className="text-xs font-bold text-white">{detectedSpeed} Mbps detected</p>}
           </div>
           <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Progress</p>
              <p className="text-xs font-bold text-white">{formatTime(currentTime)} / {formatTime(duration)}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const ResourcePreview = ({ resource }) => {
  const resourceType = inferResourceType(resource);
  const [textContent, setTextContent] = useState("");
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (resourceType !== "text") return;
    const controller = new AbortController();
    const loadText = async () => {
      setLoadingText(true);
      try {
        const response = await fetch(resource.url, { signal: controller.signal });
        if (response.ok) setTextContent(await response.text());
      } catch {} finally { setLoadingText(false); }
    };
    loadText();
    return () => controller.abort();
  }, [resourceType, resource.url]);

  return (
    <article className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-all hover:border-blue-500/50">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest mb-2 inline-block">
            {resourceType}
          </span>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{resource.title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{resource.originalFilename}</p>
        </div>
        <div className="flex gap-2">
          <a href={resource.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all">Open</a>
          <a href={resource.url} download={resource.originalFilename || resource.title} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all">Download</a>
        </div>
      </div>

      {resourceType === "pdf" && (
        <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 h-96 bg-gray-50 dark:bg-gray-900">
          <object data={resource.url} type="application/pdf" className="w-full h-full">
            <p className="p-8 text-center text-sm text-gray-400 italic">PDF preview unavailable. Use download button.</p>
          </object>
        </div>
      )}

      {resourceType === "text" && (
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-6 max-h-96 overflow-y-auto">
          {loadingText ? <p className="text-sm text-gray-400 italic">Loading preview...</p> : (
            <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{textContent}</pre>
          )}
        </div>
      )}
    </article>
  );
};

const LectureViewer = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, setCurrentUser } = useAuth();
  const lectureList = useMemo(() => location.state?.lectures || [], [location.state?.lectures]);
  
  const [lecture, setLecture] = useState(null);
  const [error, setError] = useState("");
  const [completionMessage, setCompletionMessage] = useState("");
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [visibleImages, setVisibleImages] = useState({});
  const [note, setNote] = useState("");
  const [noteMessage, setNoteMessage] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [transcriptOnlyMode, setTranscriptOnlyMode] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState([
    { role: "assistant", content: "Ask for practice MCQs or doubts from this lecture and I will stay grounded in the lecture context." }
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const [isSendingAssistant, setIsSendingAssistant] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  const [adaptiveSessionId, setAdaptiveSessionId] = useState("");
  const [adaptiveSession, setAdaptiveSession] = useState(null);
  const [adaptiveQuestion, setAdaptiveQuestion] = useState(null);
  const [adaptiveFeedback, setAdaptiveFeedback] = useState(null);
  const [selectedAdaptiveAnswer, setSelectedAdaptiveAnswer] = useState(null);
  const [isSubmittingAdaptive, setIsSubmittingAdaptive] = useState(false);

  const [courseOutline, setCourseOutline] = useState(null);
  const [outlineModules, setOutlineModules] = useState([]);
  const [outlineLectures, setOutlineLectures] = useState({});
  const [outlineQuizzes, setOutlineQuizzes] = useState({});
  const [openOutlineModule, setOpenOutlineModule] = useState("");
  const [outlineLoading, setOutlineLoading] = useState(true);

  const currentIndex = lectureList.findIndex((item) => item._id === lectureId);
  const prevLecture = lectureList[currentIndex - 1];
  const nextLecture = lectureList[currentIndex + 1];

  useEffect(() => {
    const loadLecture = async () => {
      try {
        const requests = [API.get(`/lectures/single/${lectureId}`)];
        if (isAuthenticated && user?.role === "student") requests.push(API.get(`/notes/lecture/${lectureId}`));
        
        const [lecRes, noteRes] = await Promise.all(requests);
        const loadedLecture = lecRes.data;
        setLecture(loadedLecture);
        setTranscriptOnlyMode(user?.preferredMode === "low-bandwidth" && Boolean(loadedLecture.transcript?.text));
        if (noteRes?.data?.content) setNote(noteRes.data.content);
        else setNote("");

        if (loadedLecture?.moduleId) {
          setOutlineLoading(true);
          try {
            const moduleResponse = await API.get(`/modules/single/${loadedLecture.moduleId}`);
            const module = moduleResponse.data;
            if (module?.courseId) {
              const [courseRes, modulesRes] = await Promise.all([
                API.get(`/courses/${module.courseId}`),
                API.get(`/modules/${module.courseId}`),
              ]);
              setCourseOutline(courseRes.data);
              setOutlineModules(modulesRes.data);
              setOpenOutlineModule(module._id);

              const lecEntries = await Promise.all(modulesRes.data.map(async (m) => [m._id, (await API.get(`/lectures/${m._id}`)).data]));
              const quizEntries = await Promise.all(modulesRes.data.map(async (m) => [m._id, (await API.get(`/quizzes/module/${m._id}`)).data]));
              setOutlineLectures(Object.fromEntries(lecEntries));
              setOutlineQuizzes(Object.fromEntries(quizEntries));
            }
          } finally { setOutlineLoading(false); }
        }
      } catch (err) {
        const offlineData = await findOfflineLecture(lectureId);
        if (offlineData?.lecture) {
          setLecture(offlineData.lecture);
          setTranscriptOnlyMode(user?.preferredMode === "low-bandwidth" && Boolean(offlineData.lecture.transcript?.text));
          setCourseOutline(offlineData.course);
          setOutlineModules([offlineData.module]);
          setOutlineLectures({ [offlineData.module._id]: offlineData.lectures });
          setOutlineQuizzes({ [offlineData.module._id]: [] });
          setOpenOutlineModule(offlineData.module._id);
          setOutlineLoading(false);
          return;
        }
        setError(err.response?.data?.message || "Failed to load lecture");
      }
    };
    loadLecture();
    localStorage.setItem(`lecture-${lectureId}`, "done");
  }, [lectureId, isAuthenticated, user?.role, user?.preferredMode]);

  const handleMarkComplete = async () => {
    setIsMarkingComplete(true);
    try {
      const res = await API.post(`/progress/lecture/${lectureId}/complete`, { completed: true });
      if (res.data.student && user) setCurrentUser({ ...user, streakCount: res.data.student.streakCount });
      setCompletionMessage("Lecture completed!");
    } catch { setCompletionMessage("Failed to update progress"); }
    finally { setIsMarkingComplete(false); }
  };

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      await API.put(`/notes/lecture/${lectureId}`, { content: note });
      setNoteMessage("Note saved!");
    } catch { setNoteMessage("Failed to save note"); }
    finally { setIsSavingNote(false); }
  };

  const handleAssistantSubmit = async (e) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;
    const nextMessages = [...assistantMessages, { role: "user", content: assistantInput.trim() }];
    setAssistantMessages(nextMessages);
    setAssistantInput("");
    setIsSendingAssistant(true);
    try {
      const res = await API.post(`/lectures/single/${lectureId}/ai-chat`, {
        messages: nextMessages.map(m => ({ role: m.role, content: m.content }))
      });
      setAssistantMessages(curr => [...curr, { role: "assistant", content: res.data.reply || "No response.", mcqs: res.data.mcqs || [] }]);
    } catch { setAssistantMessages(curr => [...curr, { role: "assistant", content: "AI is currently unavailable." }]); }
    finally { setIsSendingAssistant(false); }
  };

  const handleStartAdaptivePractice = async () => {
    try {
      const res = await API.post(`/adaptive-quizzes/lectures/${lectureId}/start`);
      setAdaptiveSessionId(res.data.sessionId);
      setAdaptiveSession(res.data.session);
      setAdaptiveQuestion(res.data.currentQuestion);
    } catch {}
  };

  const handleSubmitAdaptiveAnswer = async () => {
    if (selectedAdaptiveAnswer === null) return;
    setIsSubmittingAdaptive(true);
    try {
      const res = await API.post(`/adaptive-quizzes/sessions/${adaptiveSessionId}/answer`, {
        questionId: adaptiveQuestion.id,
        selectedAnswer: selectedAdaptiveAnswer,
        timeTakenSeconds: 30
      });
      setAdaptiveFeedback(res.data.feedback);
      setAdaptiveSession(res.data.session);
      setAdaptiveQuestion(res.data.currentQuestion);
      setSelectedAdaptiveAnswer(null);
    } catch {} finally { setIsSubmittingAdaptive(false); }
  };

  if (!lecture) return <AppShell><div className="max-w-7xl mx-auto px-4 py-20 animate-pulse"><div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-[48px]"></div></div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Main Content Area */}
          <main className="flex-1 w-full order-1 lg:order-2">
            
            {/* Header / Nav */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
               <button onClick={() => navigate(-1)} className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center gap-2">
                  ← Back
               </button>
               <div className="flex gap-3">
                  {prevLecture && (
                    <button 
                      onClick={() => navigate(`/lecture/${prevLecture._id}`, { state: { lectures: lectureList } })}
                      className="px-5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl"
                    >
                      Previous
                    </button>
                  )}
                  {nextLecture && (
                    <button 
                      onClick={() => navigate(`/lecture/${nextLecture._id}`, { state: { lectures: lectureList } })}
                      className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20"
                    >
                      Next Lecture
                    </button>
                  )}
               </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-8">{lecture.title}</h1>

            {/* Main Player / Content */}
            <div className="space-y-12 mb-16">
              {lecture.contents?.sort((a, b) => a.order - b.order).map((item, index) => {
                if (item.type === "video") {
                  if (transcriptOnlyMode && lecture.transcript?.text) return null;
                  return <UnifiedPlayer key={index} item={item} />;
                }
                if (item.type === "text") return <p key={index} className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{item.data}</p>;
                if (item.type === "image") {
                  const showImage = user?.preferredMode !== "low-bandwidth" || visibleImages[index];
                  if (!showImage) return <button key={index} onClick={() => setVisibleImages(curr => ({ ...curr, [index]: true }))} className="w-full py-20 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[40px] text-gray-400 font-bold">Click to load image (Low Bandwidth Mode)</button>;
                  return (
                    <div key={index} className="rounded-[40px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl">
                      <img src={item.url} alt="Content" className="w-full h-auto" />
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* AI and Transcript Section (Moved Below Content) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 pt-16 border-t border-gray-100 dark:border-gray-800">
               {/* AI Summary */}
               {lecture.aiSummary?.status === "ready" && (
                 <div className="bg-blue-50/50 dark:bg-blue-900/10 p-8 rounded-[40px] border border-blue-100 dark:border-blue-900/20">
                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest mb-4 inline-block">AI Revision Summary</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Insights</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{lecture.aiSummary.text}</p>
                    <div className="flex flex-wrap gap-2">
                       {lecture.aiSummary.keyPoints?.map((p, i) => <span key={i} className="px-4 py-2 bg-white dark:bg-gray-800 text-xs font-bold text-blue-600 dark:text-blue-400 rounded-xl shadow-sm">{p}</span>)}
                    </div>
                 </div>
               )}

               {/* Transcript */}
               {lecture.transcript?.text && (
                 <div className="bg-gray-50 dark:bg-gray-900/30 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                       <span className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black rounded-full uppercase tracking-widest">Transcript</span>
                       {lecture.contents?.some(i => i.type === "video") && (
                         <button onClick={() => setTranscriptOnlyMode(!transcriptOnlyMode)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                            {transcriptOnlyMode ? "Show Video" : "Reading Mode"}
                         </button>
                       )}
                    </div>
                    <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                       <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{lecture.transcript.text}</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Adaptive Practice */}
            {lecture.aiQuestionBank?.status === "ready" && lecture.aiQuestionBank.questions?.length > 0 && (
              <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[48px] p-8 lg:p-12 mb-16 shadow-2xl shadow-blue-600/5">
                 <div className="mb-10 text-center">
                    <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest mb-4 inline-block">Adaptive Practice</span>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Test Your Knowledge</h2>
                    <p className="text-sm text-gray-500 mt-2">Personalized questions based on your current understanding.</p>
                 </div>

                 {!adaptiveQuestion ? (
                   <div className="text-center">
                      <button onClick={handleStartAdaptivePractice} className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1">
                        Start Practice Session
                      </button>
                   </div>
                 ) : (
                   <div className="max-w-2xl mx-auto">
                      <div className="flex justify-between items-center mb-8">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question {adaptiveQuestion.questionNumber} of {adaptiveQuestion.totalQuestions}</span>
                         <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black rounded-full uppercase tracking-widest">Difficulty: {adaptiveQuestion.difficulty}</span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-8">{adaptiveQuestion.question}</h4>
                      <div className="grid grid-cols-1 gap-4 mb-8">
                         {adaptiveQuestion.options.map((opt, i) => (
                           <button 
                            key={i} 
                            onClick={() => setSelectedAdaptiveAnswer(i)}
                            className={`p-6 text-left rounded-3xl border-2 transition-all font-bold ${selectedAdaptiveAnswer === i ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                           >
                             <span className="mr-4 text-blue-500">{String.fromCharCode(65 + i)}</span> {opt}
                           </button>
                         ))}
                      </div>
                      <button 
                        onClick={handleSubmitAdaptiveAnswer} 
                        disabled={isSubmittingAdaptive}
                        className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 disabled:bg-blue-400"
                      >
                        {isSubmittingAdaptive ? "Checking..." : "Submit Answer"}
                      </button>
                   </div>
                 )}

                 {adaptiveFeedback && (
                   <div className={`mt-10 p-8 rounded-[32px] border ${adaptiveFeedback.isCorrect ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400'}`}>
                      <p className="font-black uppercase text-xs tracking-widest mb-2">{adaptiveFeedback.isCorrect ? "Correct!" : "Keep Trying"}</p>
                      <p className="text-lg font-bold mb-4">{adaptiveFeedback.explanation}</p>
                      {adaptiveFeedback.remediationHint && <p className="text-sm italic opacity-80">Hint: {adaptiveFeedback.remediationHint}</p>}
                   </div>
                 )}
              </section>
            )}

            {/* Resources & Notes */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16">
               <section>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Resources</h3>
                  <div className="space-y-4">
                     {lecture.resources?.map((r, i) => <ResourcePreview key={i} resource={r} />)}
                     {!lecture.resources?.length && <p className="text-gray-400 italic">No extra resources for this lecture.</p>}
                  </div>
               </section>

               {isAuthenticated && user?.role === "student" && (
                 <section className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Personal Notes</h3>
                    <textarea 
                      className="w-full h-48 p-6 rounded-3xl bg-gray-50 dark:bg-gray-800 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 mb-6"
                      placeholder="Capture your thoughts here..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                       <button onClick={handleSaveNote} disabled={isSavingNote} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20">
                          {isSavingNote ? "Saving..." : "Save Note"}
                       </button>
                       {noteMessage && <span className="text-xs font-bold text-green-600">{noteMessage}</span>}
                    </div>
                 </section>
               )}
            </div>

            {/* Final Actions */}
            {isAuthenticated && user?.role === "student" && (
              <div className="flex flex-col items-center gap-6 py-12 border-t border-gray-100 dark:border-gray-800">
                 <button 
                  onClick={handleMarkComplete} 
                  disabled={isMarkingComplete}
                  className={`px-12 py-5 rounded-2xl font-black transition-all shadow-xl ${completionMessage.includes('completed') ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-none'}`}
                 >
                   {isMarkingComplete ? "Saving..." : completionMessage.includes('completed') ? "Completed ✓" : "Mark as Complete"}
                 </button>
                 {completionMessage && <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{completionMessage}</p>}
              </div>
            )}

          </main>

          {/* Sidebar Area (Navigation) */}
          <aside className="w-full lg:w-80 order-2 lg:order-1 sticky top-24">
             <div className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl shadow-blue-600/5">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800">
                   <span className="text-blue-600 font-bold text-[10px] uppercase tracking-widest">Current Course</span>
                   <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">{courseOutline?.title}</h2>
                </div>
                
                <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                   {outlineModules.map((m) => {
                     const isOpen = openOutlineModule === m._id;
                     return (
                       <div key={m._id} className="mb-2">
                          <button 
                            onClick={() => setOpenOutlineModule(isOpen ? "" : m._id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all ${isOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                          >
                             <span className="text-xs font-bold truncate pr-4">{m.title}</span>
                             <span className="text-[10px] font-black">{isOpen ? '−' : '+'}</span>
                          </button>
                          {isOpen && (
                            <div className="mt-2 space-y-1 pl-2 border-l-2 border-blue-100 dark:border-blue-900/30 ml-4">
                               {outlineLectures[m._id]?.map((l) => (
                                 <button 
                                  key={l._id} 
                                  onClick={() => navigate(`/lecture/${l._id}`, { state: { lectures: outlineLectures[m._id] } })}
                                  className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-colors ${l._id === lectureId ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                 >
                                   {l.title}
                                 </button>
                               ))}
                               {outlineQuizzes[m._id]?.map((q) => (
                                 <button 
                                  key={q._id} 
                                  onClick={() => navigate(`/quiz/${q._id}`)}
                                  className="w-full text-left p-3 rounded-xl text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex justify-between items-center"
                                 >
                                   <span className="truncate pr-2">{q.title}</span>
                                   <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">Quiz</span>
                                 </button>
                               ))}
                            </div>
                          )}
                       </div>
                     );
                   })}
                </div>
             </div>

             <button 
              onClick={() => setIsAssistantOpen(!isAssistantOpen)}
              className="w-full mt-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
             >
                <span className="text-lg">✨</span> {isAssistantOpen ? "Close AI Chat" : "Ask AI Assistant"}
             </button>
          </aside>

        </div>
      </div>

      {/* AI Assistant Sidebar (Overlay) */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsAssistantOpen(false)} />
           <aside className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">EduReach AI</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Gemma 2 Powered Assistant</p>
                 </div>
                 <button onClick={() => setIsAssistantOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                 {assistantMessages.map((msg, i) => (
                   <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-6 rounded-3xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                         <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                         {msg.mcqs?.length > 0 && (
                           <div className="mt-6 space-y-4 pt-6 border-t border-black/10 dark:border-white/10">
                              {msg.mcqs.map((mcq, mi) => (
                                <div key={mi} className="bg-white/10 p-4 rounded-2xl">
                                   <p className="font-bold text-sm mb-3">{mcq.question}</p>
                                   <div className="space-y-1">
                                      {mcq.options.map((o, oi) => <p key={oi} className="text-xs opacity-80">{String.fromCharCode(65+oi)}. {o}</p>)}
                                   </div>
                                   <p className="mt-3 text-[10px] font-black uppercase text-blue-300">Answer: {String.fromCharCode(65 + (mcq.correctAnswer || 0))}</p>
                                </div>
                              ))}
                           </div>
                         )}
                      </div>
                   </div>
                 ))}
                 {isSendingAssistant && <div className="flex justify-start"><div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-3xl rounded-tl-none animate-pulse text-xs font-bold text-gray-400">Gemma is thinking...</div></div>}
              </div>

              <form onSubmit={handleAssistantSubmit} className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                 <div className="relative">
                    <textarea 
                      className="w-full p-6 pr-16 rounded-3xl bg-white dark:bg-gray-900 border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 shadow-xl resize-none"
                      placeholder="Type your doubt..."
                      rows={2}
                      value={assistantInput}
                      onChange={(e) => setAssistantInput(e.target.value)}
                    />
                    <button type="submit" disabled={isSendingAssistant} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all">
                       →
                    </button>
                 </div>
              </form>
           </aside>
        </div>
      )}
    </AppShell>
  );
};

export default LectureViewer;
