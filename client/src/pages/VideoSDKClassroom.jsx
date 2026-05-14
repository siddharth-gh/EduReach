import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MeetingProvider, useMeeting, useParticipant, usePubSub } from "@videosdk.live/react-sdk";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const ParticipantView = ({ participantId }) => {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } = useParticipant(participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current.play().catch(() => {});
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#111", borderRadius: "12px", overflow: "hidden" }}>
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
      {webcamOn ? (
        <video
          autoPlay
          playsInline
          muted={isLocal}
          className="live-hero-video"
          ref={(video) => {
            if (video) video.srcObject = videoStream;
          }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div className="live-placeholder">
          <div className="live-placeholder-icon">👤</div>
          <p>{displayName}</p>
        </div>
      )}
      <div style={{ position: "absolute", bottom: "10px", left: "10px", background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "4px", color: "white", fontSize: "12px" }}>
        {displayName} {isLocal ? "(You)" : ""}
      </div>
    </div>
  );
};

const ParticipantItem = ({ participantId, isTeacherHost }) => {
  const { displayName, isLocal, remove } = useParticipant(participantId);
  return (
    <div className="flex items-center justify-between p-3 bg-surface/40 rounded-xl border border-gray-100/50 dark:border-gray-700/30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
          {displayName?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-secondary">
          {displayName} {isLocal && "(You)"}
        </span>
      </div>
      {isTeacherHost && !isLocal && (
        <button 
          onClick={() => remove()}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
          title="Remove from class"
        >
          ✕
        </button>
      )}
    </div>
  );
};

const LiveSidebar = ({ isTeacherHost }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const { publish, messages } = usePubSub("CHAT", {});
  const { participants } = useMeeting();

  const handleSendMessage = () => {
    if (message.trim()) {
      publish(message, { persist: true });
      setMessage("");
    }
  };

  const participantsArr = [...participants.values()];

  return (
    <div className="w-full md:w-[350px] h-[500px] md:h-full bg-white dark:bg-[#0f172a] rounded-[32px] md:rounded-none border border-border shadow-xl md:shadow-none flex flex-col overflow-hidden transition-all">
      {/* Tab Header */}
      <div className="flex border-b border-border">
        <button 
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "chat" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}
        >
          Chat ({messages.length})
        </button>
        <button 
          onClick={() => setActiveTab("members")}
          className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "members" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}
        >
          Members ({participantsArr.length})
        </button>
      </div>

      {activeTab === "chat" ? (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-surface/50 p-4 rounded-2xl border border-gray-100/50 dark:border-gray-700/30">
                <span className="font-black text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">{msg.senderName}</span>
                <p className="text-sm text-secondary leading-relaxed">{msg.message}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-6">
                <span className="text-3xl mb-2">💬</span>
                <p className="text-xs font-bold uppercase tracking-widest">No messages yet. Say hello!</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border bg-gray-50/50 bg-surface-soft/20 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl bg-surface border border-border text-sm text-primary outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all" onClick={handleSendMessage}>
              →
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Participants</span>
             <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-lg">LIVE</span>
          </div>
          {participantsArr.map((p) => (
            <ParticipantItem key={p.id} participantId={p.id} isTeacherHost={isTeacherHost} />
          ))}
          {participantsArr.length === 0 && (
            <div className="h-40 flex items-center justify-center opacity-20">
              <p className="text-xs font-bold uppercase tracking-widest">No members found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MeetingView = ({ onMeetingLeave, isTeacherHost }) => {
  const [joined, setJoined] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);

  const [screenShareOn, setScreenShareOn] = useState(false);

  const { join, leave, end, toggleMic, toggleWebcam, toggleScreenShare, participants } = useMeeting({
    onMeetingJoined: () => setJoined("JOINED"),
    onMeetingLeft: () => onMeetingLeave(),
  });

  const handleToggleMic = () => {
    toggleMic();
    setMicOn(!micOn);
  };

  const handleToggleWebcam = () => {
    toggleWebcam();
    setWebcamOn(!webcamOn);
  };

  const handleToggleScreenShare = () => {
    toggleScreenShare();
    setScreenShareOn(!screenShareOn);
  };

  const participantsArr = [...participants.values()];

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[600px] bg-transparent">
      {joined === "JOINED" ? (
        <>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {/* Sleek LIVE Indicator */}
            <div style={{
              position: "absolute", top: "24px", left: "24px",
              background: "rgba(239, 68, 68, 0.9)", color: "white",
              padding: "6px 16px", borderRadius: "100px", fontWeight: "700",
              fontSize: "13px", display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)", zIndex: 10,
              letterSpacing: "0.5px"
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "white", animation: "pulse 2s infinite" }}></div>
              LIVE
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 h-full pb-32 overflow-y-auto custom-scrollbar">
              {participantsArr.map((participant) => (
                <div key={participant.id} className="aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border bg-black">
                  <ParticipantView participantId={participant.id} />
                </div>
              ))}
            </div>

            {/* Floating Glassmorphism Toolbar */}
            <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-2 md:p-3 flex items-center gap-2 md:gap-4 shadow-2xl z-10">
              {isTeacherHost && (
                <>
                  <button onClick={handleToggleMic} style={{
                    width: "48px", height: "48px", borderRadius: "50%", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.2s ease",
                    background: micOn ? "rgba(255,255,255,0.15)" : "#ef4444",
                    color: "white", fontSize: "20px"
                  }} title="Toggle Microphone">
                    {micOn ? "🎙️" : "🔇"}
                  </button>

                  <button onClick={handleToggleWebcam} style={{
                    width: "48px", height: "48px", borderRadius: "50%", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.2s ease",
                    background: webcamOn ? "rgba(255,255,255,0.15)" : "#ef4444",
                    color: "white", fontSize: "20px"
                  }} title="Toggle Camera">
                    {webcamOn ? "📷" : "🚫"}
                  </button>

                  <button onClick={handleToggleScreenShare} style={{
                    width: "48px", height: "48px", borderRadius: "50%", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.2s ease",
                    background: screenShareOn ? "rgba(255,255,255,0.15)" : "transparent",
                    color: "white", fontSize: "20px"
                  }} title="Toggle Screen Share">
                    {screenShareOn ? "📤" : "🖥️"}
                  </button>

                  <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.2)" }}></div>
                </>
              )}

              <button onClick={() => leave()} className="px-4 md:px-6 h-10 md:h-12 rounded-full border-none flex items-center justify-center cursor-pointer transition-all bg-white/10 text-white font-bold text-xs md:text-sm">
                Leave
              </button>

              {isTeacherHost && (
                <button onClick={() => end()} className="px-4 md:px-6 h-10 md:h-12 rounded-full border-none flex items-center justify-center cursor-pointer transition-all bg-red-600 text-white font-bold text-xs md:text-sm shadow-lg shadow-red-600/20">
                  End Class
                </button>
              )}
            </div>
          </div>
          <LiveSidebar isTeacherHost={isTeacherHost} />
        </>
      ) : joined === "JOINING" ? (
        <div className="live-placeholder" style={{ width: "100%" }}>
          <p>Joining the studio...</p>
        </div>
      ) : (
        <div className="live-placeholder" style={{ width: "100%" }}>
          <div className="live-placeholder-icon">📺</div>
          <p>Ready to join the live session?</p>
          <button
            className="btn btn-inline"
            style={{ marginTop: "20px" }}
            onClick={() => {
              setJoined("JOINING");
              join();
            }}
          >
            {isTeacherHost ? "🚀 Go Live" : "Join Class"}
          </button>
        </div>
      )}
    </div>
  );
};

const VideoSDKClassroom = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Compute isTeacherHost from the loaded course data, not from stale state
  const isTeacherHost = user?.role === "teacher" && course?.teacherId?._id === user?.id;

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const initClassroom = async () => {
      setLoading(true);
      setError("");

      try {
        // Step 1: Load course data
        const courseRes = await API.get(`/courses/${courseId}`);
        const courseData = courseRes.data;
        setCourse(courseData);

        // Step 2: Get VideoSDK Token
        const tokenRes = await API.get("/videosdk/token");
        const videoSdkToken = tokenRes.data.token;
        setToken(videoSdkToken);

        // Step 3: Determine if THIS user is the teacher (use fresh data, not state)
        const isHost = user?.role === "teacher" && courseData.teacherId?._id === user?.id;
        console.log("[VideoSDK] Role check:", { role: user?.role, isHost, teacherId: courseData.teacherId?._id, userId: user?.id });

        let currentRoomId;

        if (isHost) {
          // Teacher: always create a fresh VideoSDK room
          const meetingRes = await API.post("/videosdk/create-meeting", { token: videoSdkToken });
          currentRoomId = meetingRes.data.roomId;
          console.log("[VideoSDK] Teacher created room:", currentRoomId);

          // Save the real VideoSDK room ID to our backend
          await API.post(`/courses/${courseId}/live/start`, { roomId: currentRoomId });
        } else {
          // Student: fetch the latest session to get the active room ID
          const liveRes = await API.get(`/courses/${courseId}/live`);
          const session = liveRes.data.liveSession;
          console.log("[VideoSDK] Student fetched session:", JSON.stringify(session));

          if (!session?.isActive) {
            setError("The classroom is not live right now. Ask the teacher to start the session.");
            setLoading(false);
            return;
          }

          if (!session?.roomId) {
            setError("No room ID found. The teacher needs to restart the session.");
            setLoading(false);
            return;
          }

          // Validate the room with VideoSDK servers before joining
          try {
            await API.post(`/videosdk/validate-meeting/${session.roomId}`, { token: videoSdkToken });
            currentRoomId = session.roomId;
            console.log("[VideoSDK] Room validated successfully:", currentRoomId);
          } catch (valErr) {
            console.error("[VideoSDK] Room validation failed:", session.roomId, valErr);
            setError("The room ID is invalid or expired. Ask the teacher to Stop Live and Go Live again.");
            setLoading(false);
            return;
          }
        }

        if (currentRoomId) {
          console.log("[VideoSDK] Initializing MeetingProvider with:", currentRoomId);
          setMeetingId(currentRoomId);
        } else {
          setError("The classroom is not live right now.");
        }
      } catch (err) {
        console.error("[VideoSDK] Init error:", err);
        setError("Failed to initialize classroom: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initClassroom();
    }
  }, [courseId, user, retryCount]);

  const onMeetingLeave = async () => {
    if (isTeacherHost) {
      try {
        await API.post(`/courses/${courseId}/live/stop`);
      } catch (e) {
        console.error("Failed to stop session", e);
      }
    }
    navigate(`/course/${courseId}`);
  };

  return (
    <AppShell>
      <section className="page-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Studio Mode</span>
            <h2>{course?.title || "Live Session"}</h2>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-inline"
            onClick={() => navigate(-1)}
          >
            Leave
          </button>
        </div>

        {error ? (
          <div style={{ textAlign: 'center' }}>
            <p className="form-error">{error}</p>
            <button className="btn btn-secondary btn-inline" style={{ marginTop: '10px' }} onClick={() => setRetryCount(c => c + 1)}>
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="live-studio-container">
            <div className="live-placeholder">
              <p>Preparing the studio...</p>
            </div>
          </div>
        ) : token && meetingId ? (
          <MeetingProvider
            config={{
              meetingId,
              micEnabled: isTeacherHost,
              webcamEnabled: isTeacherHost,
              name: user?.name || (isTeacherHost ? "Teacher" : "Student"),
            }}
            token={token}
          >
            <MeetingView onMeetingLeave={onMeetingLeave} isTeacherHost={isTeacherHost} />
          </MeetingProvider>
        ) : null}
      </section>
    </AppShell>
  );
};

export default VideoSDKClassroom;
