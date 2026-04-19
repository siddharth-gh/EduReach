const liveRooms = new Map();

const getRoom = (courseId) => {
    if (!liveRooms.has(courseId)) {
        liveRooms.set(courseId, {
            teacherSocketId: null,
            viewers: new Set(),
        });
    }

    return liveRooms.get(courseId);
};

const cleanupRoom = (courseId) => {
    const room = liveRooms.get(courseId);

    if (!room) {
        return;
    }

    if (!room.teacherSocketId && room.viewers.size === 0) {
        liveRooms.delete(courseId);
    }
};

export const registerLiveSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        socket.on("live:join", ({ courseId, role, userName }) => {
            if (!courseId) {
                return;
            }

            const room = getRoom(courseId);
            socket.join(courseId);
            socket.data.courseId = courseId;
            socket.data.role = role;

            if (role === "teacher") {
                room.teacherSocketId = socket.id;
                io.to(courseId).emit("live:status", {
                    isLive: true,
                    teacherConnected: true,
                });
            } else {
                room.viewers.add(socket.id);

                if (room.teacherSocketId) {
                    io.to(room.teacherSocketId).emit("live:viewer-joined", {
                        viewerSocketId: socket.id,
                        userName: userName || "Student",
                    });
                }
            }
        });

        socket.on("live:offer", ({ targetSocketId, sdp }) => {
            if (!targetSocketId || !sdp) {
                return;
            }

            io.to(targetSocketId).emit("live:offer", {
                senderSocketId: socket.id,
                sdp,
            });
        });

        socket.on("live:answer", ({ targetSocketId, sdp }) => {
            if (!targetSocketId || !sdp) {
                return;
            }

            io.to(targetSocketId).emit("live:answer", {
                senderSocketId: socket.id,
                sdp,
            });
        });

        socket.on("live:ice-candidate", ({ targetSocketId, candidate }) => {
            if (!targetSocketId || !candidate) {
                return;
            }

            io.to(targetSocketId).emit("live:ice-candidate", {
                senderSocketId: socket.id,
                candidate,
            });
        });

        socket.on("live:stop", ({ courseId }) => {
            if (!courseId) {
                return;
            }

            const room = getRoom(courseId);
            room.teacherSocketId = null;
            io.to(courseId).emit("live:ended");
            cleanupRoom(courseId);
        });

        socket.on("disconnect", () => {
            const courseId = socket.data.courseId;

            if (!courseId) {
                return;
            }

            const room = getRoom(courseId);

            if (socket.data.role === "teacher") {
                room.teacherSocketId = null;
                io.to(courseId).emit("live:ended");
            } else {
                room.viewers.delete(socket.id);
            }

            cleanupRoom(courseId);
        });
    });
};
