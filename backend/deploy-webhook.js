/**
 * Deploy Webhook — escucha en puerto 3001
 * Jenkins llama POST /deploy con el token correcto
 * y este proceso recarga blade-backend con PM2 en el host.
 *
 * Solo accesible desde localhost / Docker host.docker.internal
 */
require('dotenv').config();
const http = require('http');
const { execSync } = require('child_process');

const PORT  = 3001;
const TOKEN = process.env.DEPLOY_TOKEN || 'blade-deploy-2026';

const server = http.createServer((req, res) => {
  // Solo aceptar POST /deploy
  if (req.method !== 'POST' || !req.url.startsWith('/deploy')) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  // Verificar token (el token viene del entorno, no del código fuente)
  const url   = new URL(req.url, `http://localhost:${PORT}`);
  const token = url.searchParams.get('token');
  if (!token || token !== TOKEN) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  console.log(`[${new Date().toISOString()}] 🚀 Deploy solicitado desde ${req.socket.remoteAddress}`);

  try {
    const out = execSync('pm2 reload blade-backend --update-env', { encoding: 'utf8' });
    console.log('[deploy] PM2 output:', out.trim());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'deployed', message: 'blade-backend recargado con PM2' }));
  } catch (err) {
    console.error('[deploy] Error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: err.message }));
  }
});

// Escuchar solo en loopback — accesible desde el host y desde Docker via host.docker.internal
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Deploy webhook escuchando en http://0.0.0.0:${PORT}/deploy`);
  console.log(`   Token: ${TOKEN}`);
});
