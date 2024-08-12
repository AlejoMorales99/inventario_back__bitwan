const {Router} = require('express');
const {getArticulos} = require('../../controllers/articulos/articulosController');
const router = Router();


router.get('/api/getArticulos', getArticulos )



module.exports = router;