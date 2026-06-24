// Uso: roles('barber', 'admin')  — pasa después de auth
module.exports = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Acceso denegado — permisos insuficientes' });
  }
  next();
};
