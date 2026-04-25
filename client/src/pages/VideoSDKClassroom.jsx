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

const ChatView = () => {
  const [message, setMessage] = useState("");
  const { publish, messages } = usePubSub("CHAT", {});

  const handleSendMessage = () => {
    if (message.trim()) {
      publish(message, { persist: true });
      setMessage("");
    }
  };

  return (
    <div className="w-full md:w-[300px] h-[300px] md:h-full bg-[#1a1a1a] border-t md:border-t-0 md:border-l border-[#333] flex flex-col">
      <div style={{ padding: "16px", borderBottom: "1px solid #333", fontWeight: "bold", color: "#fff" }}>Class Chat</div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ background: "#333", padding: "8px 12px", borderRadius: "8px", fontSize: "14px", color: "#fff" }}>
            <span style={{ fontWeight: "bold", color: "#88aaff", display: "block", marginBottom: "4px", fontSize: "12px" }}>{msg.senderName}</span>
            {msg.message}
          </div>
        ))}
      </div>
      <div style={{ padding: "16px", borderTop: "1px solid #333", display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded bg-[#222] text-white border border-[#444] text-sm outline-none"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded transition-all" onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

const MeetingView = ({ onMeetingLeave, isTeacherHost }) => {
  const [joined, setJoined] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);

  const { join, leave, end, toggleMic, toggleWebcam, participants } = useMeeting({
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

  const participantsArr = [...participants.values()];

  return (
    <div className="live-studio-container flex flex-col md:flex-row bg-[#0a0a0a]">
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", padding: "24px", height: "100%", paddingBottom: "100px", overflowY: "auto", alignContent: "flex-start" }}>
              {participantsArr.map((participant) => (
                <div key={participant.id} style={{ flex: "1 1 45%", minWidth: "300px", height: "300px" }}>
                  <ParticipantView participantId={participant.id} />
                </div>
              ))}
            </div>

            {/* Floating Glassmorphism Toolbar */}
            <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-2 md:p-3 flex items-center gap-2 md:gap-4 shadow-2xl z-10">
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

              <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.2)" }}></div>

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
          <ChatView />
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
            Join Class
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
              micEnabled: true,
              webcamEnabled: true,
              name: user?.name || "Student",
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
