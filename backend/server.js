require('dotenv').config();
const http    = require('http');
const { Server } = require('socket.io');
const app     = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// ── Socket.io — calendario en tiempo real ──────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*' },
});

app.set('io', io);   // los controladores lo acceden vía req.app.get('io')

io.on('connection', (socket) => {
  // El cliente/barbero se une a su sala personal al conectar
  socket.on('join', ({ role, userId }) => {
    if (role && userId) socket.join(`${role}_${userId}`);
  });
});

// ── Arranque ───────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 BLADE backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al iniciar:', err.message);
    process.exit(1);
  });
