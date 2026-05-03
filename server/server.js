import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { YouTube } from 'youtube-sr';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// ========================
// YouTube Search Proxy API
// ========================

const BAD_KEYWORDS =
  /viral|funny|moment|fail|compilation|reaction|top 10|tiktok|vlog|challenge|live performance|interview|news|blind audition|got talent/i;

app.get('/api/search', async (req, res) => {
  let query = String(req.query.q || 'karaoke');

  if (
    !query.toLowerCase().includes('karaoke') &&
    !query.toLowerCase().includes('instrumental') &&
    !query.toLowerCase().includes('videoke')
  ) {
    query += ' karaoke';
  }

  try {
    const results = await YouTube.search(query, { limit: 40, type: 'video' });

    const filtered = results
      .filter((v) => !BAD_KEYWORDS.test(v.title || ''))
      .slice(0, 20)
      .map((v) => ({
        id: v.id,
        videoId: v.id,
        title: v.title || 'Untitled',
        subtitle: v.channel?.name || 'Unknown',
        thumb: v.thumbnail?.url || `https://img.youtube.com/vi/${v.id}/0.jpg`,
        duration: v.durationFormatted || '',
      }));

    res.json({ results: filtered });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('YouTube search error:', err.message);
    res.status(500).json({ error: 'Search failed', message: err.message });
  }
});

// ========================
// Room & Session Management
// ========================
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({ roomId, userName, duration }) => {
    if (!rooms.has(roomId)) {
      const durationHours = parseInt(duration) || 1;
      const expiresAt = Date.now() + durationHours * 60 * 60 * 1000;

      rooms.set(roomId, {
        users: new Map(),
        queue: [],
        expiresAt,
        duration: durationHours,
      });

      console.log(`Room ${roomId} created with ${durationHours}hr duration.`);

      // Auto-end session timer
      setTimeout(() => {
        if (rooms.has(roomId)) {
          io.to(roomId).emit('session_ended', {
            message: 'Session time is up! The room is now closed.',
          });
          rooms.delete(roomId);
          console.log(`Room ${roomId} ended due to session timeout.`);
        }
      }, durationHours * 60 * 60 * 1000);
    }

    const room = rooms.get(roomId);

    // Check if room has expired
    if (Date.now() > room.expiresAt) {
      socket.emit('session_ended', { message: 'This session has already ended.' });
      return;
    }

    socket.join(roomId);
    room.users.set(socket.id, {
      id: socket.id,
      name: userName || 'Guest',
      isHost: room.users.size === 0,
    });

    console.log(`User ${userName} joined room ${roomId}`);

    socket.emit('room_joined', {
      roomId,
      queue: room.queue,
      expiresAt: room.expiresAt,
      duration: room.duration,
    });

    const usersList = Array.from(room.users.values());
    io.to(roomId).emit('update_users', usersList);
  });

  // ─── Real-time Sync Handlers (outside join_room to avoid duplicates) ───
  socket.on('sync_queue', ({ roomId, queue }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).queue = queue;
      socket.to(roomId).emit('queue_updated', queue);
    }
  });

  socket.on('sync_current_song', ({ roomId, song }) => {
    if (rooms.has(roomId)) {
      socket.to(roomId).emit('current_song_updated', song);
    }
  });

  socket.on('player_control', ({ roomId, action }) => {
    socket.to(roomId).emit('player_control_received', action);
  });

  socket.on('add_to_queue', ({ roomId, song }) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      const wasEmpty = room.queue.length === 0;
      room.queue.push(song);
      io.to(roomId).emit('queue_updated', room.queue);
      // If the queue was empty, tell everyone to start playing this song
      if (wasEmpty) {
        io.to(roomId).emit('current_song_updated', song);
      }
    }
  });

  socket.on('disconnect', () => {
    rooms.forEach((roomData, roomId) => {
      if (roomData.users.has(socket.id)) {
        const user = roomData.users.get(socket.id);
        roomData.users.delete(socket.id);
        const usersList = Array.from(roomData.users.values());

        // If host left, assign new host
        if (user.isHost && usersList.length > 0) {
          usersList[0].isHost = true;
        }
        io.to(roomId).emit('update_users', usersList);

        // Clean up empty rooms
        if (roomData.users.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty).`);
        }
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
