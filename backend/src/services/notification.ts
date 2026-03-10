import { Server as SocketServer } from 'socket.io';
import Notification from '../models/Notification';

let io: SocketServer;

export const initializeSocket = (socketIo: SocketServer): void => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join-role', (role: string) => {
      socket.join(`role-${role}`);
    });

    socket.on('join-department', (department: string) => {
      socket.join(`dept-${department}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

export const emitNotification = async (notification: {
  title: string;
  message: string;
  type: string;
  eventId?: string;
  targetRole?: string;
  targetDepartment?: string;
}): Promise<void> => {
  if (!io) return;

  // Save to database
  await Notification.create(notification);

  // Emit to all connected clients
  if (notification.targetRole) {
    io.to(`role-${notification.targetRole}`).emit('notification', notification);
  } else if (notification.targetDepartment) {
    io.to(`dept-${notification.targetDepartment}`).emit('notification', notification);
  } else {
    io.emit('notification', notification);
  }
};

export const emitAttendanceUpdate = (eventId: string, data: any): void => {
  if (!io) return;
  io.emit(`attendance-${eventId}`, data);
};

export const getIO = (): SocketServer => io;
