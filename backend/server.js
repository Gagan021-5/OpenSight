import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import connection from './config/dbConnection.js';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

connection();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OpenSight API is running',
    timestamp: new Date(),
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 OpenSight API running on http://localhost:${PORT}`);
});
