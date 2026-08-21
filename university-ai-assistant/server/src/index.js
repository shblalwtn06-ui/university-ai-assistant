import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import uploadRoutes from './routes/upload.routes.js';
import filesRoutes from './routes/files.routes.js';
import chatRoutes from './routes/chat.routes.js';
import studentsRoutes from './routes/students.routes.js';
import coursesRoutes from './routes/courses.routes.js';

dotenv.config();

const app = express();
const app = express();

// ✅ أضف هذا السطر هنا لحل تحذير Proxy في Render
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ---- Security & core middleware ----------------------------------
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Upload-Secret'],
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(apiLimiter);

// ---- Health check --------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Routes ----------------------------------------------------------
app.use('/api/upload', uploadRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/courses', coursesRoutes);

// ---- 404 + global error handler (must be last) -----------------------
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ University AI Assistant server running on port ${PORT}`);
});
