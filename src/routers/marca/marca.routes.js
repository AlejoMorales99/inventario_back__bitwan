const {Router} = require('express');
const {getMarca,postMarca,getOneMarca,putMarca} = require('../../controllers/marca/marcaController');
const router = Router();

//ruta para iniciar sesion
router.get('/api/getMarca', getMarca )

router.get('/api/getOneMarca/:idMarca', getOneMarca )

router.post('/api/postMarca', postMarca )

router.put('/api/putMarca', putMarca )

module.exports = router;