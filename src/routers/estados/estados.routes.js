const {Router} = require('express');
const {getEstado,postEstados,getOneEstados,putEstados} = require('../../controllers/estados/estadosController');
const router = Router();

//ruta para iniciar sesion
router.get('/api/getEstados', getEstado )


router.get('/api/getOneEstados/:idEstado', getOneEstados )

router.post('/api/postEstados', postEstados )

router.put('/api/putEstados', putEstados )



module.exports = router;