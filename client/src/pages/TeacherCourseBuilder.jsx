import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import AppShell from "../layouts/AppShell";

const emptyModuleForm = { title: "", order: 1 };
const emptyLectureForm = {
  title: "",
  order: 1,
  textContent: "",
  imageUrl: "",
  imagePublicLabel: "",
  imageFileName: "",
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
  resourceTitle: "",
  resourceUrl: "",
  resourceType: "file",
  resourcePublicLabel: "",
  resourceFileName: "",
  resourceExtractedText: "",
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

const VIDEO_UPLOAD_LIMIT_BYTES = 1024 * 1024 * 1024;

const formatFileSize = (bytes) => {
  if (!bytes) {
    return "0 B";
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

const clampProgress = (value) =>
  Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

const TeacherCourseBuilder = () => {
  const { courseId } = useParams();
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

  const setModuleProgress = (moduleId, nextProgress) => {
    setUploadProgressByModule((current) => ({
      ...current,
      [moduleId]: {
        ...current[moduleId],
        ...nextProgress,
      },
    }));
  };

  const buildLecturePayload = (form, moduleId) => {
    const contents = [];

    if (form.textContent.trim()) {
      contents.push({
        type: "text",
        data: form.textContent.trim(),
        order: 1,
      });
    }

    if (form.imageUrl.trim()) {
      contents.push({
        type: "image",
        url: form.imageUrl.trim(),
        order: contents.length + 1,
      });
    }

    if (form.videoUrl.trim()) {
      contents.push({
        type: "video",
        url: form.videoUrl.trim(),
        optimizedUrl: form.videoOptimizedUrl.trim(),
        audioOnlyUrl: form.videoAudioOnlyUrl.trim(),
        thumbnailUrl: form.videoThumbnailUrl.trim(),
        codec: form.videoCodec || "",
        duration: Number(form.videoDuration) || 0,
        originalSize: Number(form.videoOriginalSize) || 0,
        optimizedSize: Number(form.videoOptimizedSize) || 0,
        audioOnlySize: Number(form.videoAudioOnlySize) || 0,
        isLowBandwidthOptimized: Boolean(form.videoLowBandwidthOptimized),
        order: contents.length + 1,
      });
    }

    return {
      moduleId,
      title: form.title,
      order: Number(form.order),
      contents,
      resources:
        form.resourceTitle.trim() && form.resourceUrl.trim()
          ? [
              {
                title: form.resourceTitle.trim(),
                url: form.resourceUrl.trim(),
                type: form.resourceType || "file",
                originalFilename: form.resourceFileName || "",
                extractedText: form.resourceExtractedText || "",
              },
            ]
          : [],
    };
  };

  const hydrateLectureForm = (lecture) => {
    const textItem = lecture.contents?.find((item) => item.type === "text");
    const imageItem = lecture.contents?.find((item) => item.type === "image");
    const videoItem = lecture.contents?.find((item) => item.type === "video");

    return {
      title: lecture.title,
      order: lecture.order,
      textContent: textItem?.data || "",
      imageUrl: imageItem?.url || "",
      imagePublicLabel: imageItem?.url ? "Image attached" : "",
      imageFileName: "",
      videoUrl: videoItem?.url || "",
      videoOptimizedUrl: videoItem?.optimizedUrl || "",
      videoAudioOnlyUrl: videoItem?.audioOnlyUrl || "",
      videoThumbnailUrl: videoItem?.thumbnailUrl || "",
      videoPublicLabel: videoItem?.url ? "Video attached" : "",
      videoFileName: "",
      videoSelectedSize: videoItem?.originalSize || 0,
      videoCodec: videoItem?.codec || "",
      videoDuration: videoItem?.duration || 0,
      videoOriginalSize: videoItem?.originalSize || 0,
      videoOptimizedSize: videoItem?.optimizedSize || 0,
      videoAudioOnlySize: videoItem?.audioOnlySize || 0,
      videoLowBandwidthOptimized: Boolean(videoItem?.isLowBandwidthOptimized),
      resourceTitle: lecture.resources?.[0]?.title || "",
      resourceUrl: lecture.resources?.[0]?.url || "",
      resourceType: lecture.resources?.[0]?.type || "file",
      resourcePublicLabel: lecture.resources?.[0]?.title || "",
      resourceFileName: "",
      resourceExtractedText: lecture.resources?.[0]?.extractedText || "",
    };
  };

  const getQuizForm = (moduleId) => quizForms[moduleId] || emptyQuizForm;

  const updateQuizForm = (moduleId, field, value) => {
    setQuizForms((current) => ({
      ...current,
      [moduleId]: {
        ...getQuizForm(moduleId),
        [field]: value,
      },
    }));
  };

  const updateQuizQuestion = (moduleId, questionIndex, field, value) => {
    setQuizForms((current) => {
      const currentForm = current[moduleId] || emptyQuizForm;

      return {
        ...current,
        [moduleId]: {
          ...currentForm,
          questions: currentForm.questions.map((question, index) =>
            index === questionIndex
              ? {
                  ...question,
                  [field]: value,
                }
              : question
          ),
        },
      };
    });
  };

  const addQuizQuestion = (moduleId) => {
    setQuizForms((current) => {
      const currentForm = current[moduleId] || emptyQuizForm;

      return {
        ...current,
        [moduleId]: {
          ...currentForm,
          questions: [
            ...currentForm.questions,
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
        },
      };
    });
  };

  const removeQuizQuestion = (moduleId, questionIndex) => {
    setQuizForms((current) => {
      const currentForm = current[moduleId] || emptyQuizForm;
      const nextQuestions = currentForm.questions.filter(
        (_, index) => index !== questionIndex
      );

      return {
        ...current,
        [moduleId]: {
          ...currentForm,
          questions:
            nextQuestions.length > 0 ? nextQuestions : emptyQuizForm.questions,
        },
      };
    });
  };

  const buildQuizPayload = (moduleId, form) => ({
    moduleId,
    title: form.title,
    description: form.description,
    passingScore: Number(form.passingScore),
    timeLimitMinutes: Number(form.timeLimitMinutes),
    questions: form.questions.map((question) => ({
      questionText: question.questionText,
      options: [
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
      ],
      correctAnswer: Number(question.correctAnswer),
      explanation: question.explanation,
    })),
  });

  const hydrateQuizForm = (quiz) => ({
    title: quiz.title,
    description: quiz.description || "",
    passingScore: quiz.passingScore ?? 50,
    timeLimitMinutes: quiz.timeLimitMinutes ?? 0,
    questions:
      quiz.questions?.map((question) => ({
        questionText: question.questionText || "",
        optionA: question.options?.[0] || "",
        optionB: question.options?.[1] || "",
        optionC: question.options?.[2] || "",
        optionD: question.options?.[3] || "",
        correctAnswer: question.correctAnswer ?? 0,
        explanation: question.explanation || "",
      })) || emptyQuizForm.questions,
  });

  const fetchCourseData = async () => {
    setLoading(true);
    setError("");

    try {
      const [courseResponse, modulesResponse] = await Promise.all([
        API.get(`/courses/${courseId}`),
        API.get(`/modules/${courseId}`),
      ]);

      setCourse(courseResponse.data);
      setModules(modulesResponse.data);

      const lectureEntries = await Promise.all(
        modulesResponse.data.map(async (moduleItem) => {
          const lectureResponse = await API.get(`/lectures/${moduleItem._id}`);
          return [moduleItem._id, lectureResponse.data];
        })
      );
      const quizEntries = await Promise.all(
        modulesResponse.data.map(async (moduleItem) => {
          const quizResponse = await API.get(`/quizzes/module/${moduleItem._id}`);
          return [moduleItem._id, quizResponse.data];
        })
      );

      setLecturesByModule(Object.fromEntries(lectureEntries));
      setQuizzesByModule(Object.fromEntries(quizEntries));

      const flattenedQuizzes = quizEntries.flatMap(([, items]) => items);
      const attemptEntries = await Promise.all(
        flattenedQuizzes.map(async (quiz) => {
          const attemptResponse = await API.get(`/quiz-attempts/quiz/${quiz._id}`);
          return [quiz._id, attemptResponse.data];
        })
      );

      setAttemptsByQuiz(Object.fromEntries(attemptEntries));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load course builder");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
    // The builder reloads when the selected course changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(
    () => () => {
      Object.keys(videoPollingRefs.current).forEach((moduleId) => {
        stopVideoPolling(moduleId);
      });
    },
    []
  );

  const handleModuleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatusMessage("");

    try {
      if (editingModuleId) {
        await API.put(`/modules/${editingModuleId}`, {
          title: moduleForm.title,
          order: Number(moduleForm.order),
        });
        setStatusMessage("Module updated successfully.");
      } else {
        await API.post("/modules", {
          courseId,
          title: moduleForm.title,
          order: Number(moduleForm.order),
        });
        setStatusMessage("Module created successfully.");
      }

      setModuleForm(emptyModuleForm);
      setEditingModuleId(null);
      await fetchCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save module");
    }
  };

  const startModuleEdit = (moduleItem) => {
    setEditingModuleId(moduleItem._id);
    setModuleForm({
      title: moduleItem.title,
      order: moduleItem.order,
    });
  };

  const deleteModule = async (moduleId) => {
    setError("");
    setStatusMessage("");

    try {
      await API.delete(`/modules/${moduleId}`);
      setStatusMessage("Module deleted successfully.");
      await fetchCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete module");
    }
  };

  const getLectureForm = (moduleId) =>
    lectureForms[moduleId] || emptyLectureForm;

  const updateLectureForm = (moduleId, field, value) => {
    setLectureForms((current) => ({
      ...current,
      [moduleId]: {
        ...getLectureForm(moduleId),
        [field]: value,
      },
    }));
  };

  const applyVideoUploadResult = (moduleId, payload, fallbackFile) => {
    setLectureForms((current) => ({
      ...current,
      [moduleId]: {
        ...getLectureForm(moduleId),
        videoUrl: payload?.url || "",
        videoOptimizedUrl: payload?.optimizedUrl || "",
        videoAudioOnlyUrl: payload?.audioOnlyUrl || "",
        videoThumbnailUrl: payload?.thumbnailUrl || "",
        videoPublicLabel:
          payload?.originalFilename || fallbackFile?.name || "Video attached",
        videoFileName: fallbackFile?.name || payload?.originalFilename || "",
        videoSelectedSize: fallbackFile?.size || payload?.bytes || 0,
        videoCodec: payload?.codec || "",
        videoDuration: payload?.duration || 0,
        videoOriginalSize: payload?.bytes || fallbackFile?.size || 0,
        videoOptimizedSize: payload?.optimizedBytes || 0,
        videoAudioOnlySize: payload?.audioOnlyBytes || 0,
        videoLowBandwidthOptimized: Boolean(
          payload?.isLowBandwidthOptimized
        ),
      },
    }));
  };

  const beginVideoStatusPolling = (moduleId, jobId, file) => {
    stopVideoPolling(moduleId);

    videoPollingRefs.current[moduleId] = window.setInterval(async () => {
      try {
        const response = await API.get(`/uploads/video/status/${jobId}`);
        const job = response.data;

        setUploadStatusByModule((current) => ({
          ...current,
          [moduleId]:
            job.message || "Processing adaptive media for this lecture...",
        }));
        setModuleProgress(moduleId, {
          active: job.status === "processing",
          phase: job.status,
          percent: clampProgress(job.progress || 40),
        });

        if (job.status === "ready") {
          stopVideoPolling(moduleId);
          applyVideoUploadResult(moduleId, job.result, file);
          setStatusMessage("Video uploaded and optimized successfully.");
          setUploadStatusByModule((current) => ({
            ...current,
            [moduleId]: "Video ready to save with the lecture.",
          }));
          setModuleProgress(moduleId, {
            active: false,
            phase: "ready",
            percent: 100,
          });
        }

        if (job.status === "failed") {
          stopVideoPolling(moduleId);
          applyVideoUploadResult(moduleId, job.result, file);
          setError(job.error || "Video optimization failed");
          setUploadStatusByModule((current) => ({
            ...current,
            [moduleId]:
              job.message ||
              "Original video uploaded, but optimization failed.",
          }));
          setModuleProgress(moduleId, {
            active: false,
            phase: "failed",
            percent: 100,
          });
        }
      } catch (err) {
        stopVideoPolling(moduleId);
        setError(
          err.response?.data?.message || "Failed to track video processing"
        );
        setUploadStatusByModule((current) => ({
          ...current,
          [moduleId]: "Video processing status could not be refreshed.",
        }));
        setModuleProgress(moduleId, {
          active: false,
          phase: "failed",
          percent: 100,
        });
      }
    }, 2000);
  };

  const clearLectureAsset = (moduleId, type) => {
    const currentForm = getLectureForm(moduleId);

    if (type === "image") {
      setLectureForms((current) => ({
        ...current,
        [moduleId]: {
          ...currentForm,
          imageUrl: "",
          imagePublicLabel: "",
          imageFileName: "",
        },
      }));
      return;
    }

    if (type === "video") {
      stopVideoPolling(moduleId);
      setLectureForms((current) => ({
        ...current,
        [moduleId]: {
          ...currentForm,
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
        },
      }));
      setUploadStatusByModule((current) => ({
        ...current,
        [moduleId]: "",
      }));
      setModuleProgress(moduleId, {
        active: false,
        phase: "idle",
        percent: 0,
      });
      return;
    }

    setLectureForms((current) => ({
      ...current,
      [moduleId]: {
        ...currentForm,
        resourceTitle: "",
        resourceUrl: "",
        resourceType: "file",
        resourcePublicLabel: "",
        resourceFileName: "",
        resourceExtractedText: "",
      },
    }));
  };

  const uploadLectureAsset = async (moduleId, file, type) => {
    if (!file) {
      return;
    }

    if (type === "video") {
      stopVideoPolling(moduleId);
    }

    const formData = new FormData();
    formData.append("file", file);
    if (type === "video") {
      setLectureForms((current) => ({
        ...current,
        [moduleId]: {
          ...getLectureForm(moduleId),
          videoPublicLabel: file.name,
          videoFileName: file.name,
          videoSelectedSize: file.size,
        },
      }));
      setModuleProgress(moduleId, {
        active: true,
        phase: "uploading",
        percent: 0,
      });
    }

    setUploadStatusByModule((current) => ({
      ...current,
      [moduleId]: "Uploading file...",
    }));
    setError("");
    setStatusMessage("");

    try {
      const endpoint =
        type === "image"
          ? "/uploads/image"
          : type === "video"
            ? "/uploads/video"
            : "/uploads/resource";
      const response = await API.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress:
          type === "video"
            ? (progressEvent) => {
                if (!progressEvent.total) {
                  return;
                }

                const uploadPercent = Math.round(
                  (progressEvent.loaded / progressEvent.total) * 35
                );

                setModuleProgress(moduleId, {
                  active: true,
                  phase: "uploading",
                  percent: clampProgress(uploadPercent),
                });
              }
            : undefined,
      });

      if (type === "image") {
        setLectureForms((current) => ({
          ...current,
          [moduleId]: {
            ...getLectureForm(moduleId),
            imageUrl: response.data.url,
            imagePublicLabel: response.data.originalFilename || file.name,
            imageFileName: file.name,
          },
        }));
        setStatusMessage("Image uploaded successfully.");
        setUploadStatusByModule((current) => ({
          ...current,
          [moduleId]: "Image ready to save with the lecture.",
        }));
        return;
      }

      if (type === "video") {
        applyVideoUploadResult(moduleId, response.data, file);
        setUploadStatusByModule((current) => ({
          ...current,
          [moduleId]:
            response.data.message ||
            "Upload complete. Preparing H.264 optimization...",
        }));
        setModuleProgress(moduleId, {
          active: true,
          phase: "processing",
          percent: clampProgress(response.data.progress || 38),
        });
        beginVideoStatusPolling(moduleId, response.data.jobId, file);
        setUploadStatusByModule((current) => ({
          ...current,
          [moduleId]:
            response.data.message ||
            "Upload complete. Preparing H.264 optimization...",
        }));
        return;
      }

      setLectureForms((current) => ({
        ...current,
        [moduleId]: {
          ...getLectureForm(moduleId),
          resourceTitle:
            getLectureForm(moduleId).resourceTitle || response.data.originalFilename,
          resourceUrl: response.data.url,
          resourceType: response.data.type || "file",
          resourcePublicLabel: response.data.originalFilename || file.name,
          resourceFileName: file.name,
          resourceExtractedText: response.data.extractedText || "",
        },
      }));
      setStatusMessage("Resource uploaded successfully.");
      setUploadStatusByModule((current) => ({
        ...current,
        [moduleId]: "Resource ready to save with the lecture.",
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload file");
      setUploadStatusByModule((current) => ({
        ...current,
        [moduleId]: "Upload failed. Try again.",
      }));
      if (type === "video") {
        setModuleProgress(moduleId, {
          active: false,
          phase: "failed",
          percent: 100,
        });
      }
    }
  };

  const handleLectureSubmit = async (event, moduleId) => {
    event.preventDefault();
    setError("");
    setStatusMessage("");

    const form = getLectureForm(moduleId);

    try {
      if (editingLectureId) {
        await API.put(`/lectures/${editingLectureId}`, buildLecturePayload(form, moduleId));
        setStatusMessage("Lecture updated successfully.");
      } else {
        await API.post("/lectures", buildLecturePayload(form, moduleId));
        setStatusMessage("Lecture created successfully.");
      }

      setLectureForms((current) => ({
        ...current,
        [moduleId]: emptyLectureForm,
      }));
      stopVideoPolling(moduleId);
      setUploadStatusByModule((current) => ({
        ...current,
        [moduleId]: "",
      }));
      setModuleProgress(moduleId, {
        active: false,
        phase: "idle",
        percent: 0,
      });
      setEditingLectureId(null);
      await fetchCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save lecture");
    }
  };

  const startLectureEdit = (moduleId, lecture) => {
    setEditingLectureId(lecture._id);
    setLectureForms((current) => ({
      ...current,
      [moduleId]: hydrateLectureForm(lecture),
    }));
  };

  const deleteLecture = async (lectureId) => {
    setError("");
    setStatusMessage("");

    try {
      await API.delete(`/lectures/${lectureId}`);
      setStatusMessage("Lecture deleted successfully.");
      await fetchCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lecture");
    }
  };

  const handleQuizSubmit = async (event, moduleId) => {
    event.preventDefault();
    setError("");
    setStatusMessage("");

    const form = getQuizForm(moduleId);

    try {
      if (editingQuizId) {
        await API.put(`/quizzes/${editingQuizId}`, buildQuizPayload(moduleId, form));
        setStatusMessage("Quiz updated successfully.");
      } else {
        await API.post("/quizzes", buildQuizPayload(moduleId, form));
        setStatusMessage("Quiz created successfully.");
      }

      setQuizForms((current) => ({
        ...current,
        [moduleId]: emptyQuizForm,
      }));
      setEditingQuizId(null);
      await fetchCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save quiz");
    }
  };

  const startQuizEdit = (moduleId, quiz) => {
    setEditingQuizId(quiz._id);
    setQuizForms((current) => ({
      ...current,
      [moduleId]: hydrateQuizForm(quiz),
    }));
  };

  const deleteQuiz = async (quizId) => {
    setError("");
    setStatusMessage("");

    try {
      await API.delete(`/quizzes/${quizId}`);
      setStatusMessage("Quiz deleted successfully.");
      await fetchCourseData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete quiz");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="status-text">Loading builder...</p>
        </section>
      </AppShell>
    );
  }

  if (error && !course) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="form-error">{error}</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Course Builder</span>
            <h2>{course?.title}</h2>
          </div>
          <p className="page-subtitle">
            Add modules and lectures to structure the learning experience.
          </p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        {statusMessage ? <p className="status-text">{statusMessage}</p> : null}

        <div className="builder-layout">
          <article className="dashboard-card">
            <h3>{editingModuleId ? "Edit Module" : "New Module"}</h3>
            <form className="form-stack" onSubmit={handleModuleSubmit}>
              <input
                className="input"
                placeholder="Module title"
                value={moduleForm.title}
                onChange={(event) =>
                  setModuleForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
              <input
                className="input"
                type="number"
                min="1"
                placeholder="Order"
                value={moduleForm.order}
                onChange={(event) =>
                  setModuleForm((current) => ({
                    ...current,
                    order: event.target.value,
                  }))
                }
              />
              <div className="action-row">
                <button type="submit" className="btn btn-inline">
                  {editingModuleId ? "Update Module" : "Add Module"}
                </button>
                {editingModuleId ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-inline"
                    onClick={() => {
                      setEditingModuleId(null);
                      setModuleForm(emptyModuleForm);
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </article>

          <div className="stack-list">
            {modules.map((moduleItem) => {
              const lectureForm = getLectureForm(moduleItem._id);
              const lectures = lecturesByModule[moduleItem._id] || [];
              const quizForm = getQuizForm(moduleItem._id);
              const quizzes = quizzesByModule[moduleItem._id] || [];
              const moduleUploadProgress =
                uploadProgressByModule[moduleItem._id];
              const isLectureUploadInProgress = Boolean(
                moduleUploadProgress?.active
              );

              return (
                <article key={moduleItem._id} className="dashboard-card">
                  <div className="builder-header">
                    <div>
                      <span className="card-badge">Module {moduleItem.order}</span>
                      <h3>{moduleItem.title}</h3>
                    </div>
                    <div className="action-row">
                      <button
                        type="button"
                        className="btn btn-secondary btn-inline"
                        onClick={() => startModuleEdit(moduleItem)}
                      >
                        Edit Module
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-inline"
                        onClick={() => deleteModule(moduleItem._id)}
                      >
                        Delete Module
                      </button>
                    </div>
                  </div>

                  <div className="builder-subsection">
                    <h4>Lectures</h4>
                    <div className="stack-list">
                      {lectures.map((lecture) => (
                        <div key={lecture._id} className="builder-item">
                          <div>
                            <strong>
                              {lecture.order}. {lecture.title}
                            </strong>
                            <p className="meta-text">
                              {lecture.contents?.length || 0} content blocks
                            </p>
                            {lecture.contents?.some((item) => item.type === "video") ? (
                              <p className="meta-text">Includes adaptive video content</p>
                            ) : null}
                            <p className="meta-text">
                              Resources: {lecture.resources?.length || 0}
                            </p>
                          </div>
                          <div className="action-row">
                            <button
                              type="button"
                              className="btn btn-secondary btn-inline"
                              onClick={() => startLectureEdit(moduleItem._id, lecture)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-inline"
                              onClick={() => deleteLecture(lecture._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="builder-subsection">
                    <h4>
                      {editingLectureId ? "Edit Lecture" : "Add Lecture"}
                    </h4>
                    <form
                      className="form-stack"
                      onSubmit={(event) =>
                        handleLectureSubmit(event, moduleItem._id)
                      }
                    >
                      <input
                        className="input"
                        placeholder="Lecture title"
                        value={lectureForm.title}
                        onChange={(event) =>
                          updateLectureForm(
                            moduleItem._id,
                            "title",
                            event.target.value
                          )
                        }
                      />
                      <input
                        className="input"
                        type="number"
                        min="1"
                        placeholder="Order"
                        value={lectureForm.order}
                        onChange={(event) =>
                          updateLectureForm(
                            moduleItem._id,
                            "order",
                            event.target.value
                          )
                        }
                      />
                      <textarea
                        className="input input-textarea"
                        placeholder="Text content"
                        value={lectureForm.textContent}
                        onChange={(event) =>
                          updateLectureForm(
                            moduleItem._id,
                            "textContent",
                            event.target.value
                          )
                        }
                      />
                      <div className="question-builder">
                        <div className="builder-header">
                          <h5>Image</h5>
                          {lectureForm.imageUrl ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-inline"
                              onClick={() => clearLectureAsset(moduleItem._id, "image")}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <input
                          className="input"
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={(event) =>
                            uploadLectureAsset(
                              moduleItem._id,
                              event.target.files?.[0],
                              "image"
                            )
                          }
                        />
                        <p className="meta-text">
                          {lectureForm.imagePublicLabel || "No image attached yet."}
                        </p>
                      </div>
                      <div className="question-builder">
                        <div className="builder-header">
                          <h5>Video</h5>
                          {lectureForm.videoUrl ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-inline"
                              onClick={() => clearLectureAsset(moduleItem._id, "video")}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <input
                          className="input"
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
                          onChange={(event) =>
                            uploadLectureAsset(
                              moduleItem._id,
                              event.target.files?.[0],
                              "video"
                            )
                          }
                        />
                        <p className="meta-text">
                          {lectureForm.videoPublicLabel || "No video attached yet."}
                        </p>
                        <p className="meta-text">
                          Selected size: {formatFileSize(lectureForm.videoSelectedSize)} / Allowed: {formatFileSize(VIDEO_UPLOAD_LIMIT_BYTES)}
                        </p>
                        {moduleUploadProgress?.percent ? (
                          <div className="upload-progress">
                            <div className="upload-progress-header">
                              <span className="meta-text">
                                {uploadStatusByModule[moduleItem._id] ||
                                  "Preparing upload..."}
                              </span>
                              <strong>{moduleUploadProgress.percent}%</strong>
                            </div>
                            <div className="upload-progress-track">
                              <div
                                className={`upload-progress-fill ${
                                  moduleUploadProgress.phase === "failed"
                                    ? "is-error"
                                    : ""
                                }`}
                                style={{
                                  width: `${moduleUploadProgress.percent}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : null}
                        {lectureForm.videoLowBandwidthOptimized ? (
                          <p className="meta-text">
                            H.264 low-bandwidth delivery is ready for this video.
                          </p>
                        ) : null}
                        {lectureForm.videoDuration ? (
                          <p className="meta-text">
                            Duration: {Math.round(lectureForm.videoDuration)} seconds
                          </p>
                        ) : null}
                        {lectureForm.videoAudioOnlyUrl ? (
                          <p className="meta-text">
                            Audio-only rural mode ready.
                          </p>
                        ) : null}
                      </div>
                      <input
                        className="input"
                        placeholder="Resource title (optional)"
                        value={lectureForm.resourceTitle}
                        onChange={(event) =>
                          updateLectureForm(
                            moduleItem._id,
                            "resourceTitle",
                            event.target.value
                          )
                        }
                      />
                      <div className="question-builder">
                        <div className="builder-header">
                          <h5>Resource</h5>
                          {lectureForm.resourceUrl ? (
                            <button
                              type="button"
                              className="btn btn-secondary btn-inline"
                              onClick={() => clearLectureAsset(moduleItem._id, "resource")}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <input
                          className="input"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                          onChange={(event) =>
                            uploadLectureAsset(
                              moduleItem._id,
                              event.target.files?.[0],
                              "resource"
                            )
                          }
                        />
                        <p className="meta-text">
                          {lectureForm.resourcePublicLabel || "No resource attached yet."}
                        </p>
                        {lectureForm.resourceType !== "file" && lectureForm.resourceUrl ? (
                          <p className="meta-text">
                            Detected as {lectureForm.resourceType} resource.
                          </p>
                        ) : null}
                        {lectureForm.resourceExtractedText ? (
                          <div className="resource-preview-wrap">
                            <p className="meta-text">
                              Extracted text preview (used for AI summary and MCQs):
                            </p>
                            <pre className="resource-text-preview">
                              {lectureForm.resourceExtractedText.length > 1400
                                ? `${lectureForm.resourceExtractedText.slice(0, 1400)}...`
                                : lectureForm.resourceExtractedText}
                            </pre>
                          </div>
                        ) : null}
                      </div>
                      <div className="action-row">
                        {uploadStatusByModule[moduleItem._id] &&
                        !moduleUploadProgress?.percent ? (
                          <p className="meta-text">
                            {uploadStatusByModule[moduleItem._id]}
                          </p>
                        ) : null}
                        <button
                          type="submit"
                          className="btn btn-inline"
                          disabled={isLectureUploadInProgress}
                        >
                          {editingLectureId ? "Update Lecture" : "Add Lecture"}
                        </button>
                        {editingLectureId ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-inline"
                            onClick={() => {
                              stopVideoPolling(moduleItem._id);
                              setEditingLectureId(null);
                              setLectureForms((current) => ({
                                ...current,
                                [moduleItem._id]: emptyLectureForm,
                              }));
                              setUploadStatusByModule((current) => ({
                                ...current,
                                [moduleItem._id]: "",
                              }));
                              setModuleProgress(moduleItem._id, {
                                active: false,
                                phase: "idle",
                                percent: 0,
                              });
                            }}
                          >
                            Cancel
                          </button>
                        ) : null}
                      </div>
                    </form>
                  </div>

                  <div className="builder-subsection">
                    <h4>Quizzes</h4>
                    <div className="stack-list">
                      {quizzes.map((quiz) => (
                        <div key={quiz._id} className="builder-item">
                          <div>
                            <strong>{quiz.title}</strong>
                            <p className="meta-text">
                              Passing score: {quiz.passingScore}% | Questions: {quiz.questions?.length || 0}
                            </p>
                            <p className="meta-text">
                              Attempts: {attemptsByQuiz[quiz._id]?.length || 0}
                            </p>
                          </div>
                          <div className="action-row">
                            <button
                              type="button"
                              className="btn btn-secondary btn-inline"
                              onClick={() => startQuizEdit(moduleItem._id, quiz)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-inline"
                              onClick={() => deleteQuiz(quiz._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {quizzes.map((quiz) =>
                      attemptsByQuiz[quiz._id]?.length ? (
                        <div key={`${quiz._id}-attempts`} className="builder-subsection">
                          <h4>{quiz.title} Attempts</h4>
                          <div className="stack-list">
                            {attemptsByQuiz[quiz._id].slice(0, 5).map((attempt) => (
                              <div key={attempt._id} className="builder-item">
                                <div>
                                  <strong>{attempt.studentId?.name}</strong>
                                  <p className="meta-text">{attempt.studentId?.email}</p>
                                </div>
                                <p className="meta-text">
                                  Score: {attempt.score}% | {attempt.passed ? "Passed" : "Needs review"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>

                  <div className="builder-subsection">
                    <h4>{editingQuizId ? "Edit Quiz" : "Add Quiz"}</h4>
                    <form
                      className="form-stack"
                      onSubmit={(event) => handleQuizSubmit(event, moduleItem._id)}
                    >
                      <input
                        className="input"
                        placeholder="Quiz title"
                        value={quizForm.title}
                        onChange={(event) =>
                          updateQuizForm(moduleItem._id, "title", event.target.value)
                        }
                      />
                      <textarea
                        className="input input-textarea"
                        placeholder="Quiz description"
                        value={quizForm.description}
                        onChange={(event) =>
                          updateQuizForm(
                            moduleItem._id,
                            "description",
                            event.target.value
                          )
                        }
                      />
                      <input
                        className="input"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Passing score"
                        value={quizForm.passingScore}
                        onChange={(event) =>
                          updateQuizForm(
                            moduleItem._id,
                            "passingScore",
                            event.target.value
                          )
                        }
                      />
                      <input
                        className="input"
                        type="number"
                        min="0"
                        placeholder="Time limit in minutes"
                        value={quizForm.timeLimitMinutes}
                        onChange={(event) =>
                          updateQuizForm(
                            moduleItem._id,
                            "timeLimitMinutes",
                            event.target.value
                          )
                        }
                      />
                      <div className="stack-list">
                        {quizForm.questions.map((question, questionIndex) => (
                          <div key={questionIndex} className="question-builder">
                            <div className="builder-header">
                              <h5>Question {questionIndex + 1}</h5>
                              <button
                                type="button"
                                className="btn btn-secondary btn-inline"
                                onClick={() =>
                                  removeQuizQuestion(moduleItem._id, questionIndex)
                                }
                              >
                                Remove
                              </button>
                            </div>
                            <input
                              className="input"
                              placeholder="Question"
                              value={question.questionText}
                              onChange={(event) =>
                                updateQuizQuestion(
                                  moduleItem._id,
                                  questionIndex,
                                  "questionText",
                                  event.target.value
                                )
                              }
                            />
                            <input
                              className="input"
                              placeholder="Option A"
                              value={question.optionA}
                              onChange={(event) =>
                                updateQuizQuestion(
                                  moduleItem._id,
                                  questionIndex,
                                  "optionA",
                                  event.target.value
                                )
                              }
                            />
                            <input
                              className="input"
                              placeholder="Option B"
                              value={question.optionB}
                              onChange={(event) =>
                                updateQuizQuestion(
                                  moduleItem._id,
                                  questionIndex,
                                  "optionB",
                                  event.target.value
                                )
                              }
                            />
                            <input
                              className="input"
                              placeholder="Option C"
                              value={question.optionC}
                              onChange={(event) =>
                                updateQuizQuestion(
                                  moduleItem._id,
                                  questionIndex,
                                  "optionC",
                                  event.target.value
                                )
                              }
                            />
                            <input
                              className="input"
                              placeholder="Option D"
                              value={question.optionD}
                              onChange={(event) =>
                                updateQuizQuestion(
                                  moduleItem._id,
                                  questionIndex,
                                  "optionD",
                                  event.target.value
                                )
                              }
                            />
                            <select
                              className="input"
                              value={question.correctAnswer}
                              onChange={(event) =>
                                updateQuizQuestion(
                                  moduleItem._id,
                                  questionIndex,
                                  "correctAnswer",
                                  event.target.value
                                )
                              }
                            >
                              <option value={0}>Correct answer: Option A</option>
                              <option value={1}>Correct answer: Option B</option>
                              <option value={2}>Correct answer: Option C</option>
                              <option value={3}>Correct answer: Option D</option>
                            </select>
                            <textarea
                              className="input input-textarea"
                              placeholder="Explanation"
                              value={question.explanation}
                              onChange={(event) =>
                                updateQuizQuestion(
                                  moduleItem._id,
                                  questionIndex,
                                  "explanation",
                                  event.target.value
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                      <div className="action-row">
                        <button
                          type="button"
                          className="btn btn-secondary btn-inline"
                          onClick={() => addQuizQuestion(moduleItem._id)}
                        >
                          Add Question
                        </button>
                        <button type="submit" className="btn btn-inline">
                          {editingQuizId ? "Update Quiz" : "Add Quiz"}
                        </button>
                        {editingQuizId ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-inline"
                            onClick={() => {
                              setEditingQuizId(null);
                              setQuizForms((current) => ({
                                ...current,
                                [moduleItem._id]: emptyQuizForm,
                              }));
                            }}
                          >
                            Cancel
                          </button>
                        ) : null}
                      </div>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default TeacherCourseBuilder;
