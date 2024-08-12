const {Router} = require('express');
const router = Router();
const multer = require('multer');


const actasOperacionesController = require('../../controllers/actasOperaciones/actasOperaciones');

const storage = multer.diskStorage({
    
  });
  
  
const upload = multer({ storage: storage });

//Ruta para obtener todas las actas de tipo operacion
router.get('/api/getAllActasOperaciones/:page/:itemsPerPage', actasOperacionesController.getAllActasOperaciones);

//Ruta para obtener un acta de operacion dependiendo del filtro
router.get('/api/getBuscarActasDeOperaciones/:page/:itemsPerPage/:registroBuscar/:columnaBuscar', actasOperacionesController.getBuscarActasDeOperaciones);

//Ruta para obtener todas las actas de operaciones de un tecnico en especifico
router.get('/api/getAllActasOperacionesTecnicos/:nombreTecnico', actasOperacionesController.getAllActasOperacionesTecnicos);

//Ruta para crear una nueva acta de tipo operacion
router.post('/api/postCrearActaOperaciones', upload.single('files'), actasOperacionesController.postCrearActaOperaciones)

//Ruta para actualizar el actaDeOperacion al estado aceptada
router.put('/api/putActualizarActaOperacionesAceptar', actasOperacionesController.putActualizarActaOperacionesAceptar)

//Ruta para actualizar el actaDeOperacion al estado rechazada
router.put('/api/putActualizarActaOperacionesRechazar', actasOperacionesController.putActualizarActaOperacionesRechazar)

module.exports = router;