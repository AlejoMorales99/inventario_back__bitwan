const {Router} = require('express');
const router = Router();
const insumosController = require('../../controllers/insumos/insumosControlle');



//Ruta para obtener los insumos dependiendo del usuario
router.get('/api/getAllInsumos/:numeroTercero', insumosController.getAllInsumos );

//Ruta para obtener el historial general de todas las compras de insumos
router.get('/api/getAllHistorialInsumos', insumosController.getAllHistorialInsumos);

//Ruta para obtener el historial de las compras con fecha inicio fecha fin
router.get('/api/getInsumosFechaInicioFechFin/:fechaInicio/:fechaFin/:insumoTextHistorial', insumosController.getInsumosFechaInicioFechFin);

//Ruta para obtener un insumo especifico con su nombre
router.get('/api/getOneNombreInsumo/:insumoText', insumosController.getOneNombreInsumo);

//Ruta para obtener los insumos de un tecnico en especifico
router.get('/api/getInsumoPorTecnico/:servicioTecnico', insumosController.getInsumoPorTecnico);

//Ruta para aumentar la cantidad de insumos existentes
router.post('/api/postInsumosExistentes' , insumosController.postInsumosExistentes);

//Ruta para registrar nuevos insumos en el inventario
router.post('/api/postInsumoNuevo' , insumosController.postInsumoNuevo);


//--------------------------------endPoint de actas de movimiento-------------------------------//

//Ruta para obtener todas las actas de movimiento de insumos
router.get('/api/getAllActasDeMovimiento', insumosController.getAllActasDeMovimiento );

//Ruta para obtener todas las actas de movimiento dependiendo del tecnico
router.get('/api/getAllActasDeMovimientoTecnicos/:numTerceroTecnico/:usuarioSesion', insumosController.getAllActasDeMovimientoTecnicos );

//Ruta para obtener solo los insumos disponibles en el inventario
router.get('/api/getListInsumos', insumosController.getListInsumos );

//Ruta para obtener solo los insumos disponibles en el inventario dependiendo del tecnico
router.get('/api/getListInsumosTecnicos/:numTerceroTecnico', insumosController.getListInsumosTecnicos );


//Ruta para obtener los insumos de un acta de movimiento
router.get('/api/getInsumosPorIdActa/:idActaInsumo', insumosController.getInsumosPorIdActa );

//Ruta para registrar nuevos insumos en el inventario
router.post('/api/postActasDeMovimientosInsumos' , insumosController.postActasDeMovimientosInsumos);

//Ruta para aceptar una acta de movimiento
router.post('/api/putAceptarActaDeMovimiento' , insumosController.putAceptarActaDeMovimiento);

//Ruta para rechazar una acta de movimiento
router.post('/api/putRechazarActaDeMovimiento' , insumosController.putRechazarActaDeMovimiento);



module.exports = router;