import dotenv from "dotenv";

// Polyfill for PDF parsing libraries that expect a browser environment
if (typeof global.DOMMatrix === "undefined") {
    global.DOMMatrix = class DOMMatrix {
        constructor() {
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        }
    };
}
if (typeof global.ImageData === "undefined") {
    global.ImageData = class ImageData {
        constructor() {}
    };
}
if (typeof global.Path2D === "undefined") {
    global.Path2D = class Path2D {
        constructor() {}
    };
}
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
