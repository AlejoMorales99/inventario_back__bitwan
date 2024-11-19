const {Router} = require('express');
const {getBodegas,getAllBodegas,crearBodegas,eliminarBodega} = require('../../controllers/bodegas/bodegasController.js');
const router = Router();


router.get('/api/getBodegas', getBodegas )


router.get('/api/getAllBodegas', getAllBodegas )


router.post('/api/crearBodegas', crearBodegas )

router.delete('/api/eliminarBodega/:id', eliminarBodega )



module.exports = router;