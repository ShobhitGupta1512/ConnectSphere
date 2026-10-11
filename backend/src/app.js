 import express from "express";
 import { createServer } from "http";
 import cors from "cors";
 import dotenv from "dotenv";

 import { connectToServer } from "./controllers/socketManager.js";
 import { connectDB } from "./config/db.js";
 import userRoutes from "./routes/userRoutes.js";
 import postRoutes from "./routes/postRoutes.js";

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = connectToServer(httpServer);

// Middleware
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);


// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Basic home route
app.get("/home", (req, res) => {
    return res.json({
        Hello: "World"
    });
});

// Socket.IO connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Start server
const start = async () => {
    try {
        // Connect MongoDB
        await connectDB();

        // Start HTTP + Socket.IO server
        httpServer.listen(8000, () => {
            console.log("APP IS LISTENING ON PORT 8000");
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

start();

