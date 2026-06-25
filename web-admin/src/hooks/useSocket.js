import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket(user, onEvent) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const socket = io('/', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('join', { role: user.role, userId: user._id });
    socket.on('new_appointment',   (data) => onEvent('new_appointment', data));
    socket.on('appointment_update',(data) => onEvent('appointment_update', data));

    return () => socket.disconnect();
  }, [user]);

  return socketRef;
}
