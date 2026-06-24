const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    enum: ['corte_caballero', 'corte_dama', 'barba', 'combo', 'manicure', 'pedicure', 'tinte', 'tratamiento', 'otro'],
    required: true,
  },
  duration: { type: Number, required: true },   // minutos
  price:    { type: Number, required: true },   // COP
  imageUrl: { type: String },
  active:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
