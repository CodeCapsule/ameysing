import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Song, RoomUser } from '../types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

interface SocketSyncOptions {
  roomId: string;
  userName: string;
  duration: string | null;
  shouldBeHost: boolean;
  onQueueUpdate: (queue: Song[]) => void;
  onCurrentSongUpdate: (song: Song | null) => void;
  onPlayerControl: (action: string) => void;
  onUsersUpdate: (users: RoomUser[]) => void;
}

export function useSocketSession({
  roomId,
  userName,
  duration,
  shouldBeHost,
  onQueueUpdate,
  onCurrentSongUpdate,
  onPlayerControl,
  onUsersUpdate,
}: SocketSyncOptions) {
  const [sessionEndMessage, setSessionEndMessage] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isHost, setIsHost] = useState(shouldBeHost);
  const socketRef = useRef<Socket | null>(null);

  // Stabilise callbacks via refs to avoid reconnect loops
  const cbRef = useRef({ onQueueUpdate, onCurrentSongUpdate, onPlayerControl, onUsersUpdate });
  useEffect(() => {
    cbRef.current = { onQueueUpdate, onCurrentSongUpdate, onPlayerControl, onUsersUpdate };
  });

  useEffect(() => {
    if (!roomId || !userName) return;

    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.emit('join_room', { roomId, userName, duration });

    socket.on('room_joined', (data) => {
      console.log('[Socket] Joined room:', data);
      if (data.expiresAt) setExpiresAt(data.expiresAt);
      if (data.queue) cbRef.current.onQueueUpdate(data.queue);
    });

    socket.on('update_users', (users: RoomUser[]) => {
      cbRef.current.onUsersUpdate(users);
      const self = users.find((u) => u.name === userName);
      if (self) setIsHost(self.isHost);
    });

    socket.on('queue_updated', (queue: Song[]) => {
      cbRef.current.onQueueUpdate(queue);
    });

    socket.on('current_song_updated', (song: Song | null) => {
      cbRef.current.onCurrentSongUpdate(song);
    });

    socket.on('player_control_received', (action: string) => {
      cbRef.current.onPlayerControl(action);
    });

    socket.on('song_added_by_guest', (song: Song) => {
      cbRef.current.onQueueUpdate([]); // trigger re-fetch handled by parent
      // Actually just add to queue — parent will handle
      cbRef.current.onQueueUpdate([song]);
    });

    socket.on('session_ended', (data) => {
      setSessionEndMessage(data.message || 'Session has ended.');
    });

    return () => {
      socket.disconnect();
    };
    // Only reconnect when identity values change, not on callback changes
  }, [roomId, userName, duration]);

  const syncQueue = useCallback(
    (queue: Song[]) => {
      socketRef.current?.emit('sync_queue', { roomId, queue });
    },
    [roomId]
  );

  const syncCurrentSong = useCallback(
    (song: Song | null) => {
      socketRef.current?.emit('sync_current_song', { roomId, song });
    },
    [roomId]
  );

  const sendPlayerControl = useCallback(
    (action: string) => {
      socketRef.current?.emit('player_control', { roomId, action });
    },
    [roomId]
  );

  const sendAddToQueue = useCallback(
    (song: Song) => {
      socketRef.current?.emit('add_to_queue', { roomId, song });
    },
    [roomId]
  );

  // Session timer
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = expiresAt - now;
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        clearInterval(timer);
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return {
    sessionEndMessage,
    timeLeft,
    isHost,
    syncQueue,
    syncCurrentSong,
    sendPlayerControl,
    sendAddToQueue,
  };
}
