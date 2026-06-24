# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos principales

```bash
# Instalar dependencias
cd backend && npm install

# Desarrollo local (hot-reload)
cd backend && npm run dev

# Producción
cd backend && npm start

# Tests (los corre Jenkins automáticamente)
cd backend && npm test

# Ver proceso PM2
pm2 status
pm2 logs blade-backend
pm2 reload blade-backend   # deploy sin downtime
```

## Requisitos locales

- **MongoDB** debe estar corriendo en `localhost:27017` (`mongod`)
- **Node.js 20+**
- **PM2** (el Jenkinsfile lo instala si no existe): `npm install -g pm2`
- Copiar `backend/.env.example` → `backend/.env` y completar `JWT_SECRET`
- Firebase FCM es opcional — el servidor arranca sin él

## Arquitectura del proyecto

```
mi-app-jenkins/
├── backend/                   ← API REST Node.js
│   ├── server.js              ← Entrada: HTTP server + Socket.io
│   ├── src/
│   │   ├── app.js             ← Express: middlewares + rutas montadas
│   │   ├── config/
│   │   │   ├── database.js    ← Conexión Mongoose
│   │   │   └── firebase.js    ← Firebase Admin SDK (push notifications)
│   │   ├── models/            ← Schemas Mongoose
│   │   │   ├── User.js        ← roles: client | barber | admin
│   │   │   ├── Service.js     ← catálogo de servicios (corte, barba, manicure…)
│   │   │   ├── Availability.js← horario por barbero × día de semana
│   │   │   └── Appointment.js ← cita: pending→accepted/rejected/cancelled
│   │   ├── middleware/
│   │   │   ├── auth.js        ← verifica JWT → req.user
│   │   │   └── roles.js       ← roles(...allowed) guard
│   │   ├── controllers/       ← lógica de negocio
│   │   └── routes/            ← montaje de controladores
│   └── test/app.test.js       ← 33 tests sin BD (pasan sin mongod)
└── Jenkinsfile                ← Pipeline GitHub → install → test → PM2
```

## Rutas de la API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Registro (crea rol `client` por defecto) |
| POST | `/api/auth/login` | — | Login → devuelve JWT |
| GET | `/api/auth/me` | JWT | Perfil del usuario autenticado |
| PATCH | `/api/auth/fcm-token` | JWT | Actualiza token FCM para push |
| GET | `/api/barbers` | — | Lista barberos activos |
| GET | `/api/barbers/:id/slots?date=YYYY-MM-DD` | — | Slots libres de un barbero |
| POST | `/api/barbers/availability` | barber/admin | Define horario |
| GET | `/api/services` | — | Catálogo de servicios |
| POST | `/api/services` | admin | Crear servicio |
| POST | `/api/appointments` | client | Solicitar cita (→ push al barbero) |
| GET | `/api/appointments/my` | JWT | Mis citas (cliente o barbero) |
| PATCH | `/api/appointments/:id/respond` | barber | Aceptar o rechazar (→ push al cliente) |
| PATCH | `/api/appointments/:id/cancel` | JWT | Cancelar cita |
| GET | `/health` | — | Health check (Jenkins lo usa) |

## Flujo de datos clave

1. **Reserva**: cliente llama `POST /appointments` → se verifica conflicto → se crea con `status: pending` → push FCM al barbero + evento Socket.io `barber_{id}::new_appointment`
2. **Confirmación**: barbero llama `PATCH /appointments/:id/respond` con `{status: 'accepted'}` → push FCM al cliente + evento Socket.io `client_{id}::appointment_update`
3. **Calendario en vivo**: el front se suscribe a Socket.io con `join({ role, userId })` y actualiza la UI al recibir eventos sin necesidad de polling

## Pipeline Jenkins (Jenkinsfile)

Stages: **Clonar código** → **Instalar dependencias** → **Verificar entorno** → **Correr tests** → **Despliegue local (PM2)** → **Verificar salud**

El stage de despliegue usa `pm2 reload` (zero-downtime) si el proceso ya existe, o `pm2 start` la primera vez. El health check llama `GET /health` para confirmar que el servidor levantó.
