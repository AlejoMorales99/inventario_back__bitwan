const {Router} = require('express');


const {
        postActivosFijos,putActivosFijos,getActivosFijos,getOneActivoFijo,getCopySerial,
        getCopyMac,buscarActivoFijoMover,razonDeMovimiento,tipoDeEntrega,Bodegas,
        postCrearActaDeMovimiento,getAllActaMovimientos, getActasDeMovimientoOperaciones, validarActa,getAllMovimientosTecnicos,getActivosFijosTecnicos,
        anularActa,buscarActivoFijoMoverTecnicos,getAllActas, postMovimientos,getRazonDeMovimientoTecnicos,
        getBodegasTecnicos,retiroCliente,retiroClienteEspecifico,ObtenerTecnicos,buscarRegistros,
        getBodegaAjusteInventario,getRazonesDeMovimiento,buscarRegistrosPorFechaAndServicio,getBodegaAjusteInventarioIngreso,cedulaTecnico,totalActivosFijosTecnicos,cambiarEstadoTecnico,inicio
      } = require('../../controllers/activosFijos/activosFijosController');



const router = Router();
const multer = require('multer');


//funcion para guardar la imagen que se envie desde el frontEnd en el servidor
const storage = multer.diskStorage({
  
});


const upload = multer({ storage: storage });

router.get('/', inicio )

//Ruta para Buscar activos fijos dependiendo de la columna
router.get('/api/buscarRegistros/:buscar/:columna/:nomUsuario/:idUsuario/:page/:itemPerPage', buscarRegistros )

//ruta para buscar activos fijos por fecha inicio fecha fin y bodega
router.get('/api/buscarRegistrosPorFechaAndServicio/:servicio/:columna/:fechaInicio/:fechaFin/:nomUsuario/:idUsuario/:page/:itemPerPage', buscarRegistrosPorFechaAndServicio )

//Ruta para traer todos los activos fijos de la base de datos 
router.get('/api/getActivosFijos/:page/:itemsPerPage', getActivosFijos )

//Ruta para obtener los activos fijos de los tecnicos 
router.get('/api/getActivosFijosTecnicos/:usuarioNombre', getActivosFijosTecnicos )

router.get('/api/totalActivosFijosTecnicos/:numTercero', totalActivosFijosTecnicos )


//Ruta para obtener un solo activo fijo
router.get('/api/getOneActivoFijo/:id', getOneActivoFijo )

//Ruta para verificar si el serial que se este registrando al crear una ont ya existe o no
router.get('/api/getCopySerial/:serial', getCopySerial )

//Ruta para verificar si la mac que se este registrando al crear una ont ya existe o no
router.get('/api/getCopyMac/:mac', getCopyMac )

//Ruta para crear nuevos activos fijos en el sistema
router.post('/api/postActivosFijos', postActivosFijos )

//Ruta para crear nuevos activos fijos en el sistema
router.post('/api/postMovimientos', postMovimientos )


//Ruta para actualizar registros en el sistema
router.put('/api/putActivosFijos', putActivosFijos )

//Ruta que busca la ont en especifico que se desea mover cuando se vaya a hacer el movimiento
router.get('/api/buscarActivoFijoMover/:numero/:usuario/:razon/:bodegaSale', buscarActivoFijoMover )

//Ruta que busca la ont en especifico que se desea mover cuando se vaya a hacer el movimiento en el inventario de los tecnicos
router.get('/api/buscarActivoFijoMoverTecnicos/:numero/:usuario/:numTercero', buscarActivoFijoMoverTecnicos )

//Ruta para obtener las razones de movimiento dependiendo de una condicion
router.get('/api/razonDeMovimiento', razonDeMovimiento )

//ruta para obtener las razones de movimiento dependiendo de una condicion
router.get('/api/movimientos/getRazonesDeMovimiento' , getRazonesDeMovimiento)

//ruta para obtener las razones de movimiento con condicion hacia los tecnicos
router.get('/api/getRazonDeMovimientoTecnicos', getRazonDeMovimientoTecnicos )

//ruta para obtener los tipos de entrega de la base de datos
router.get('/api/tipoDeEntrega', tipoDeEntrega )

//ruta para obtener las bodegas de la base de datos
router.get('/api/Bodegas/:usuario/:razon/:numTercero', Bodegas )

//ruta para las bodegas de los tecnicos de las bases de datos
router.get('/api/getBodegasTecnicos/:usuario/:numTercero', getBodegasTecnicos )

//ruta para mostrar las bodegas de la base de datos dependiendo d euna condicion
router.get('/api/getBodegaAjusteInventario', getBodegaAjusteInventario )

router.get('/api/getBodegaAjusteInventarioIngreso', getBodegaAjusteInventarioIngreso )

//ruta para crear las actas de movimiento con esta funcion tambien se guarda la imgagen que venga desde el front para guardarla
router.post('/api/postCrearActaDeMovimiento', upload.single('files'), postCrearActaDeMovimiento)


//ruta para obtener las actas de movimientos
router.get('/api/getAllActaMovimientos/:page/:itemsPerPage', getAllActaMovimientos )

//ruta para obtener las actas de movimiento de los tecnicos
router.get('/api/getAllMovimientosTecnicos/:nombreUsuario', getAllMovimientosTecnicos )

router.get('/api/getActasDeMovimientoOperaciones/:numTercero/:numServicio' , getActasDeMovimientoOperaciones);

//ruta para obtener las actas de moviento validadas
router.get('/api/validarActa/:id/:servicio/:servicioSale/:nombres/:numeroTercero/:numTerceroCreoActa/:tipoMovimiento', validarActa )

//ruta para obtener las actas anuladas
router.get('/api/anularActa/:id/:servicio/:anular/:nombres/:numeroTercero/:numTerceroCreoActa/:tipoMovimiento', anularActa )

//ruta para obtener una acta en movimiento en especifico con el ID
router.get('/api/getAllActas/:id', getAllActas )


//ruta para retirar un activo fijo de la bodega de un cliente 
router.post('/api/retirarCliente', retiroCliente )



//ruta para retirar un activo fijo del cliente en especifico
router.post('/api/retirarClienteEspecifico', retiroClienteEspecifico )


//----------------------------END-POINT TECNICOS---------------------------//

//ruta para obtener a todos los tecncios
router.get('/api/getTecnicos', ObtenerTecnicos )



router.get('/api/cedulaTecnico/:cedulaTecnico',cedulaTecnico)

router.put('/api/cambiarEstadoTecnico',cambiarEstadoTecnico)

//se exporta las rutas para el archivo principal (index.js)
module.exports = router;