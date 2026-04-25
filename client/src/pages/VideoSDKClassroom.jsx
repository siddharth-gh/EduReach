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
    <div style={{ width: "300px", height: "100%", background: "#1a1a1a", borderLeft: "1px solid #333", display: "flex", flexDirection: "column" }}>
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
          style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #444", background: "#222", color: "white" }}
        />
        <button className="btn btn-inline" style={{ padding: "8px 12px" }} onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

const MeetingView = ({ onMeetingLeave, isTeacherHost }) => {
  const [joined, setJoined] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);

  const { join, leave, toggleMic, toggleWebcam, participants } = useMeeting({
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
    <div className="live-studio-container" style={{ display: "flex", flexDirection: "row", background: "#0a0a0a" }}>
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
            <div style={{
              position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)",
              background: "rgba(30, 30, 30, 0.75)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "100px",
              padding: "12px 24px", display: "flex", gap: "16px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)", alignItems: "center", zIndex: 10
            }}>
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

              <button onClick={() => leave()} style={{
                padding: "0 24px", height: "48px", borderRadius: "24px", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s ease",
                background: "#ef4444", color: "white", fontWeight: "600", fontSize: "15px"
              }}>
                Leave Studio
              </button>
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
