const router = require('express').Router();
const ctrl   = require('../controllers/barberController');
const auth   = require('../middleware/auth');
const roles  = require('../middleware/roles');

router.get('/',                              ctrl.getBarbers);
router.get('/:id',                           ctrl.getBarber);
router.get('/:id/availability',              ctrl.getAvailability);
router.get('/:id/slots',                     ctrl.getAvailableSlots);

// Solo el propio barbero o admin puede modificar disponibilidad
router.post('/availability',          auth, roles('barber', 'admin'), ctrl.setAvailability);
router.delete('/availability/:dayOfWeek', auth, roles('barber', 'admin'), ctrl.deleteAvailability);

module.exports = router;
