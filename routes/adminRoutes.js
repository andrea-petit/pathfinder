const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/empleados', adminController.registerEmpleado);
router.get('/getEmpleados', adminController.getEmpleados);
router.get('/empleados/:id_empleado', adminController.getEmpleadoById);

module.exports = router;