const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/empleados', adminController.registerEmpleado);
router.get('/getEmpleados', adminController.getEmpleados);
router.get('/empleados/:id_empleado', adminController.getEmpleadoById);
router.post('/asignarVehiculo', adminController.asignVehiculo);
router.get('/vehiculos', adminController.getVehiculos);
router.post('/updateEmpleado/:id_empleado', adminController.updateEmpleado);
router.post('/deleteEmpleado/:id_empleado', adminController.deleteEmpleado);

module.exports = router;