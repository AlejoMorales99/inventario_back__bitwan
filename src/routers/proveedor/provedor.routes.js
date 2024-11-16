const {Router} = require('express');
const {getProveedor,postProveedores,getOneProveedor,putProveedores} = require('../../controllers/proveedor/proveedorController');
const router = Router();

//ruta para iniciar sesion
router.get('/api/getProveedor', getProveedor )

router.get('/api/getOneProveedor/:idProveedor', getOneProveedor )

router.post('/api/postProveedores', postProveedores )

router.put('/api/putProveedor', putProveedores )

module.exports = router;