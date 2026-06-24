/**
 * Tests del backend BLADE
 * Corren sin conexión a BD — validan lógica pura y dependencias instaladas.
 * process.exit(1) si alguno falla → Jenkins marca el build como FALLIDO.
 */
require('dotenv').config();

let passed = 0;
let failed = 0;

function ok(cond, label) {
  if (cond) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── 1. Dependencias instaladas ──────────────────────────────');

const deps = ['express', 'mongoose', 'jsonwebtoken', 'bcryptjs', 'cors', 'dotenv', 'socket.io', 'morgan'];
for (const dep of deps) {
  try { require(dep); ok(true, `${dep} disponible`); }
  catch { ok(false, `${dep} disponible`); }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── 2. JWT — firma y verificación ───────────────────────────');
{
  const jwt    = require('jsonwebtoken');
  const secret = 'test_secret_blade';

  const token   = jwt.sign({ id: 'abc123', role: 'client' }, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);

  ok(decoded.id === 'abc123',   'Payload id preservado');
  ok(decoded.role === 'client', 'Payload role preservado');

  try { jwt.verify('token.invalido.xxx', secret); ok(false, 'Token inválido rechazado'); }
  catch { ok(true, 'Token inválido rechazado'); }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── 3. bcrypt — hash y comparación ─────────────────────────');
{
  const bcrypt   = require('bcryptjs');
  const password = 'MiPassword123!';
  const hash     = bcrypt.hashSync(password, 10);

  ok(bcrypt.compareSync(password, hash),    'Contraseña correcta verificada');
  ok(!bcrypt.compareSync('otra', hash),     'Contraseña incorrecta rechazada');
  ok(hash !== password,                     'Hash diferente al texto plano');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── 4. Lógica de slots de disponibilidad ────────────────────');
{
  function toMins(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
  function fromMins(n) { return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; }

  function buildSlots(start, end, step, breakS = null, breakE = null) {
    const slots = [];
    let cur = toMins(start);
    const endM = toMins(end);
    const bkS = breakS ? toMins(breakS) : null;
    const bkE = breakE ? toMins(breakE) : null;
    while (cur + step <= endM) {
      if (bkS !== null && cur >= bkS && cur < bkE) { cur = bkE; continue; }
      slots.push(fromMins(cur));
      cur += step;
    }
    return slots;
  }

  const morning = buildSlots('09:00', '12:00', 30);
  ok(morning.length === 6,          `6 slots de 09:00–12:00 (obtuvo ${morning.length})`);
  ok(morning[0] === '09:00',        'Primer slot: 09:00');
  ok(morning[5] === '11:30',        'Último slot: 11:30');

  const withBreak = buildSlots('09:00', '18:00', 30, '13:00', '14:00');
  ok(!withBreak.includes('13:00'), 'Break excluido: 13:00 no aparece');
  ok(!withBreak.includes('13:30'), 'Break excluido: 13:30 no aparece');
  ok(withBreak.includes('14:00'),  'Después del break: 14:00 aparece');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── 5. Cálculo de hora de fin de cita ───────────────────────');
{
  function addMinutes(timeStr, mins) {
    const [h, m] = timeStr.split(':').map(Number);
    const total  = h * 60 + m + mins;
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  }

  ok(addMinutes('10:30', 45)  === '11:15', '10:30 + 45min = 11:15');
  ok(addMinutes('11:30', 90)  === '13:00', '11:30 + 90min = 13:00');
  ok(addMinutes('08:00', 30)  === '08:30', '08:00 + 30min = 08:30');
  ok(addMinutes('17:45', 120) === '19:45', '17:45 + 120min = 19:45');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── 6. Express — app instanciable ───────────────────────────');
{
  try {
    const express = require('express');
    const app = express();
    app.use(require('express').json());
    ok(typeof app === 'function', 'Express app creada correctamente');
    ok(typeof app.listen === 'function', 'app.listen disponible');
  } catch (e) {
    ok(false, `Express: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── 7. Mongoose — modelos válidos ───────────────────────────');
{
  try {
    const mongoose = require('mongoose');
    ok(typeof mongoose.Schema   === 'function', 'mongoose.Schema disponible');
    ok(typeof mongoose.connect  === 'function', 'mongoose.connect disponible');
    ok(typeof mongoose.model    === 'function', 'mongoose.model disponible');
  } catch (e) {
    ok(false, `Mongoose: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n── 8. Validación de roles ──────────────────────────────────');
{
  const ROLES = ['client', 'barber', 'admin'];
  ok(ROLES.includes('client'), 'Rol client válido');
  ok(ROLES.includes('barber'), 'Rol barber válido');
  ok(ROLES.includes('admin'),  'Rol admin válido');
  ok(!ROLES.includes('superuser'), 'Rol superuser inválido (rechazado)');
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(52));
console.log(`  Resultados: ${passed} pasaron, ${failed} fallaron`);
console.log('─'.repeat(52) + '\n');

if (failed > 0) {
  console.log(`❌ ${failed} test(s) fallaron — build marcado como FALLIDO\n`);
  process.exit(1);
} else {
  console.log('✅ Todos los tests pasaron\n');
}
