const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// In-memory storage for sessions
const sessions = new Map();

// REST endpoint to create new coding sessions
app.post('/api/sessions', (req, res) => {
  const sessionId = uuidv4();
  sessions.set(sessionId, {
    id: sessionId,
    code: '',
    language: 'javascript',
    participants: []
  });

  console.log(`Created new session: ${sessionId}`);
  res.json({ sessionId });
});

// Get session details
app.get('/api/sessions/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// WebSocket handlers
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join a session room
  socket.on('join-session', (sessionId) => {
    const session = sessions.get(sessionId);

    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    socket.join(sessionId);
    session.participants.push(socket.id);

    console.log(`Socket ${socket.id} joined session ${sessionId}`);

    // Send current session state to the newly joined user
    socket.emit('session-state', {
      code: session.code,
      language: session.language
    });

    // Notify others in the room
    socket.to(sessionId).emit('user-joined', { userId: socket.id });
  });

  // Handle code changes and broadcast to all users in the room
  socket.on('code-change', ({ sessionId, code }) => {
    const session = sessions.get(sessionId);

    if (session) {
      session.code = code;
      // Broadcast to all other users in the session
      socket.to(sessionId).emit('code-update', { code });
    }
  });

  // Handle language changes
  socket.on('language-change', ({ sessionId, language }) => {
    const session = sessions.get(sessionId);

    if (session) {
      session.language = language;
      // Broadcast to all users in the session
      io.to(sessionId).emit('language-update', { language });
    }
  });

  // Handle cursor position sync (optional)
  socket.on('cursor-position', ({ sessionId, position }) => {
    socket.to(sessionId).emit('cursor-update', {
      userId: socket.id,
      position
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Remove user from all sessions
    sessions.forEach((session, sessionId) => {
      const index = session.participants.indexOf(socket.id);
      if (index > -1) {
        session.participants.splice(index, 1);
        socket.to(sessionId).emit('user-left', { userId: socket.id });
      }
    });
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, httpServer, io };
