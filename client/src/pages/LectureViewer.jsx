import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";
import { findOfflineLecture } from "../utils/offlinePack";

const inferResourceType = (resource) => {
  if (resource.type) {
    return resource.type;
  }

  const value = `${resource.originalFilename || ""} ${resource.url || ""}`.toLowerCase();

  if (value.includes(".pdf")) {
    return "pdf";
  }

  if (value.includes(".txt") || value.includes("text/plain")) {
    return "text";
  }

  return "file";
};

const formatVideoSize = (bytes) => {
  if (!bytes) {
    return "";
  }

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
  if (!originalSize || !optimizedSize || optimizedSize >= originalSize) {
    return null;
  }

  return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
};

const VideoComparison = ({ item, preferredMode }) => {
  const compressionSavings = getCompressionSavings(
    item.originalSize,
    item.optimizedSize
  );
  const optimizedReady = Boolean(item.optimizedUrl);
  const [playbackMode, setPlaybackMode] = useState("compare");
  const [autoQuality, setAutoQuality] = useState(
    optimizedReady ? "optimized" : "original"
  );
  const [detectedSpeed, setDetectedSpeed] = useState(null);
  const [autoStatus, setAutoStatus] = useState("");
  const autoVideoRef = useRef(null);
  const [resumeAt, setResumeAt] = useState(null);
  const [shouldResumePlay, setShouldResumePlay] = useState(false);

  const qualityLabel = autoQuality === "optimized" ? "H.264 Optimized" : "Original";
  const autoSource =
    autoQuality === "optimized" && optimizedReady ? item.optimizedUrl : item.url;

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      const detectSpeed = async () => {
        if (!item.url) {
          return null;
        }

        const testUrl = optimizedReady ? item.optimizedUrl : item.url;
        const startTime = performance.now();

        try {
          const response = await fetch(testUrl, {
            headers: {
              Range: "bytes=0-999999",
            },
            cache: "no-store",
          });

          const data = await response.blob();
          const durationSeconds = (performance.now() - startTime) / 1000;
          const bitsLoaded = data.size * 8;
          const mbps = bitsLoaded / durationSeconds / 1_000_000;
          setDetectedSpeed(Number(mbps.toFixed(2)));
          return mbps;
        } catch {
          const fallback = navigator?.connection?.downlink;
          if (fallback) {
            setDetectedSpeed(fallback);
            return fallback;
          }
          return null;
        }
      };

      const chooseQuality = (mbps) => {
        if (!optimizedReady) {
          return "original";
        }

        if (typeof mbps === "number" && mbps < 2.0) {
          return "optimized";
        }

        return "original";
      };

      const mbps = await detectSpeed();
      if (!isActive) {
        return;
      }
      const nextQuality = chooseQuality(mbps);
      if (nextQuality !== autoQuality) {
        const currentVideo = autoVideoRef.current;
        if (currentVideo) {
          setResumeAt(currentVideo.currentTime || 0);
          setShouldResumePlay(!currentVideo.paused);
        }
        setAutoQuality(nextQuality);
        setAutoStatus(
          `Auto-switched to ${nextQuality === "optimized" ? "H.264" : "Original"}`
        );
      } else {
        setAutoStatus("");
      }
    };

    run();
    const intervalId = window.setInterval(run, 5000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [item.url, item.optimizedUrl, optimizedReady, autoQuality]);

  return (
    <div className="video-card">
      {item.thumbnailUrl ? (
        <img
          src={item.thumbnailUrl}
          alt="Video thumbnail"
          className="video-thumbnail"
          loading="lazy"
        />
      ) : null}
      <div className="action-row video-mode-actions">
        <button
          type="button"
          className={`btn btn-inline ${playbackMode === "compare" ? "" : "btn-secondary"}`}
          onClick={() => setPlaybackMode("compare")}
        >
          Compare Videos
        </button>
        <button
          type="button"
          className={`btn btn-inline ${playbackMode === "audio" ? "" : "btn-secondary"}`}
          onClick={() => setPlaybackMode("audio")}
          disabled={!item.audioOnlyUrl}
        >
          Audio Only
        </button>
      </div>
      {playbackMode === "audio" ? (
        <div className="video-panel">
          <div className="builder-header">
            <div>
              <span className="card-badge">Audio</span>
              <h4>Rural Audio Mode</h4>
            </div>
            {preferredMode === "low-bandwidth" ? (
              <span className="meta-pill">Best for weak networks</span>
            ) : null}
          </div>
          {item.audioOnlyUrl ? (
            <>
              <audio className="lecture-audio" controls preload="metadata" src={item.audioOnlyUrl}>
                Your browser does not support audio playback.
              </audio>
              <p className="meta-text">
                Audio size: {formatVideoSize(item.audioOnlySize) || "N/A"}
              </p>
            </>
          ) : (
            <div className="resource-preview-wrap video-fallback">
              <p className="meta-text">
                Audio-only version is not available for this lecture yet.
              </p>
            </div>
          )}
        </div>
      ) : (
      <div className="video-compare-grid">
        <div className="video-panel">
          <div className="builder-header">
            <div>
              <span className="card-badge">Original</span>
              <h4>Original Upload</h4>
            </div>
            {preferredMode === "low-bandwidth" ? (
              <span className="meta-pill">Not preferred in low-bandwidth mode</span>
            ) : null}
          </div>
          <video
            className="lecture-video"
            controls
            preload="metadata"
            src={item.url}
          >
            Your browser does not support video playback.
          </video>
          <p className="meta-text">
            Size: {formatVideoSize(item.originalSize) || "N/A"}
          </p>
        </div>

        <div className="video-panel">
          <div className="builder-header">
            <div>
              <span className="card-badge">H.264</span>
              <h4>Optimized Version</h4>
            </div>
            {preferredMode === "low-bandwidth" && optimizedReady ? (
              <span className="meta-pill">Preferred in low-bandwidth mode</span>
            ) : null}
          </div>
          {optimizedReady ? (
            <video
              className="lecture-video"
              controls
              preload="metadata"
              src={item.optimizedUrl}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="resource-preview-wrap video-fallback">
              <p className="meta-text">
                Optimized H.264 version is not available for this lecture yet.
              </p>
            </div>
          )}
          <p className="meta-text">
            Size: {formatVideoSize(item.optimizedSize) || "N/A"}
          </p>
        </div>
      </div>
      )}

      <div className="video-panel video-auto-panel">
        <div className="builder-header">
          <div>
            <span className="card-badge">Auto</span>
            <h4>Adaptive Playback</h4>
          </div>
          {detectedSpeed ? (
            <span className="meta-pill">{detectedSpeed} Mbps</span>
          ) : (
            <span className="meta-pill">Speed unknown</span>
          )}
        </div>
        <video
          className="lecture-video"
          controls
          preload="metadata"
          ref={autoVideoRef}
          src={autoSource}
          onLoadedMetadata={() => {
            const video = autoVideoRef.current;
            if (!video) {
              return;
            }
            if (typeof resumeAt === "number") {
              video.currentTime = resumeAt;
              setResumeAt(null);
            }
            if (shouldResumePlay) {
              video.play().catch(() => null);
              setShouldResumePlay(false);
            }
          }}
        >
          Your browser does not support video playback.
        </video>
        <p className="meta-text">
          Current quality: {qualityLabel}
          {autoStatus ? ` | ${autoStatus}` : ""}
        </p>
      </div>

      <div className="video-stats-card">
        <div className="video-meta-grid">
          <span className="meta-pill">
            Codec: {item.codec || "h264"}
          </span>
          {item.duration ? (
            <span className="meta-pill">
              Duration: {Math.round(item.duration)}s
            </span>
          ) : null}
          {compressionSavings !== null ? (
            <span className="meta-pill">
              Compression saved: {compressionSavings}%
            </span>
          ) : null}
          <span className="meta-pill">
            Optimized ready: {item.isLowBandwidthOptimized ? "Yes" : "No"}
          </span>
        </div>
        <p className="meta-text">
          Original size: {formatVideoSize(item.originalSize) || "N/A"}
          {" | "}
          H.264 size: {formatVideoSize(item.optimizedSize) || "N/A"}
          {item.audioOnlySize ? (
            <>
              {" | "}
              Audio size: {formatVideoSize(item.audioOnlySize)}
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
};

const ResourcePreview = ({ resource }) => {
  const resourceType = inferResourceType(resource);
  const [textContent, setTextContent] = useState("");
  const [textError, setTextError] = useState("");
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (resourceType !== "text") {
      return undefined;
    }

    const controller = new AbortController();

    const loadText = async () => {
      setLoadingText(true);
      setTextError("");

      try {
        const response = await fetch(resource.url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to preview this text file.");
        }

        const content = await response.text();
        setTextContent(content);
      } catch (error) {
        if (error.name !== "AbortError") {
          setTextError("Preview unavailable. Use the download button below.");
        }
      } finally {
        setLoadingText(false);
      }
    };

    loadText();

    return () => controller.abort();
  }, [resourceType, resource.url]);

  return (
    <article className="resource-card">
      <div className="builder-header">
        <div>
          <span className="card-badge">{resourceType}</span>
          <h4>{resource.title}</h4>
          {resource.originalFilename ? (
            <p className="meta-text">{resource.originalFilename}</p>
          ) : null}
        </div>
        <div className="action-row">
          <a
            className="btn btn-secondary btn-inline"
            href={resource.url}
            target="_blank"
            rel="noreferrer"
          >
            Open
          </a>
          <a
            className="btn btn-inline"
            href={resource.url}
            download={resource.originalFilename || resource.title}
          >
            Download
          </a>
        </div>
      </div>

      {resourceType === "pdf" ? (
        <div className="resource-preview-wrap">
          <object
            data={resource.url}
            type="application/pdf"
            className="resource-preview-frame"
          >
            <p className="meta-text">
              PDF preview unavailable. Use Open or Download.
            </p>
          </object>
        </div>
      ) : null}

      {resourceType === "text" ? (
        <div className="resource-preview-wrap">
          {loadingText ? <p className="meta-text">Loading text preview...</p> : null}
          {textError ? <p className="meta-text">{textError}</p> : null}
          {!loadingText && !textError && textContent ? (
            <pre className="resource-text-preview">{textContent}</pre>
          ) : null}
        </div>
      ) : null}

      {resource.extractedText ? (
        <div className="resource-preview-wrap">
          <p className="meta-text">Extracted text preview:</p>
          <pre className="resource-text-preview">
            {resource.extractedText.length > 1400
              ? `${resource.extractedText.slice(0, 1400)}...`
              : resource.extractedText}
          </pre>
        </div>
      ) : null}
    </article>
  );
};

const LectureViewer = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, setCurrentUser } = useAuth();
  const lectureList = useMemo(
    () => location.state?.lectures || [],
    [location.state?.lectures]
  );
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
    {
      role: "assistant",
      content:
        "Ask for practice MCQs or doubts from this lecture and I will stay grounded in the lecture context.",
      mcqs: [],
    },
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantStatus, setAssistantStatus] = useState("");
  const [isSendingAssistant, setIsSendingAssistant] = useState(false);
  const [isRefreshingAi, setIsRefreshingAi] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [courseOutline, setCourseOutline] = useState(null);
  const [outlineModules, setOutlineModules] = useState([]);
  const [outlineLectures, setOutlineLectures] = useState({});
  const [openOutlineModule, setOpenOutlineModule] = useState("");
  const [outlineLoading, setOutlineLoading] = useState(true);
  const [outlineError, setOutlineError] = useState("");

  const currentIndex = lectureList.findIndex((item) => item._id === lectureId);
  const nextLecture = lectureList[currentIndex + 1];

  useEffect(() => {
    const loadLecture = async () => {
      try {
        const requests = [API.get(`/lectures/single/${lectureId}`)];

        if (isAuthenticated && user?.role === "student") {
          requests.push(API.get(`/notes/lecture/${lectureId}`));
        }

        const responses = await Promise.all(requests);
        const loadedLecture = responses[0].data;
        setLecture(loadedLecture);
        setTranscriptOnlyMode(
          user?.preferredMode === "low-bandwidth" &&
            Boolean(loadedLecture.transcript?.text)
        );

        if (responses[1]?.data?.content) {
          setNote(responses[1].data.content);
        } else {
          setNote("");
        }
        if (loadedLecture?.moduleId) {
          setOutlineLoading(true);
          setOutlineError("");
          try {
            const moduleResponse = await API.get(
              `/modules/single/${loadedLecture.moduleId}`
            );
            const module = moduleResponse.data;

            if (module?.courseId) {
              const [courseResponse, modulesResponse] = await Promise.all([
                API.get(`/courses/${module.courseId}`),
                API.get(`/modules/${module.courseId}`),
              ]);
              setCourseOutline(courseResponse.data);
              setOutlineModules(modulesResponse.data);
              setOpenOutlineModule(module._id);

              const lectureEntries = await Promise.all(
                modulesResponse.data.map(async (moduleItem) => {
                  const lectureResponse = await API.get(
                    `/lectures/${moduleItem._id}`
                  );
                  return [moduleItem._id, lectureResponse.data];
                })
              );

              setOutlineLectures(Object.fromEntries(lectureEntries));
            }
          } catch (outlineError) {
            console.error("Failed to load lecture outline", outlineError);
            setOutlineModules([]);
            setOutlineLectures({});
            setOutlineError(
              outlineError.response?.data?.message ||
                "Course outline unavailable."
            );

            if (lectureList.length > 0) {
              const fallbackModuleId = "current-module";
              setOutlineModules([
                {
                  _id: fallbackModuleId,
                  title: "Current Module",
                },
              ]);
              setOutlineLectures({
                [fallbackModuleId]: lectureList,
              });
              setOpenOutlineModule(fallbackModuleId);
              setOutlineError("Showing current module only.");
            }
          } finally {
            setOutlineLoading(false);
          }
        }
      } catch (err) {
        const offlineData = await findOfflineLecture(lectureId);
        if (offlineData?.lecture) {
          setLecture(offlineData.lecture);
          setTranscriptOnlyMode(
            user?.preferredMode === "low-bandwidth" &&
              Boolean(offlineData.lecture.transcript?.text)
          );
          setCourseOutline(offlineData.course);
          setOutlineModules([offlineData.module]);
          setOutlineLectures({
            [offlineData.module._id]: offlineData.lectures,
          });
          setOpenOutlineModule(offlineData.module._id);
          setOutlineLoading(false);
          return;
        }
        setError(err.response?.data?.message || "Failed to load lecture");
      }
    };

    loadLecture();

    localStorage.setItem(`lecture-${lectureId}`, "done");
  }, [lectureId, isAuthenticated, lectureList, user?.preferredMode, user?.role]);

  useEffect(() => {
    if (
      lecture?.aiSummary?.status !== "processing" &&
      lecture?.aiMcqs?.status !== "processing" &&
      lecture?.transcript?.status !== "processing"
    ) {
      return undefined;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await API.get(`/lectures/single/${lectureId}`);
        setLecture(response.data);
      } catch {
        window.clearInterval(intervalId);
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [
    lecture?.aiSummary?.status,
    lecture?.aiMcqs?.status,
    lecture?.transcript?.status,
    lectureId,
  ]);

  const handleMarkComplete = async () => {
    setCompletionMessage("");
    setIsMarkingComplete(true);

    try {
      const response = await API.post(`/progress/lecture/${lectureId}/complete`, {
        completed: true,
      });

      if (response.data.student && user) {
        setCurrentUser({
          ...user,
          streakCount: response.data.student.streakCount,
          lastActiveAt: response.data.student.lastActiveAt,
        });
      }

      setCompletionMessage("Lecture marked as completed.");
    } catch (err) {
      setCompletionMessage(
        err.response?.data?.message || "Failed to update lecture progress"
      );
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleSaveNote = async () => {
    setNoteMessage("");
    setIsSavingNote(true);

    try {
      const response = await API.put(`/notes/lecture/${lectureId}`, { content: note });

      if (response.data.student && user) {
        setCurrentUser({
          ...user,
          streakCount: response.data.student.streakCount,
          lastActiveAt: response.data.student.lastActiveAt,
        });
      }

      setNoteMessage("Your note was saved.");
    } catch (err) {
      setNoteMessage(err.response?.data?.message || "Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleAssistantSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setAssistantStatus("Sign in to use the lecture AI assistant.");
      return;
    }

    if (!assistantInput.trim()) {
      return;
    }

    const nextMessages = [
      ...assistantMessages,
      {
        role: "user",
        content: assistantInput.trim(),
      },
    ];

    setAssistantMessages(nextMessages);
    setAssistantInput("");
    setAssistantStatus("");
    setIsSendingAssistant(true);

    try {
      const response = await API.post(`/lectures/single/${lectureId}/ai-chat`, {
        messages: nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      });

      setAssistantMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            response.data.reply ||
            "I could not produce a grounded answer for that request.",
          mcqs: response.data.mcqs || [],
        },
      ]);
    } catch (err) {
      setAssistantStatus(
        err.response?.data?.message || "AI assistant is unavailable right now."
      );
    } finally {
      setIsSendingAssistant(false);
    }
  };

  const handleRefreshAi = async () => {
    setIsRefreshingAi(true);
    setAssistantStatus("");

    try {
              await API.post(`/lectures/single/${lectureId}/ai-refresh`);
              setLecture((current) =>
                current
                  ? {
                      ...current,
                      aiSummary: {
                        ...current.aiSummary,
                        status: "processing",
                      },
                      aiMcqs: {
                        ...current.aiMcqs,
                        status: "processing",
                      },
                    }
                  : current
              );
      setAssistantStatus("AI refresh started for this lecture.");
    } catch (err) {
      setAssistantStatus(
        err.response?.data?.message || "Failed to refresh lecture AI."
      );
    } finally {
      setIsRefreshingAi(false);
    }
  };

  if (error) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="form-error">{error}</p>
        </section>
      </AppShell>
    );
  }

  if (!lecture) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="status-text">Loading lecture...</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="page-section page-wide">
        <div className="lecture-page-layout">
          <aside className="lecture-sidebar">
            <button
              type="button"
              className="btn btn-secondary btn-inline lecture-sidebar-back"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <div className="lecture-sidebar-card">
              <div className="builder-header">
                <div>
                  <span className="card-badge">Course</span>
                  <h3>{courseOutline?.title || "Course outline"}</h3>
                </div>
              </div>
              <p className="meta-text">
                {courseOutline?.description ||
                  "Navigate through modules and lectures."}
              </p>
            </div>
            <div className="lecture-sidebar-card">
              {outlineLoading ? (
                <p className="meta-text">Loading course outline...</p>
              ) : outlineError ? (
                <p className="meta-text">{outlineError}</p>
              ) : outlineModules.length === 0 ? (
                <p className="meta-text">Course outline unavailable.</p>
              ) : (
                outlineModules.map((moduleItem) => {
                  const moduleLectures = outlineLectures[moduleItem._id] || [];
                  const isOpen = openOutlineModule === moduleItem._id;

                  return (
                    <div key={moduleItem._id} className="outline-module">
                      <button
                        type="button"
                        className="module-toggle outline-toggle"
                        onClick={() =>
                          setOpenOutlineModule(
                            isOpen ? "" : moduleItem._id
                          )
                        }
                      >
                        <span>{moduleItem.title}</span>
                        <span>{isOpen ? "Hide" : "View"}</span>
                      </button>
                      {isOpen ? (
                        <div className="module-lectures">
                          {moduleLectures.length === 0 ? (
                            <p className="meta-text">No lectures yet.</p>
                          ) : (
                            moduleLectures.map((moduleLecture) => (
                              <button
                                key={moduleLecture._id}
                                type="button"
                                className={`lecture-link outline-lecture-link ${
                                  moduleLecture._id === lectureId
                                    ? "outline-lecture-active"
                                    : ""
                                }`}
                                onClick={() =>
                                  navigate(`/lecture/${moduleLecture._id}`, {
                                    state: { lectures: moduleLectures },
                                  })
                                }
                              >
                                {moduleLecture.title}
                              </button>
                            ))
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </aside>
          <div className="lecture-main">
            <div className="content-card lecture-card">
              <span className="eyebrow">Lecture</span>
              <h1>{lecture.title}</h1>
              <div>
              {lecture.aiSummary?.status === "ready" ? (
                <div className="resource-card ai-summary-card">
                  <div className="builder-header">
                    <div>
                      <span className="card-badge">AI Summary</span>
                      <h3>Quick revision snapshot</h3>
                    </div>
                    {lecture.aiSummary.generatedAt ? (
                      <span className="meta-text">
                        Updated {new Date(lecture.aiSummary.generatedAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <p>{lecture.aiSummary.text}</p>
                  {lecture.aiSummary.keyPoints?.length ? (
                    <div className="stack-list">
                      {lecture.aiSummary.keyPoints.map((point, index) => (
                        <span key={`${point}-${index}`} className="meta-pill">
                          {point}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {lecture.aiSummary?.status === "processing" ? (
                <p className="meta-text">
                  AI summary is being generated for this lecture.
                </p>
              ) : null}
              {lecture.aiSummary?.status === "failed" ? (
                <p className="meta-text">
                  AI summary failed: {lecture.aiSummary.error || "Try again later."}
                </p>
              ) : null}
              {lecture.aiMcqs?.status === "processing" ? (
                <p className="meta-text">
                  AI practice MCQs are being generated for this lecture.
                </p>
              ) : null}
              {lecture.aiMcqs?.status === "failed" ? (
                <p className="meta-text">
                  AI MCQ generation failed: {lecture.aiMcqs.error || "Try again later."}
                </p>
              ) : null}
              {lecture.transcript?.text ? (
                <div className="builder-subsection">
                  <div className="builder-header">
                    <div>
                      <span className="card-badge">Transcript</span>
                      <h3>Low-bandwidth reading mode</h3>
                    </div>
                    {lecture.contents?.some((item) => item.type === "video") ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-inline"
                        onClick={() =>
                          setTranscriptOnlyMode((current) => !current)
                        }
                      >
                        {transcriptOnlyMode ? "Show Video" : "Text-Only Mode"}
                      </button>
                    ) : null}
                  </div>
                  <div className="resource-preview-wrap">
                    <pre className="resource-text-preview">
                      {lecture.transcript.text}
                    </pre>
                  </div>
                </div>
              ) : null}
              {(user?.role === "teacher" || user?.role === "admin") ? (
                <div className="action-row">
                  <button
                    type="button"
                    className="btn btn-secondary btn-inline"
                    onClick={handleRefreshAi}
                    disabled={isRefreshingAi}
                  >
                    {isRefreshingAi ? "Refreshing AI..." : "Refresh AI"}
                  </button>
                  {assistantStatus ? (
                    <p className="meta-text">{assistantStatus}</p>
                  ) : null}
                </div>
              ) : null}
              <div className="lecture-content">
                {lecture.contents
              ?.slice()
              .sort((a, b) => a.order - b.order)
              .map((item, index) => {
                if (item.type === "text") {
                  return <p key={index}>{item.data}</p>;
                }

                if (item.type === "image") {
                  const showImage = user?.preferredMode !== "low-bandwidth" || visibleImages[index];

                  if (!showImage) {
                    return (
                      <button
                        key={index}
                        type="button"
                        className="btn btn-secondary btn-inline"
                        onClick={() =>
                          setVisibleImages((current) => ({
                            ...current,
                            [index]: true,
                          }))
                        }
                      >
                        Load image
                      </button>
                    );
                  }

                  return (
                    <img
                      key={index}
                      src={item.url}
                      alt="Lecture content"
                      className="lecture-image"
                      loading="lazy"
                    />
                  );
                }

                if (item.type === "video") {
                  if (transcriptOnlyMode && lecture.transcript?.text) {
                    return null;
                  }

                  return (
                    <VideoComparison
                      key={index}
                      item={item}
                      preferredMode={user?.preferredMode}
                    />
                  );
                }

                return null;
              })}
              </div>
              {lecture.aiMcqs?.status === "ready" && lecture.aiMcqs.questions?.length ? (
                <div className="builder-subsection">
                  <div className="builder-header">
                    <div>
                      <span className="card-badge">AI Practice</span>
                      <h3>Stored MCQs (5)</h3>
                    </div>
                    {lecture.aiMcqs.generatedAt ? (
                      <span className="meta-text">
                        Updated {new Date(lecture.aiMcqs.generatedAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <div className="stack-list">
                    {lecture.aiMcqs.questions.map((mcq, index) => (
                      <article key={`${mcq.question}-${index}`} className="question-builder">
                        <strong>
                          Q{index + 1}. {mcq.question}
                        </strong>
                        <div className="stack-list">
                          {mcq.options.map((option, optionIndex) => (
                            <span key={`${option}-${optionIndex}`} className="meta-text">
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </span>
                          ))}
                        </div>
                        <p className="meta-text">
                          Correct: {String.fromCharCode(65 + (mcq.correctAnswer || 0))}
                        </p>
                        {mcq.explanation ? (
                          <p className="meta-text">{mcq.explanation}</p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
              </div>
          {lecture.resources?.length ? (
            <div className="builder-subsection">
              <h3>Resources</h3>
              <div className="stack-list">
                {lecture.resources.map((resource, index) => (
                  <ResourcePreview
                    key={`${resource.url}-${index}`}
                    resource={resource}
                  />
                ))}
              </div>
            </div>
          ) : null}
          {isAuthenticated && user?.role === "student" ? (
            <div className="builder-subsection">
              <h3>My Notes</h3>
              <textarea
                className="input input-textarea"
                placeholder="Write key takeaways, reminders, or questions for later."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <div className="action-row">
                <button
                  type="button"
                  className="btn btn-inline"
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                >
                  {isSavingNote ? "Saving note..." : "Save Note"}
                </button>
                <span className="meta-pill">
                  Current streak: {user?.streakCount ?? 0} day{(user?.streakCount ?? 0) === 1 ? "" : "s"}
                </span>
                {noteMessage ? <p className="meta-text">{noteMessage}</p> : null}
              </div>
            </div>
          ) : null}
          {isAuthenticated && user?.role === "student" ? (
            <div className="action-row">
              <button
                type="button"
                className="btn btn-inline"
                onClick={handleMarkComplete}
                disabled={isMarkingComplete}
              >
                {isMarkingComplete ? "Saving..." : "Mark as Complete"}
              </button>
              {completionMessage ? (
                <p className="meta-text">{completionMessage}</p>
              ) : null}
            </div>
          ) : null}
          {user?.preferredMode === "low-bandwidth" ? (
            <p className="meta-text">
              Low-bandwidth mode is enabled. Images load only when you choose to view them.
            </p>
          ) : null}
          {nextLecture ? (
            <button
              type="button"
              className="btn btn-inline"
              onClick={() =>
                navigate(`/lecture/${nextLecture._id}`, {
                  state: { lectures: lectureList },
                })
              }
            >
              Next Lecture
            </button>
          ) : null}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn lecture-ai-toggle"
          onClick={() => setIsAssistantOpen((current) => !current)}
        >
          {isAssistantOpen ? "Close AI" : "Open AI"}
        </button>
        {isAssistantOpen ? (
          <div
            className="lecture-ai-overlay"
            onClick={() => setIsAssistantOpen(false)}
            role="presentation"
          >
            <aside
              className="resource-card lecture-ai-drawer"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="builder-header">
                <div>
                  <span className="card-badge">AI Practice</span>
                  <h3>Lecture MCQ Assistant</h3>
                </div>
                <div className="action-row">
                  <span className="meta-text">AI Assistant</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-inline"
                    onClick={() => setIsAssistantOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
              {!isAuthenticated ? (
                <p className="meta-text">
                  Sign in to ask questions and generate lecture MCQs.
                </p>
              ) : null}
              <div className="lecture-chat-feed">
                {assistantMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`lecture-chat-bubble ${
                      message.role === "assistant"
                        ? "lecture-chat-bubble-assistant"
                        : "lecture-chat-bubble-user"
                    }`}
                  >
                    <strong>{message.role === "assistant" ? "AI" : "You"}</strong>
                    <p>{message.content}</p>
                    {message.mcqs?.length ? (
                      <div className="stack-list">
                        {message.mcqs.map((mcq, mcqIndex) => (
                          <div key={`${mcq.question}-${mcqIndex}`} className="question-builder">
                            <strong>{mcq.question}</strong>
                            <div className="stack-list">
                              {mcq.options.map((option, optionIndex) => (
                                <span key={`${option}-${optionIndex}`} className="meta-text">
                                  {String.fromCharCode(65 + optionIndex)}. {option}
                                </span>
                              ))}
                            </div>
                            <p className="meta-text">
                              Correct: {String.fromCharCode(65 + (mcq.correctAnswer || 0))}
                            </p>
                            {mcq.explanation ? (
                              <p className="meta-text">{mcq.explanation}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <form className="form-stack" onSubmit={handleAssistantSubmit}>
                <textarea
                  className="input input-textarea"
                  placeholder="Ask for practice MCQs, revision questions, or doubts from this lecture."
                  value={assistantInput}
                  onChange={(event) => setAssistantInput(event.target.value)}
                  disabled={!isAuthenticated}
                />
                <div className="action-row">
                  <button
                    type="submit"
                    className="btn btn-inline"
                    disabled={isSendingAssistant || !isAuthenticated}
                  >
                    {isSendingAssistant ? "Thinking..." : "Ask AI"}
                  </button>
                  {assistantStatus ? (
                    <p className="meta-text">{assistantStatus}</p>
                  ) : null}
                </div>
              </form>
            </aside>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
};

export default LectureViewer;
