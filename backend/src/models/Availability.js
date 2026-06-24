const mongoose = require('mongoose');

// Cada documento = un día de la semana para un barbero
const availabilitySchema = new mongoose.Schema({
  barber:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },  // 0=Dom … 6=Sáb
  startTime: { type: String, required: true },   // "09:00"
  endTime:   { type: String, required: true },   // "18:00"
  breakStart: { type: String },   // "13:00"  (pausa almuerzo, opcional)
  breakEnd:   { type: String },   // "14:00"
  slotDuration: { type: Number, default: 30 },  // minutos por turno
  active: { type: Boolean, default: true },
}, { timestamps: true });

availabilitySchema.index({ barber: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
