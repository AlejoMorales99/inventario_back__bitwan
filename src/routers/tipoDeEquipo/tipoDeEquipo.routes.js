const {Router} = require('express');

//se importan todas las funciones del controlador para poder usarlas
const {getTipoDeEquipo,registrarEquipos,getOneTipoDeEquipo,putTipoDeEquipo} = require('../../controllers/tipoDeEquipo/tipoDeEquipo');

const router = Router();


//Ruta para Buscar activos fijos dependiendo de la columna
router.get('/api/getTipoDeEquipo', getTipoDeEquipo )

router.get('/api/getOneTipoDeEquipo/:idEquipo', getOneTipoDeEquipo )

router.post('/api/registrarEquipos',registrarEquipos)

router.put('/api/putTipoDeEquipo',putTipoDeEquipo)

module.exports = router;