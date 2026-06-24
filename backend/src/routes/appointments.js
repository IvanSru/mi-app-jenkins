const router = require('express').Router();
const ctrl   = require('../controllers/appointmentController');
const auth   = require('../middleware/auth');
const roles  = require('../middleware/roles');

// Cliente crea cita
router.post('/',                 auth, roles('client'),        ctrl.create);

// Cada usuario ve sus propias citas
router.get('/my',                auth,                         ctrl.myAppointments);

// Barbero acepta o rechaza
router.patch('/:id/respond',     auth, roles('barber'),        ctrl.respond);

// Cliente o barbero pueden cancelar
router.patch('/:id/cancel',      auth,                         ctrl.cancel);

module.exports = router;
