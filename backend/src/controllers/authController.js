const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Solo admin puede crear otros barberos/admins
    const safeRole = req.user?.role === 'admin' ? (role || 'client') : 'client';
    const user = await User.create({ name, email, password, role: safeRole, phone });

    res.status(201).json({ token: signToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.active || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    res.json({ token: signToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = (req, res) => res.json({ user: req.user });

exports.updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ message: 'fcmToken requerido' });

    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.json({ message: 'Token FCM actualizado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
