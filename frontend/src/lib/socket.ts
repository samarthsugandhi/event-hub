import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Get a resilient Socket.io connection.
 * - Reconnects automatically on disconnect
 * - Doesn't crash the app if backend is unreachable
 * - Uses own backend (no external API)
 */
export const getSocket = (): Socket => {
  if (!socket) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    socket = io(backendUrl, {
      transports: ['websocket', 'polling'], // fallback to polling if ws fails
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    // Graceful error handling — never crash the app
    socket.on('connect_error', (err) => {
      console.warn('Socket connection error (non-blocking):', err.message);
    });

    socket.on('reconnect_failed', () => {
      console.warn('Socket reconnection failed — real-time updates unavailable');
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected');
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
