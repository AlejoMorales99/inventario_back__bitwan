const {Router} = require('express');
const {getNodo,postNodo,getOneNodo,putNodo} = require('../../controllers/conexionNodo/conexionNodoController');
const router = Router();


router.get('/api/getNodo', getNodo )

router.get('/api/getOneNodo/:id', getOneNodo )

router.post('/api/postNodo', postNodo )

router.put('/api/putNodo', putNodo )

module.exports = router;