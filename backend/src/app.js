const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── Rutas ──────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/barbers',      require('./routes/barbers'));
app.use('/api/services',     require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));

// Health check — Jenkins lo usa para verificar que el servidor levantó
app.get('/health', (req, res) =>
  res.json({ status: 'ok', app: 'blade-backend', timestamp: new Date().toISOString() })
);

// Error handler global
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

module.exports = app;
