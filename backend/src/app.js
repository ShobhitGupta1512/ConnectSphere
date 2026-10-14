
import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectToServer } from "./controllers/socketManager.js";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const frontendUrl =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use(cookieParser());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);

app.get("/home", (req, res) => {
  res.json({ Hello: "World" });
});

connectToServer(httpServer);

const start = async () => {
  try {
    await connectDB();

    const port = process.env.PORT || 8000;

    httpServer.listen(port, () => {
      console.log(`APP IS LISTENING ON PORT ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
