const express = require('express'); // Importamo la librería Express para crear nuestra aplicación web
const bodyParser = require('body-parser'); // Importamo la librería body-parser para analizar el cuerpo de las solicitudes
const cors = require('cors'); // Importamo la librería CORS para permitir el intercambio de recursos entre dominios
const app = express(); // Creo una instancia de la aplicación Express
const path = require('path');
// Middleware
app.use(bodyParser.json()); // Utilizo el middleware body-parser para analizar el cuerpo de las solicitudes entrantes en formato JSON
app.use(express.json()); // Middleware adicional para analizar el cuerpo de las solicitudes entrantes en formato JSON

// Configuración de CORS
app.use(cors({
  origin: '*' , // Permito solicitudes solo desde http://localhost:4200 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permito estos métodos HTTP
  allowedHeaders: ['Content-Type', 'Authorization'] // Permito estos encabezados en las solicitudes
}));

//---------------------------------------------Rutas de activos fijos-------------------------------------------//
const routerArticulos = require('./routers/articulos/articulos.routes'); // Importo las rutas relacionadas con los artículos
const routerLogin = require('./routers/login/login.routes'); // Importo las rutas relacionadas con el login
const routerActivosFijos = require('./routers/activosFijos/activosFijos.routes'); // Importo las rutas relacionadas con los activos fijos
const routerwiFi = require('./routers/wi-fi/wi-fi.routes'); // Importo las rutas relacionadas con los wifis
const routerNodo = require('./routers/nodo/nodo.routes'); // Importo las rutas relacionadas con los nodos
const routerMarca = require('./routers/marca/marca.routes'); // Importo las rutas relacionadas con las marcas
const routerCategoria = require('./routers/categoria/categoria.routes'); // Importo las rutas relacionadas con las categorias
const routerProveedor = require('./routers/proveedor/provedor.routes'); // Importo las rutas relacionadas con los proveedores
const routerReferencias = require('./routers/referencias/referencias.routes'); // Importo las rutas relacionadas con las referencias
const routerEstados = require('./routers/estados/estados.routes'); // Importo las rutas relacionadas con los estados
const routerTipoDeEquipo = require('./routers/tipoDeEquipo/tipoDeEquipo.routes') //Importo las rutas relacionadas con los tipos de equipo


//---------------------------------------------routes de insumos-------------------------------------------------//
const routerInsumos = require('./routers/insumos/insumos.routes');


//---------------------------------------------routes de actasDeOperaciones-------------------------------------------------//

const routerOperacionesActas = require('./routers/actasOperaciones/actasOperaciones.routes');


//---------------------------------middelwares de activos fijos-------------------------------------------------//
app.use(routerArticulos); // Utilizo las rutas relacionadas con los artículos
app.use(routerLogin); // Utilizo las rutas relacionadas con el login
app.use(routerActivosFijos); // Utilizo las rutas relacionadas con los activos fijos
app.use(routerwiFi); // Utilizo las rutas relacionadas con los wifis
app.use(routerNodo); // Utilizo las rutas relacionadas con los nodos
app.use(routerMarca); // Utilizo las rutas relacionadas con las marcas
app.use(routerCategoria); // Utilizo las rutas relacionadas con las categorias
app.use(routerProveedor); // Utilizo las rutas relacionadas con los proveedores
app.use(routerReferencias); // Utilizo las rutas relacionadas con las referencias
app.use(routerEstados); // Utilizo las rutas relacionadas con los estados
app.use(routerTipoDeEquipo); // Utilizo las rutas relacionadas con los tipos de equipo


//---------------------------------middelwares de insumos-------------------------------------------------//
app.use(routerInsumos);



//---------------------------------middelwares de Operaciones-------------------------------------------------//
app.use(routerOperacionesActas);


app.use('/api/static', express.static(path.join(__dirname, '../uploads')));


module.exports = app; // Exporto la aplicación Express para su uso en otros archivos