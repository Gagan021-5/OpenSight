import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./config/dbConnection.js";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* 🔹 Health check (always works) */
app.get("/ping", (req, res) => {
  res.send("pong");
});

/* 🔹 Routes */
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

/* 🔹 Start server FIRST */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

/* 🔹 Connect Mongo AFTER server starts */
connection();