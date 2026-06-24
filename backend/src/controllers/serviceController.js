const Service = require('../models/Service');

exports.getAll = async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.category) filter.category = req.query.category;

    const services = await Service.find(filter).sort('name');
    res.json({ services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service || !service.active) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    res.json({ service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ service });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) return res.status(404).json({ message: 'Servicio no encontrado' });
    res.json({ service });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Servicio desactivado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
