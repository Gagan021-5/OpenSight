
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./config/dbConnection.js";
import chatRoutes from "./routes/chatroutes.js"; // Fixed casing
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import visionRoutes from "./routes/vision.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "https://your-frontend-url.com",
  credentials: true
}));
app.use(express.json());

app.get("/ping", (req, res) => {
  res.send("pong");
});


app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);
app.use("/api/game", gameRoutes);
app.use("/api", visionRoutes); // Add this line

/* Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

/* Connect Mongo */
connection();
