const {Router} = require('express');
const {getUsuario,loginUsuario,newUsuario} = require('../../controllers/login/loginController');
const router = Router();

//ruta para iniciar sesion
router.post('/api/getUsuario', getUsuario )

router.get('/api/loginUsuario/:nombreUsuario/:numTercero',loginUsuario)


router.get('/api/postLoginUsuario/:newUsuario/:numtercero/:password',newUsuario)

module.exports = router;