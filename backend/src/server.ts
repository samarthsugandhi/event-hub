import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

import connectDB from './config/database';
import { initializeSocket } from './services/notification';
import { isEmailConfigured } from './services/email';

// Route imports
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import registrationRoutes from './routes/registrations';
import adminRoutes from './routes/admin';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notifications';
import bookmarkRoutes from './routes/bookmarks';
import paymentRoutes from './routes/payments';
import savedFiltersRoutes from './routes/saved-filters';
import certificatesRoutes from './routes/certificates';
import { startReminderService } from './services/reminder';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Socket.io
initializeSocket(io);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/user/saved-filters', savedFiltersRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/user/certificates', certificatesRoutes);

// Health check
app.get('/api/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    const emailStatus = isEmailConfigured() ? '✅ SMTP configured' : '⏭️  Skipped (no SMTP creds — QR shown on-screen)';
    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🌀 BEC Event Hub API Server                   ║
║                                                  ║
║   Port: ${PORT}                                    ║
║   Mode: ${(process.env.NODE_ENV || 'development').padEnd(18)}         ║
║                                                  ║
║   ── Stack (100% local, no external APIs) ──     ║
║   Database:    ✅ MongoDB connected              ║
║   Auth:        ✅ JWT (local)                    ║
║   QR Codes:    ✅ qrcode (local npm)             ║
║   Socket.io:   ✅ Real-time (own server)         ║
║   Charts:      ✅ Chart.js (local npm)           ║
║   Email:       ${emailStatus.padEnd(33)}║
║                                                  ║
╚══════════════════════════════════════════════════╝
    `);

    // Start the event reminder scheduler
    startReminderService();
  });
};

startServer().catch(console.error);

export default app;
