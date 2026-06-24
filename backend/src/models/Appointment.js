const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  barber:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service:   { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date:      { type: Date, required: true },
  startTime: { type: String, required: true },  // "10:30"
  endTime:   { type: String, required: true },  // "11:15"
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending',
  },
  notes:        { type: String },
  cancelReason: { type: String },
}, { timestamps: true });

appointmentSchema.index({ barber: 1, date: 1 });
appointmentSchema.index({ client: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
