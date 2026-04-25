import dotenv from "dotenv";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { registerLiveSocketHandlers } from "./src/socket/live.socket.js";

const serverDir = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
    path: path.join(serverDir, ".env"),
});

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            methods: ["GET", "POST"],
        },
    });

    registerLiveSocketHandlers(io);

    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
