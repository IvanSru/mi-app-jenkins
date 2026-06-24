const router = require('express').Router();
const ctrl   = require('../controllers/serviceController');
const auth   = require('../middleware/auth');
const roles  = require('../middleware/roles');

router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getOne);

// Solo admin gestiona el catálogo
router.post('/',       auth, roles('admin'), ctrl.create);
router.put('/:id',     auth, roles('admin'), ctrl.update);
router.delete('/:id',  auth, roles('admin'), ctrl.remove);

module.exports = router;
