const User = require('../models/User');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');

exports.getBarbers = async (req, res) => {
  try {
    const barbers = await User.find({ role: 'barber', active: true })
      .select('name email phone avatar');
    res.json({ barbers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBarber = async (req, res) => {
  try {
    const barber = await User.findById(req.params.id).select('-password -fcmToken');
    if (!barber || barber.role !== 'barber') {
      return res.status(404).json({ message: 'Barbero no encontrado' });
    }
    res.json({ barber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({ barber: req.params.id, active: true })
      .sort('dayOfWeek');
    res.json({ availability });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/barbers/:id/slots?date=2026-06-25
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const { id: barberId } = req.params;

    if (!date) return res.status(400).json({ message: 'Parámetro date requerido' });

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    const avail = await Availability.findOne({ barber: barberId, dayOfWeek, active: true });
    if (!avail) return res.json({ slots: [], date });

    // Citas ya existentes ese día
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay   = new Date(date + 'T23:59:59.999Z');

    const existing = await Appointment.find({
      barber: barberId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'accepted'] },
    }).select('startTime');

    const booked = new Set(existing.map((a) => a.startTime));
    const slots = buildSlots(avail, booked);

    res.json({ slots, date });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.setAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, breakStart, breakEnd, slotDuration } = req.body;

    const avail = await Availability.findOneAndUpdate(
      { barber: req.user._id, dayOfWeek },
      { startTime, endTime, breakStart, breakEnd, slotDuration: slotDuration || 30, active: true },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ availability: avail });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAvailability = async (req, res) => {
  try {
    const { dayOfWeek } = req.params;
    await Availability.findOneAndUpdate(
      { barber: req.user._id, dayOfWeek },
      { active: false }
    );
    res.json({ message: 'Disponibilidad eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── helpers ───────────────────────────────────────────────────────────────

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function fromMinutes(totalMins) {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function buildSlots(avail, booked) {
  const slots = [];
  const end   = toMinutes(avail.endTime);
  const bkS   = avail.breakStart ? toMinutes(avail.breakStart) : null;
  const bkE   = avail.breakEnd   ? toMinutes(avail.breakEnd)   : null;
  const step  = avail.slotDuration || 30;

  let cur = toMinutes(avail.startTime);
  while (cur + step <= end) {
    // Saltear pausa
    if (bkS !== null && cur >= bkS && cur < bkE) {
      cur = bkE;
      continue;
    }
    const timeStr = fromMinutes(cur);
    slots.push({ time: timeStr, available: !booked.has(timeStr) });
    cur += step;
  }
  return slots;
}
