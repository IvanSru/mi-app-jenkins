/**
 * Seed inicial de BLADE Barbería
 * Crea: 1 admin, 2 barberos, 1 especialista uñas, catálogo completo de servicios,
 * y disponibilidad semanal para cada barbero.
 *
 * Uso: node src/seed.js
 * Es idempotente — si los datos ya existen los omite.
 */
require('dotenv').config();
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const User         = require('./models/User');
const Service      = require('./models/Service');
const Availability = require('./models/Availability');

// ─── Datos ────────────────────────────────────────────────────────────────────

const USERS = [
  {
    name: 'Admin BLADE',
    email: 'admin@blade.com',
    password: 'Admin123!',
    role: 'admin',
    phone: '3001000000',
  },
  {
    name: 'Jorge Martínez',
    email: 'jorge@blade.com',
    password: 'Barber123!',
    role: 'barber',
    phone: '3002000001',
  },
  {
    name: 'Carlos Ríos',
    email: 'carlos@blade.com',
    password: 'Barber123!',
    role: 'barber',
    phone: '3002000002',
  },
  {
    name: 'Laura Gómez',
    email: 'laura@blade.com',
    password: 'Barber123!',
    role: 'barber',
    phone: '3002000003',
  },
  {
    name: 'Cliente Demo',
    email: 'cliente@blade.com',
    password: 'Cliente123!',
    role: 'client',
    phone: '3003000001',
  },
];

const SERVICES = [
  { name: 'Corte Caballero',      category: 'corte_caballero', duration: 30,  price: 25000,  description: 'Corte clásico o moderno con acabado profesional y lavado incluido.' },
  { name: 'Arreglo de Barba',     category: 'barba',           duration: 20,  price: 15000,  description: 'Perfilado, degradado y diseño de líneas con navaja caliente.' },
  { name: 'Combo Completo',       category: 'combo',           duration: 60,  price: 38000,  description: 'Corte de cabello + arreglo de barba. El servicio más solicitado.' },
  { name: 'Corte de Dama',        category: 'corte_dama',      duration: 60,  price: 35000,  description: 'Corte, puntas, capas o flequillo. Con alisado o rizado.' },
  { name: 'Manicure Clásico',     category: 'manicure',        duration: 45,  price: 20000,  description: 'Limpieza de cutículas, limado y esmaltado tradicional.' },
  { name: 'Manicure Permanente',  category: 'manicure',        duration: 60,  price: 35000,  description: 'Esmaltado semipermanente de larga duración.' },
  { name: 'Pedicure Spa',         category: 'pedicure',        duration: 60,  price: 30000,  description: 'Baño de pies, exfoliación, cutículas y esmaltado.' },
  { name: 'Tinte Completo',       category: 'tinte',           duration: 90,  price: 60000,  description: 'Tintura completa del cabello con productos de alta calidad.' },
  { name: 'Mechas / Balayage',    category: 'tinte',           duration: 120, price: 90000,  description: 'Mechas californianas o balayage efecto natural.' },
  { name: 'Keratina',             category: 'tratamiento',     duration: 150, price: 120000, description: 'Alisado progresivo con keratina — dura 3-6 meses.' },
  { name: 'Hidratación Profunda', category: 'tratamiento',     duration: 60,  price: 45000,  description: 'Mascarilla capilar + vapor + sellado de cutícula.' },
];

// Disponibilidad: Lun-Vie 09:00-18:00, Sáb 09:00-15:00. Pausa almuerzo 13:00-14:00.
const WEEKDAYS  = [1, 2, 3, 4, 5]; // Lunes a Viernes
const SATURDAY  = [6];

function buildAvailability(barberId) {
  const entries = [];
  for (const day of WEEKDAYS) {
    entries.push({
      barber: barberId, dayOfWeek: day,
      startTime: '09:00', endTime: '18:00',
      breakStart: '13:00', breakEnd: '14:00',
      slotDuration: 30,
    });
  }
  for (const day of SATURDAY) {
    entries.push({
      barber: barberId, dayOfWeek: day,
      startTime: '09:00', endTime: '15:00',
      breakStart: null, breakEnd: null,
      slotDuration: 30,
    });
  }
  return entries;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB conectado\n');

  // Servicios
  console.log('── Servicios ─────────────────────────────────');
  for (const svc of SERVICES) {
    const exists = await Service.findOne({ name: svc.name });
    if (exists) { console.log(`  ⏭  ${svc.name} (ya existe)`); continue; }
    await Service.create({ ...svc, active: true });
    console.log(`  ✅ ${svc.name} — $${svc.price.toLocaleString()} | ${svc.duration}min`);
  }

  // Usuarios
  console.log('\n── Usuarios ──────────────────────────────────');
  const barberIds = [];
  for (const u of USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`  ⏭  ${u.role.padEnd(6)} ${u.name} (ya existe)`);
      if (u.role === 'barber') barberIds.push(exists._id);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 12);
    const user = await User.create({ ...u, password: hashed });
    console.log(`  ✅ ${u.role.padEnd(6)} ${u.name} — ${u.email} / ${u.password}`);
    if (u.role === 'barber') barberIds.push(user._id);
  }

  // Disponibilidad de barberos
  console.log('\n── Disponibilidad ────────────────────────────');
  for (const bid of barberIds) {
    const entries = buildAvailability(bid);
    for (const entry of entries) {
      const exists = await Availability.findOne({ barber: bid, dayOfWeek: entry.dayOfWeek });
      if (exists) continue;
      await Availability.create(entry);
    }
    const barber = await User.findById(bid).select('name');
    console.log(`  ✅ ${barber.name} — Lun–Vie 09:00-18:00 | Sáb 09:00-15:00`);
  }

  console.log('\n' + '─'.repeat(46));
  console.log('✅ Seed completado\n');
  console.log('  Credenciales de acceso:');
  console.log('  Admin   → admin@blade.com     / Admin123!');
  console.log('  Barbero → jorge@blade.com     / Barber123!');
  console.log('  Barbero → carlos@blade.com    / Barber123!');
  console.log('  Barbero → laura@blade.com     / Barber123!');
  console.log('  Cliente → cliente@blade.com   / Cliente123!');
  console.log('─'.repeat(46) + '\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed falló:', err.message);
  process.exit(1);
});
