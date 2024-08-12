const {Router} = require('express');
const {getReferencias,postReferencias,getOneReferencia,putReferencias,getTiposEquipos} = require('../../controllers/referencias/referenciaController');
const router = Router();

//ruta para iniciar sesion
router.get('/api/getReferencias', getReferencias )

router.get('/api/getTiposEquipos', getTiposEquipos )

router.get('/api/getOneReferencia/:id', getOneReferencia )

router.post('/api/postReferencias', postReferencias )

router.put('/api/putReferencias', putReferencias )

module.exports = router;