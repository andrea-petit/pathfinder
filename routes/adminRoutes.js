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
router.get('/solicitudesCambioVehiculo', adminController.getSolicitudesCambioVehiculo);
router.post('/aprobarSolicitudVehiculo', adminController.aprobarSolicitudVehiculo);
router.post('/rechazarSolicitudVehiculo', adminController.rechazarSolicitudVehiculo);
router.get('/getAllVehiculosInfo', adminController.getAllVehiculosInfo);


module.exports = router;