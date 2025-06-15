const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/empleados', adminController.registerEmpleado);
router.get('/getEmpleados', adminController.getEmpleados);
router.get('/empleados/:id_empleado', adminController.getEmpleadoById);
router.post('/asignarVehiculo', adminController.asignVehiculo);
router.get('/vehiculos', adminController.getVehiculos);

module.exports = router;