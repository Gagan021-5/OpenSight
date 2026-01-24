import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import connection from "./config/dbConnection.js";
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5000;
connection();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.post('/api/chat', async (req, res) => {
  try {
    const { inputs } = req.body;
    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: 'HF_TOKEN is not configured on the server' });
    }
    if (!inputs || typeof inputs !== 'string') {
      return res.status(400).json({ error: 'Invalid request body: inputs (string) is required' });
    }
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      { inputs },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('HF API Error:', error.response?.data || error.message);
    res.status(502).json({ error: 'Failed to fetch response from chatbot' });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/chat", chatRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 OpenSight API running on http://localhost:${PORT}`);
});
