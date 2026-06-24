const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const User = require('../models/User');
const { sendPush } = require('../config/firebase');

// ── Calcular hora de fin a partir de startTime + duración del servicio ───
function addMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// POST /api/appointments
exports.create = async (req, res) => {
  try {
    const { barberId, serviceId, date, startTime, notes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });

    const endTime = addMinutes(startTime, service.duration);

    // Verificar conflicto de horario
    const conflict = await Appointment.findOne({
      barber: barberId,
      date: new Date(date),
      startTime,
      status: { $in: ['pending', 'accepted'] },
    });
    if (conflict) return res.status(409).json({ message: 'Ese horario ya no está disponible' });

    const appointment = await Appointment.create({
      client: req.user._id,
      barber: barberId,
      service: serviceId,
      date: new Date(date),
      startTime,
      endTime,
      notes,
    });

    await appointment.populate([
      { path: 'client', select: 'name phone' },
      { path: 'barber', select: 'name fcmToken' },
      { path: 'service', select: 'name duration price' },
    ]);

    // Push al barbero
    if (appointment.barber.fcmToken) {
      await sendPush(appointment.barber.fcmToken, {
        title: '✂️ Nueva solicitud — BLADE',
        body: `${appointment.client.name} quiere ${service.name} el ${new Date(date).toLocaleDateString('es-CO')} a las ${startTime}`,
        data: { appointmentId: appointment._id.toString(), type: 'new_appointment' },
      });
    }

    // Socket.io — actualizar calendario en tiempo real
    req.app.get('io')?.to(`barber_${barberId}`).emit('new_appointment', appointment);

    res.status(201).json({ appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/appointments/my
exports.myAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'barber'
      ? { barber: req.user._id }
      : { client: req.user._id };

    const appointments = await Appointment.find(filter)
      .populate('client',  'name phone avatar')
      .populate('barber',  'name avatar')
      .populate('service', 'name duration price category')
      .sort({ date: -1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/appointments/:id/respond   body: { status: 'accepted'|'rejected', reason? }
exports.respond = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status debe ser accepted o rejected' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('client',  'name fcmToken')
      .populate('service', 'name');

    if (!appointment) return res.status(404).json({ message: 'Cita no encontrada' });
    if (String(appointment.barber) !== String(req.user._id)) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'La cita ya fue procesada' });
    }

    appointment.status = status;
    if (reason) appointment.cancelReason = reason;
    await appointment.save();

    // Push al cliente
    if (appointment.client?.fcmToken) {
      const body = status === 'accepted'
        ? `Tu cita de ${appointment.service.name} fue confirmada ✅`
        : `Tu cita de ${appointment.service.name} fue rechazada ❌`;
      await sendPush(appointment.client.fcmToken, {
        title: 'BLADE — Actualización de cita',
        body,
        data: { appointmentId: appointment._id.toString(), status, type: 'appointment_response' },
      });
    }

    // Socket — notificar al cliente en tiempo real
    req.app.get('io')
      ?.to(`client_${appointment.client._id}`)
      .emit('appointment_update', { appointmentId: appointment._id, status });

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/appointments/:id/cancel
exports.cancel = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Cita no encontrada' });

    const isClient = String(appointment.client) === String(req.user._id);
    const isBarber = String(appointment.barber) === String(req.user._id);
    if (!isClient && !isBarber && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({ message: 'No se puede cancelar esta cita' });
    }

    appointment.status = 'cancelled';
    appointment.cancelReason = req.body.reason || '';
    await appointment.save();

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
