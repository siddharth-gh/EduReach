import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const buildIceServers = () => {
  const stunUrls = (import.meta.env.VITE_STUN_URLS ||
    "stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const turnUrls = (import.meta.env.VITE_TURN_URLS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const turnUsername = import.meta.env.VITE_TURN_USERNAME || "";
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL || "";

  const servers = [
    {
      urls: stunUrls,
    },
  ];

  if (turnUrls.length && turnUsername && turnCredential) {
    servers.push({
      urls: turnUrls,
      username: turnUsername,
      credential: turnCredential,
    });
  }

  return servers;
};

const getSocketBaseUrl = () =>
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
    /\/api\/?$/,
    ""
  );

const LiveClassroom = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [session, setSession] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [localReady, setLocalReady] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isStreamConnected, setIsStreamConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const joinTimeoutRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());

  const iceServers = useMemo(() => buildIceServers(), []);
  const isTeacherHost =
    user?.role === "teacher" &&
    course?.teacherId?._id === user?.id;

  const canJoin = Boolean(session?.isActive);

  const socketBaseUrl = useMemo(() => getSocketBaseUrl(), []);

  const closeAllPeerConnections = () => {
    peerConnectionsRef.current.forEach((connection) => connection.close());
    peerConnectionsRef.current.clear();
  };

  const clearJoinTimeout = () => {
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current);
      joinTimeoutRef.current = null;
    }
  };

  const stopLocalMedia = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalReady(false);
  };

  const ensureSocket = () => {
    if (socketRef.current) {
      return socketRef.current;
    }

    const socket = io(socketBaseUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setIsSocketConnected(true);
    });

    socket.on("connect_error", () => {
      setIsSocketConnected(false);
      setError("Live socket connection failed. Check network or firewall.");
    });

    socket.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    socket.on("live:viewer-joined", async ({ viewerSocketId }) => {
      if (!isTeacherHost || !localStreamRef.current) {
        return;
      }

      const connection = new RTCPeerConnection({ iceServers });
      peerConnectionsRef.current.set(viewerSocketId, connection);

      localStreamRef.current.getTracks().forEach((track) => {
        connection.addTrack(track, localStreamRef.current);
      });

      connection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("live:ice-candidate", {
            targetSocketId: viewerSocketId,
            candidate: event.candidate,
          });
        }
      };

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      socket.emit("live:offer", {
        targetSocketId: viewerSocketId,
        sdp: offer,
      });
    });

    socket.on("live:offer", async ({ senderSocketId, sdp }) => {
      if (isTeacherHost) {
        return;
      }

      const connection = new RTCPeerConnection({ iceServers });
      peerConnectionsRef.current.set(senderSocketId, connection);

      connection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsStreamConnected(true);
          setIsJoining(false);
          clearJoinTimeout();
        }
      };

      connection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("live:ice-candidate", {
            targetSocketId: senderSocketId,
            candidate: event.candidate,
          });
        }
      };

      await connection.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      socket.emit("live:answer", {
        targetSocketId: senderSocketId,
        sdp: answer,
      });
    });

    socket.on("live:answer", async ({ senderSocketId, sdp }) => {
      const connection = peerConnectionsRef.current.get(senderSocketId);

      if (connection) {
        await connection.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    socket.on("live:ice-candidate", async ({ senderSocketId, candidate }) => {
      const connection = peerConnectionsRef.current.get(senderSocketId);

      if (connection && candidate) {
        await connection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("live:ended", () => {
      closeAllPeerConnections();
      clearJoinTimeout();
      setIsStreamConnected(false);
      setIsJoining(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      setSession((current) =>
        current
          ? {
              ...current,
              isActive: false,
            }
          : current
      );
      setStatusMessage("The live class has ended.");
    });

    socketRef.current = socket;
    return socket;
  };

  const loadCourse = async () => {
    try {
      const [courseResponse, liveResponse] = await Promise.all([
        API.get(`/courses/${courseId}`),
        API.get(`/courses/${courseId}/live`),
      ]);

      setCourse(courseResponse.data);
      setSession(liveResponse.data.liveSession);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load live classroom");
    }
  };

  useEffect(() => {
    loadCourse();

    return () => {
      clearJoinTimeout();
      socketRef.current?.disconnect();
      socketRef.current = null;
      closeAllPeerConnections();
      stopLocalMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const startLive = async () => {
    setError("");
    setStatusMessage("");
    setIsStarting(true);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 960 },
          height: { ideal: 360, max: 540 },
          frameRate: { ideal: 15, max: 20 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      localStreamRef.current = mediaStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      setLocalReady(true);

      const response = await API.post(`/courses/${courseId}/live/start`);
      setSession(response.data);

      const socket = ensureSocket();
      socket.emit("live:join", {
        courseId,
        role: "teacher",
        userName: user?.name || "Teacher",
      });

      setStatusMessage("You are live. Students can now join this class.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start the live class"
      );
      stopLocalMedia();
    } finally {
      setIsStarting(false);
    }
  };

  const scheduleJoinTimeout = () => {
    clearJoinTimeout();
    joinTimeoutRef.current = setTimeout(() => {
      if (!isStreamConnected) {
        setStatusMessage(
          "Still waiting for the live stream. Make sure the teacher is live and stays on the live page."
        );
        setIsJoining(false);
      }
    }, 15000);
  };

  const joinLive = async () => {
    setError("");
    setStatusMessage("");
    setIsJoining(true);

    try {
      const liveResponse = await API.get(`/courses/${courseId}/live`);
      setSession(liveResponse.data.liveSession);

      if (!liveResponse.data.liveSession?.isActive) {
        setStatusMessage("This class is not live right now.");
        return;
      }

      const socket = ensureSocket();
      socket.emit("live:join", {
        courseId,
        role: "student",
        userName: user?.name || "Student",
      });
      setStatusMessage("Joining live class...");
      scheduleJoinTimeout();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to join live class");
      setIsJoining(false);
    }
  };

  const stopLive = async () => {
    setIsStopping(true);

    try {
      await API.post(`/courses/${courseId}/live/stop`);
      socketRef.current?.emit("live:stop", { courseId });
      closeAllPeerConnections();
      stopLocalMedia();
      setSession((current) =>
        current
          ? {
              ...current,
              isActive: false,
            }
          : current
      );
      setStatusMessage("Live session stopped.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to stop live class");
    } finally {
      setIsStopping(false);
    }
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

        {error ? <p className="form-error">{error}</p> : null}

        <div className="live-studio-container">
          {session?.isActive && (
            <div className="live-indicator">● LIVE</div>
          )}
          
          <div className="live-status-pill">
            {isSocketConnected ? "✓ Network Stable" : "⚠ Connecting..."}
          </div>

          {!isStreamConnected && !isTeacherHost && (
            <div className="live-placeholder">
              <div className="live-placeholder-icon">📺</div>
              <p>{statusMessage || "Waiting for the classroom to open..."}</p>
              {canJoin && (
                <button
                  type="button"
                  className="btn btn-inline"
                  style={{ marginTop: '20px' }}
                  onClick={joinLive}
                  disabled={isJoining}
                >
                  {isJoining ? "Joining..." : "Join Class"}
                </button>
              )}
            </div>
          )}

          {isTeacherHost ? (
            <video
              ref={localVideoRef}
              className="live-hero-video"
              autoPlay
              muted
              playsInline
            />
          ) : (
            <video
              ref={remoteVideoRef}
              className="live-hero-video"
              autoPlay
              playsInline
              controls={isStreamConnected}
              style={{ display: isStreamConnected ? 'block' : 'none' }}
            />
          )}

          <div className="live-controls-overlay">
            {isTeacherHost ? (
              <>
                {!session?.isActive ? (
                  <button
                    type="button"
                    className="btn btn-inline"
                    onClick={startLive}
                    disabled={isStarting}
                  >
                    {isStarting ? "Initializing..." : "🚀 Go Live"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-danger-soft btn-inline"
                    onClick={stopLive}
                    disabled={isStopping}
                  >
                    {isStopping ? "Stopping..." : "🛑 End Session"}
                  </button>
                )}
              </>
            ) : (
              <p className="meta-text" style={{ color: '#fff' }}>
                {isStreamConnected ? "Viewing Live Stream" : "Viewer Mode"}
              </p>
            )}
          </div>
        </div>

        {statusMessage && !isTeacherHost && (
          <p className="status-text" style={{ textAlign: 'center', marginTop: '10px' }}>
            {statusMessage}
          </p>
        )}
      </section>
    </AppShell>
  );
};

export default LiveClassroom;
