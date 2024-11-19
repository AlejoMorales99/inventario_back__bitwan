const {Router} = require('express');
const {getCategoria,postCategorias,getOneCategoria,putCategoria} = require('../../controllers/categorias/categoriasController');
const router = Router();

//ruta para iniciar sesion
router.get('/api/getCategoria', getCategoria )

router.get('/api/getOneCategoria/:idCategoria', getOneCategoria )

router.post('/api/postCategorias', postCategorias )

router.put('/api/putCategoria', putCategoria )


module.exports = router;