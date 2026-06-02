const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { db, initDatabase } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'word_blaster_secret_token_12345';

app.use(cors());
app.use(express.json());

// Serve frontend static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// Initialize Database schema
initDatabase();


// --- Authentication Middleware ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// --- REST API Endpoints ---

// 1. User Registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Check if user already exists
    const checkUser = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: [username]
    });

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database
    await db.execute({
      sql: 'INSERT INTO users (username, password) VALUES (?, ?)',
      args: [username, hashedPassword]
    });

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Database error occurred during registration' });
  }
});

// 2. User Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Find user in database
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      username: user.username,
      highscore: user.highscore
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Database error occurred during login' });
  }
});

// 3. Get Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await db.execute(
      'SELECT username, highscore, games_played FROM users ORDER BY highscore DESC LIMIT 10'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

// 4. Get User Profile (Protected)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT username, highscore, games_played, created_at FROM users WHERE id = ?',
      args: [req.user.id]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});


// --- Real-time Socket.io Gameplay Logic ---

// Room-code based rooms: roomCode -> { hostSocket, hostUsername, matchId, levelIndex }
const pendingRooms = new Map();

// Active matches state tracking
const activeMatches = new Map();

// Generate a random 6-char room code like "WB-A3X9"
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (O,0,I,1)
  let code = 'WB-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  // Ensure uniqueness
  if (pendingRooms.has(code)) return generateRoomCode();
  return code;
}

function startMatch(roomCode, player1, player2) {
  const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const levelIndex = Math.floor(Math.random() * 8);

  // Put both sockets into a specific Socket.io Room
  player1.socket.join(matchId);
  player2.socket.join(matchId);

  // Create active match details
  const matchState = {
    id: matchId,
    roomCode,
    players: {
      [player1.socket.id]: { username: player1.username, score: 0, finished: false },
      [player2.socket.id]: { username: player2.username, score: 0, finished: false }
    }
  };

  activeMatches.set(matchId, matchState);

  // Notify clients that match has started
  player1.socket.emit('matchFound', {
    matchId,
    opponent: player2.username,
    role: 'player1',
    levelIndex
  });

  player2.socket.emit('matchFound', {
    matchId,
    opponent: player1.username,
    role: 'player2',
    levelIndex
  });

  console.log(`Match ${matchId} (Room: ${roomCode}) started between ${player1.username} and ${player2.username}`);

  // Save match initialization in Turso DB (Async background)
  db.execute({
    sql: 'INSERT INTO matches (id, status) VALUES (?, ?)',
    args: [matchId, 'active']
  }).catch(err => console.error('Failed to log match init in DB:', err));

  db.execute({
    sql: 'INSERT INTO match_players (match_id, username, score) VALUES (?, ?, 0), (?, ?, 0)',
    args: [matchId, player1.username, matchId, player2.username]
  }).catch(err => console.error('Failed to log match players in DB:', err));

  // Cleanup pending room
  pendingRooms.delete(roomCode);
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  let authenticatedUser = null;

  // Socket authentication
  socket.on('authenticate', (token) => {
    try {
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        authenticatedUser = decoded.username;
        console.log(`Socket ${socket.id} authenticated as user: ${authenticatedUser}`);
        socket.emit('authenticated', { username: authenticatedUser });
      }
    } catch (err) {
      console.log(`Authentication failed on socket ${socket.id}:`, err.message);
      socket.emit('authError', { error: 'Session expired. Please log in again.' });
    }
  });

  // Create a new private room
  socket.on('createRoom', () => {
    const username = authenticatedUser || `Guest_${socket.id.substring(0, 5)}`;
    const roomCode = generateRoomCode();

    pendingRooms.set(roomCode, {
      hostSocket: socket,
      hostUsername: username
    });

    socket.emit('roomCreated', { roomCode });
    console.log(`Room ${roomCode} created by ${username}`);
  });

  // Join an existing room by code
  socket.on('joinRoom', ({ roomCode }) => {
    const username = authenticatedUser || `Guest_${socket.id.substring(0, 5)}`;
    const upperCode = (roomCode || '').toUpperCase().trim();

    const room = pendingRooms.get(upperCode);

    if (!room) {
      return socket.emit('roomError', { error: 'Room not found. Check the code and try again.' });
    }

    if (room.hostSocket.id === socket.id) {
      return socket.emit('roomError', { error: 'You cannot join your own room!' });
    }

    console.log(`${username} joining room ${upperCode} hosted by ${room.hostUsername}`);

    // Start the match between host and joiner
    startMatch(upperCode, 
      { socket: room.hostSocket, username: room.hostUsername },
      { socket, username }
    );
  });

  // Leave/cancel a created room
  socket.on('leaveRoom', ({ roomCode }) => {
    const upperCode = (roomCode || '').toUpperCase().trim();
    const room = pendingRooms.get(upperCode);
    if (room && room.hostSocket.id === socket.id) {
      pendingRooms.delete(upperCode);
      console.log(`Room ${upperCode} cancelled by host`);
    }
  });

  // Handle score/gameplay updates
  socket.on('gameUpdate', ({ matchId, score, wordsTyped }) => {
    const match = activeMatches.get(matchId);
    if (!match) return;

    // Update player score in active state
    if (match.players[socket.id]) {
      match.players[socket.id].score = score;
      
      // Broadcast this update to the other player in the match room
      socket.to(matchId).emit('opponentUpdate', { score, wordsTyped });
    }
  });

  // Finish match (one player dies or timer runs out)
  socket.on('playerFinished', async ({ matchId, finalScore }) => {
    const match = activeMatches.get(matchId);
    if (!match) return;

    const player = match.players[socket.id];
    if (!player) return;

    player.score = finalScore;
    player.finished = true;

    console.log(`Player ${player.username} finished match ${matchId} with score ${finalScore}`);

    // Check if both players have completed the game
    const players = Object.values(match.players);
    const allFinished = players.every(p => p.finished);

    // Notify opponent that this player finished
    socket.to(matchId).emit('opponentFinished', { finalScore });

    if (allFinished) {
      // Determine the winner
      let winnerUsername = 'Tie';
      const playerSockets = Object.keys(match.players);
      const p1 = match.players[playerSockets[0]];
      const p2 = match.players[playerSockets[1]];

      if (p1.score > p2.score) {
        winnerUsername = p1.username;
      } else if (p2.score > p1.score) {
        winnerUsername = p2.username;
      }

      console.log(`Match ${matchId} finished. Winner: ${winnerUsername}`);

      // Emit game result to both
      io.to(matchId).emit('matchOver', {
        winner: winnerUsername,
        scores: [
          { username: p1.username, score: p1.score },
          { username: p2.username, score: p2.score }
        ]
      });

      // Update Database
      try {
        // 1. Update match outcome
        await db.execute({
          sql: 'UPDATE matches SET status = "completed", winner_username = ? WHERE id = ?',
          args: [winnerUsername, matchId]
        });

        // 2. Update players scores in match_players
        for (const pSocketId of playerSockets) {
          const p = match.players[pSocketId];
          await db.execute({
            sql: 'UPDATE match_players SET score = ? WHERE match_id = ? AND username = ?',
            args: [p.score, matchId, p.username]
          });

          // 3. Update player user profiles (games played, highscore) if registered users
          if (!p.username.startsWith('Guest_')) {
            const userStats = await db.execute({
              sql: 'SELECT highscore, games_played FROM users WHERE username = ?',
              args: [p.username]
            });

            if (userStats.rows.length > 0) {
              const currentHigh = userStats.rows[0].highscore;
              const newHigh = Math.max(currentHigh, p.score);
              const gamesCount = userStats.rows[0].games_played + 1;

              await db.execute({
                sql: 'UPDATE users SET highscore = ?, games_played = ? WHERE username = ?',
                args: [newHigh, gamesCount, p.username]
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to write match results to database:', err);
      }

      // Cleanup
      activeMatches.delete(matchId);
    }
  });

  // Handle Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove any pending rooms created by this socket
    for (const [code, room] of pendingRooms.entries()) {
      if (room.hostSocket.id === socket.id) {
        pendingRooms.delete(code);
        console.log(`Pending room ${code} removed (host disconnected)`);
      }
    }

    // Handle abrupt disconnect during active game
    for (const [matchId, match] of activeMatches.entries()) {
      if (match.players[socket.id]) {
        const disconnectedPlayer = match.players[socket.id];
        const otherSocketId = Object.keys(match.players).find(id => id !== socket.id);
        const opponent = match.players[otherSocketId];

        console.log(`Player ${disconnectedPlayer.username} disconnected abruptly from match ${matchId}`);

        if (opponent && !opponent.finished) {
          // Notify opponent that they win by forfeit
          io.to(otherSocketId).emit('opponentForfeit', {
            message: 'Opponent disconnected. You win!'
          });

          // Save forfeit results to DB
          db.execute({
            sql: 'UPDATE matches SET status = "completed", winner_username = ? WHERE id = ?',
            args: [opponent.username, matchId]
          }).catch(err => console.error('Failed to log forfeit in DB:', err));
        }

        activeMatches.delete(matchId);
      }
    }
  });
});

// Run server
server.listen(PORT, () => {
  console.log(`Word Blaster backend server running on http://localhost:${PORT}`);
});
