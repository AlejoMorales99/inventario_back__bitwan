// Importar el módulo 'pool' que proporciona la conexión a la base de datos
const pool = require("../../database/db.js");
const validarToken = require("../../validarTokenServicios/validarToken.js");
const finalizarAgenda = require("../finalizarAgenda/finalizarAgenda.js");

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: './guiasinventariobitwan-014a643817e6.json', // Reemplaza con la ruta a tu archivo JSON de credenciales
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

require('dotenv').config({ path: '../../../.env' });

let obtenerUsuarioId;
let servicioActivo
let servicioSaleActivo
let cantidadMovimientos

let servicioActivoCliente
let servicioSaleActivoCliente
let cantidadMovimientosClientes

//-----------------------FUNCIONES DEL MODULO DE REGISTRAS ACTIVOS FIJOS Y EDITAR Y PODER VER SUS REGISTROS Y SUS OTRAS FUNCIONALIDADES COMO VALIDACIONES-----------------------

const inicio = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {

      res.status(200).send('API INVENTARIO');


    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};
const buscarRegistros = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta la siguiente consulta SQL y se obtiene el resultado.

      const buscar = req.params.buscar;
      const columna = req.params.columna;
      const nomUsuario = req.params.nomUsuario;
      const idUsuario = req.params.idUsuario;

      const page = parseInt(req.params.page) || 1; // Página actual
      const itemsPerPage = parseInt(req.params.itemPerPage) || 10;
      const offset = (page - 1) * itemsPerPage;

      const [servicioUsuario] = await pool.query(`SELECT idServicio FROM servicio INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero WHERE LOWER(tercero.tercerocol) = ?`, nomUsuario);


      if (columna == "Numero activo fijo") {


        if (servicioUsuario[0].idServicio == 2) {
          const [rows] = await pool.query(`select 
          idactivoFijo, numeroActivo, 
          activofijo.serial, MAC,
          descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
          DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
          categoriainv.nombre as categoria , 
          estadouso.estadoUsocol AS estado ,
          proveedorinven.nombre as proveedor,
          tercero.tercerocol as servicio,
          referencia_idreferencia as referencia,
          usuario,
          usuarioModifica,
          servicio_Cliente
          from activofijo
          inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
          inner join estadouso on idestadoUso = estadoUso_idestadoUso
          inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
          LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
          LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero where numeroActivo = ? order by idactivoFijo desc LIMIT ${offset}, ${itemsPerPage};`, buscar);

          const [totalItems] = await pool.query('SELECT COUNT(*) AS total FROM activofijo where numeroActivo = ?', buscar);
          res.status(200).json({
            data: rows,
            total: totalItems
          });

        }


      } else if (columna == "Serial") {

        if (servicioUsuario[0].idServicio == 2) {
          const [rows] = await pool.query(
            `select 
          idactivoFijo, numeroActivo, 
          activofijo.serial, MAC,
          descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
          DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
          categoriainv.nombre as categoria , 
          estadouso.estadoUsocol AS estado ,
          proveedorinven.nombre as proveedor,
          tercero.tercerocol as servicio,
          referencia_idreferencia as referencia,
          usuario,
          usuarioModifica,
          servicio_Cliente
          from activofijo
          inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
          inner join estadouso on idestadoUso = estadoUso_idestadoUso
          inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
          LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
          LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero WHERE activofijo.serial LIKE ? ORDER BY idactivoFijo DESC LIMIT ${offset}, ${itemsPerPage};`, [`%${buscar}%`]

          );

          const [totalItems] = await pool.query('SELECT COUNT(*) AS total FROM activofijo where activofijo.serial LIKE ? ', [`%${buscar}%`]);
          res.status(200).json({
            data: rows,
            total: totalItems
          });



        }



      } else if (columna == "MAC") {

        if (servicioUsuario[0].idServicio == 2) {
          const [rows] = await pool.query(`select 
          idactivoFijo, numeroActivo, 
          activofijo.serial, MAC,
          descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
          DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
          categoriainv.nombre as categoria , 
          estadouso.estadoUsocol AS estado ,
          proveedorinven.nombre as proveedor,
          tercero.tercerocol as servicio,
          referencia_idreferencia as referencia,
          usuario,
          usuarioModifica,
          servicio_Cliente
          from activofijo
          inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
          inner join estadouso on idestadoUso = estadoUso_idestadoUso
          inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
          LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
          LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero where MAC = ? order by idactivoFijo desc LIMIT ${offset}, ${itemsPerPage};`, buscar);

          const [totalItems] = await pool.query('SELECT COUNT(*) AS total FROM activofijo where MAC = ?', buscar);
          res.status(200).json({
            data: rows,
            total: totalItems
          });
        }



      } else if (columna == "fecha") {

        const [rows] = await pool.query(`select 
        idactivoFijo, numeroActivo, 
        activofijo.serial, MAC,
        descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
        DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
        categoriainv.nombre as categoria , 
        estadouso.estadoUsocol AS estado ,
        proveedorinven.nombre as proveedor,
        tercero.tercerocol as servicio,
        referencia_idreferencia as referencia,
        usuario,
        usuarioModifica,
        servicio_Cliente
        from activofijo
        inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
        inner join estadouso on idestadoUso = estadoUso_idestadoUso
        inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
        LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
        LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero where fechaIngreso = ? order by idactivoFijo desc LIMIT ${offset}, ${itemsPerPage};`, buscar);

        const [totalItems] = await pool.query('SELECT COUNT(*) AS total FROM activofijo where fechaIngreso = ?', buscar);
        res.status(200).json({
          data: rows,
          total: totalItems
        });

      } else if (columna == "Descripcion") {

        const [rows] = await pool.query(`select 
          idactivoFijo, numeroActivo, 
          activofijo.serial, MAC,
          descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
          DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
          categoriainv.nombre as categoria , 
          estadouso.estadoUsocol AS estado ,
          proveedorinven.nombre as proveedor,
          tercero.tercerocol as servicio,
          referencia_idreferencia as referencia,
          usuario,
          usuarioModifica,
          servicio_Cliente
          from activofijo
          inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
          inner join estadouso on idestadoUso = estadoUso_idestadoUso
          inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
          LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
          LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero WHERE descripcion LIKE ? ORDER BY idactivoFijo DESC LIMIT ${offset}, ${itemsPerPage};`, [`%${buscar}%`]);

        const [totalItems] = await pool.query('SELECT COUNT(*) AS total FROM activofijo where descripcion LIKE ? ', [`%${buscar}%`]);
        res.status(200).json({
          data: rows,
          total: totalItems
        });

      } else if (columna == "categoria") {

        const [rows] = await pool.query(`SELECT 
        idactivoFijo, numeroActivo, activofijo.serial, MAC,
        descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso, 
        DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion, 
        categoriainv.nombre as categoria, 
        estadouso.estadoUsocol AS estado,
        proveedorinven.nombre as proveedor,
        tercero.tercerocol as servicio,
        referencia_idreferencia as referencia,
        usuario,
        usuarioModifica,
        servicio_Cliente
    FROM activofijo
    INNER JOIN categoriainv ON categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
    INNER JOIN estadouso ON idestadoUso = estadoUso_idestadoUso
    INNER JOIN proveedorinven ON idproveedorInven = proveedorInven_idproveedorInven
    LEFT JOIN servicio ON servicio.idservicio = activofijo.servicio_idservicio
    LEFT JOIN tercero ON servicio.tercero_idtercero = tercero.idtercero 
    WHERE categoriainv.nombre LIKE ? ORDER BY idactivoFijo DESC LIMIT ${offset}, ${itemsPerPage};`, [`%${buscar}%`]);

        const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM activofijo inner join categoriainv ON categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
       where categoriainv.nombre LIKE ?` , [`%${buscar}%`]);
        res.status(200).json({
          data: rows,
          total: totalItems
        });

      } else if (columna == "estado") {
        const [rows] = await pool.query(`select 
        idactivoFijo, numeroActivo, 
        activofijo.serial, MAC,
        descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
        DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
        categoriainv.nombre as categoria , 
        estadouso.estadoUsocol AS estado ,
        proveedorinven.nombre as proveedor,
        tercero.tercerocol as servicio,
        referencia_idreferencia as referencia,
        usuario,
        usuarioModifica,
        servicio_Cliente
        from activofijo
        inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
        inner join estadouso on idestadoUso = estadoUso_idestadoUso
        inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
        LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
        LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero 
        where  estadouso.estadoUsocol LIKE ?  order by idactivoFijo desc  LIMIT ${offset}, ${itemsPerPage};`, [`%${buscar}%`]);

        const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM activofijo inner join estadouso on idestadoUso = estadoUso_idestadoUso
        where estadouso.estadoUsocol LIKE ?` , [`%${buscar}%`]);
        res.status(200).json({
          data: rows,
          total: totalItems
        });

      } else if (columna == "proveedor") {
        const [rows] = await pool.query(`select 
        idactivoFijo, numeroActivo, 
        activofijo.serial, MAC,
        descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
        DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
        categoriainv.nombre as categoria , 
        estadouso.estadoUsocol AS estado ,
        proveedorinven.nombre as proveedor,
        tercero.tercerocol as servicio,
        referencia_idreferencia as referencia,
        usuario,
        usuarioModifica,
        servicio_Cliente
        from activofijo
        inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
        inner join estadouso on idestadoUso = estadoUso_idestadoUso
        inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
        LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
        LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero 
        where  proveedorinven.nombre  LIKE ? order by idactivoFijo desc LIMIT ${offset}, ${itemsPerPage};`, [`%${buscar}%`]);

        const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM activofijo   inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
        where proveedorinven.nombre LIKE ?` , [`%${buscar}%`]);
        res.status(200).json({
          data: rows,
          total: totalItems
        });

      } else if (columna == "razon de movimiento") {

        if (servicioUsuario[0].idServicio == 2) {

          const [rows] = await pool.query(`
          SELECT 
          a.idactaMovimiento,
          a.obsActaRecha,
          DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion,
          a.descripcion,
          DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
          a.guiaTransportadora, 
          rm.razonMovimientocol, 
          eam.nombre AS estadoActaMovimiento, 
          te.nombre AS tipoEntrega, 
          ts.tercerocol AS tercerocolEntrada, 
          tss.tercerocol AS tercerocolSalida, 
          a.imgGuiaTrans,
          a.imgActaFisica,
          tu.tercerocol AS nombreUsuarioRegistra,
          ter.tercerocol AS nombreUsuarioValida,
          a.entraCliente,
          a.saleCliente
          FROM actamovimiento a
          INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
          INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
          LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
          LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero where rm.razonMovimientocol LIKE CONCAT('%', ?, '%')
          ORDER BY
              CASE 
                  WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                  WHEN eam.nombre = 'Aceptada' THEN 2
                  WHEN eam.nombre = 'Rechazada' THEN 3
                  ELSE 4 
              END  LIMIT ${offset}, ${itemsPerPage};`, buscar);



          const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actamovimiento a inner join razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          where rm.razonMovimientocol LIKE CONCAT('%', ?, '%')`, buscar);

          res.status(200).json({
            data: rows,
            total: totalItems
          });

        } else {

          const [rows] = await pool.query(`
          SELECT 
          a.idactaMovimiento,
          a.obsActaRecha,
          DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion,
          a.descripcion,
          DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
          a.guiaTransportadora, 
          rm.razonMovimientocol, 
          eam.nombre AS estadoActaMovimiento, 
          te.nombre AS tipoEntrega, 
          ts.tercerocol AS tercerocolEntrada, 
          tss.tercerocol AS tercerocolSalida, 
          a.imgGuiaTrans,
          tu.tercerocol AS nombreUsuarioRegistra,
          ter.tercerocol AS nombreUsuarioValida,
          a.validarActa,
          a.entraCliente,
          a.saleCliente
          FROM actamovimiento a
          INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
          INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
          LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
          LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero where rm.razonMovimientocol = ? && (a.idServicioEntra = ? or a.idServicioSale = ?)
          ORDER BY
              CASE 
                  WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                  WHEN eam.nombre = 'Aceptada' THEN 2
                  WHEN eam.nombre = 'Rechazada' THEN 3
                  ELSE 4 
              END
        
          `, [buscar, servicioUsuario[0].idServicio, servicioUsuario[0].idServicio]);

          // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
          res.status(200).json(rows);

        }

      } else if (columna == "tipo envio") {

        if (servicioUsuario[0].idServicio == 2) {

          const [rows] = await pool.query(`
          SELECT 
          a.idactaMovimiento,
          a.obsActaRecha,
          DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion,
          a.descripcion,
          DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
          a.guiaTransportadora, 
          rm.razonMovimientocol, 
          eam.nombre AS estadoActaMovimiento, 
          te.nombre AS tipoEntrega, 
          ts.tercerocol AS tercerocolEntrada, 
          tss.tercerocol AS tercerocolSalida, 
          a.imgGuiaTrans,
          a.imgActaFisica,
          tu.tercerocol AS nombreUsuarioRegistra,
          ter.tercerocol AS nombreUsuarioValida,
          a.entraCliente,
          a.saleCliente
          FROM actamovimiento a
          INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
          INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
          LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
          LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero where te.nombre  LIKE CONCAT('%', ?, '%')
          ORDER BY
              CASE 
                  WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                  WHEN eam.nombre = 'Aceptada' THEN 2
                  WHEN eam.nombre = 'Rechazada' THEN 3
                  ELSE 4 
              END  LIMIT ${offset}, ${itemsPerPage};`, buscar);

          const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actamovimiento a INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          where te.nombre  LIKE CONCAT('%', ?, '%')`, buscar);


          res.status(200).json({
            data: rows,
            total: totalItems
          });

        } else {

          const [rows] = await pool.query(`
          SELECT 
          a.idactaMovimiento,
          a.obsActaRecha,
          DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion,
          a.descripcion,
          DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
          a.guiaTransportadora, 
          rm.razonMovimientocol, 
          eam.nombre AS estadoActaMovimiento, 
          te.nombre AS tipoEntrega, 
          ts.tercerocol AS tercerocolEntrada, 
          tss.tercerocol AS tercerocolSalida, 
          a.imgGuiaTrans,
          tu.tercerocol AS nombreUsuarioRegistra,
          ter.tercerocol AS nombreUsuarioValida,
          a.validarActa,
          a.entraCliente,
          a.saleCliente
          FROM actamovimiento a
          INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
          INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
          LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
          LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero where te.nombre = ? && (a.idServicioEntra = ? or a.idServicioSale = ?)
          ORDER BY
              CASE 
                  WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                  WHEN eam.nombre = 'Aceptada' THEN 2
                  WHEN eam.nombre = 'Rechazada' THEN 3
                  ELSE 4 
              END
        
          `, [buscar, servicioUsuario[0].idServicio, servicioUsuario[0].idServicio]);

          // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
          res.status(200).json(rows);

        }


      } else if (columna == "estado acta") {

        if (servicioUsuario[0].idServicio == 2) {

          const [rows] = await pool.query(`
          SELECT 
          a.idactaMovimiento,
          a.obsActaRecha,
          DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion,
          a.descripcion,
          DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
          a.guiaTransportadora, 
          rm.razonMovimientocol, 
          eam.nombre AS estadoActaMovimiento, 
          te.nombre AS tipoEntrega, 
          ts.tercerocol AS tercerocolEntrada, 
          tss.tercerocol AS tercerocolSalida, 
          a.imgGuiaTrans,
          a.imgActaFisica,
          tu.tercerocol AS nombreUsuarioRegistra,
          ter.tercerocol AS nombreUsuarioValida,
          a.entraCliente,
          a.saleCliente
          FROM actamovimiento a
          INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
          INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
          LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
          LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero where eam.nombre  LIKE CONCAT('%', ?, '%')
          ORDER BY
              CASE 
                  WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                  WHEN eam.nombre = 'Aceptada' THEN 2
                  WHEN eam.nombre = 'Rechazada' THEN 3
                  ELSE 4 
              END  LIMIT ${offset}, ${itemsPerPage};`, buscar);

          const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actamovimiento a  INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          where eam.nombre  LIKE CONCAT('%', ?, '%')`, buscar);


          res.status(200).json({
            data: rows,
            total: totalItems
          });

        } else {

          const [rows] = await pool.query(`
          SELECT 
          a.idactaMovimiento,
          a.obsActaRecha,
          DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion,
          a.descripcion,
          DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
          a.guiaTransportadora, 
          rm.razonMovimientocol, 
          eam.nombre AS estadoActaMovimiento, 
          te.nombre AS tipoEntrega, 
          ts.tercerocol AS tercerocolEntrada, 
          tss.tercerocol AS tercerocolSalida, 
          a.imgGuiaTrans,
          tu.tercerocol AS nombreUsuarioRegistra,
          ter.tercerocol AS nombreUsuarioValida,
          a.validarActa,
          a.entraCliente,
          a.saleCliente
          FROM actamovimiento a
          INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
          INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
          LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
          LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero where eam.nombre = ? && (a.idServicioEntra = ? or a.idServicioSale = ?)
          ORDER BY
              CASE 
                  WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                  WHEN eam.nombre = 'Aceptada' THEN 2
                  WHEN eam.nombre = 'Rechazada' THEN 3
                  ELSE 4 
              END
        
          `, [buscar, servicioUsuario[0].idServicio, servicioUsuario[0].idServicio]);

          // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
          res.status(200).json(rows);


        }


      } else if (columna == "entra servicio") {

        if (servicioUsuario[0].idServicio == 2) {
          const [rows] = await pool.query(`
          SELECT 
          a.idactaMovimiento,
          a.obsActaRecha,
          DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion,
          a.descripcion,
          DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
          a.guiaTransportadora, 
          rm.razonMovimientocol, 
          eam.nombre AS estadoActaMovimiento, 
          te.nombre AS tipoEntrega, 
          ts.tercerocol AS tercerocolEntrada, 
          tss.tercerocol AS tercerocolSalida, 
          a.imgGuiaTrans,
          a.imgActaFisica,
          tu.tercerocol AS nombreUsuarioRegistra,
          ter.tercerocol AS nombreUsuarioValida,
          a.entraCliente,
          a.saleCliente
          FROM actamovimiento a
          INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
          INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
          LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
          LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero where ts.tercerocol  LIKE CONCAT('%', ?, '%') || a.entraCliente LIKE CONCAT('%', ?, '%')
          ORDER BY
              CASE 
                  WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                  WHEN eam.nombre = 'Aceptada' THEN 2
                  WHEN eam.nombre = 'Rechazada' THEN 3
                  ELSE 4 
              END  LIMIT ${offset}, ${itemsPerPage};`, [buscar, buscar]);



          const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actamovimiento a  
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          where ts.tercerocol  LIKE CONCAT('%', ?, '%') || a.entraCliente LIKE CONCAT('%', ?, '%')`, [buscar, buscar]);

          res.status(200).json({
            data: rows,
            total: totalItems
          });
        } else {

          const [rows] = await pool.query(`
          SELECT 
          a.idactaMovimiento, 
          a.obsActaRecha, 
          DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion, 
          a.descripcion, 
          DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
          a.guiaTransportadora,  
          rm.razonMovimientocol,
          eam.nombre AS estadoActaMovimiento, 
          te.nombre AS tipoEntrega,
          ts.tercerocol AS tercerocolEntrada, 
          tss.tercerocol AS tercerocolSalida, 
          a.imgGuiaTrans, 
          tu.tercerocol AS nombreUsuarioRegistra, 
          ter.tercerocol AS nombreUsuarioValida, 
          a.validarActa, 
          a.entraCliente, 
          a.saleCliente 
          FROM actamovimiento a
          INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
          INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
          LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
          LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero where (ts.tercerocol = ? || a.entraCliente = ?) and (a.idUsuarioRegistra = ? || a.idUsuarioValida = ?)
          ORDER BY
              CASE 
                  WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                  WHEN eam.nombre = 'Aceptada' THEN 2
                  WHEN eam.nombre = 'Rechazada' THEN 3
                  ELSE 4 
              END
        
            
          `, [buscar, buscar, idUsuario, idUsuario]);



          // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
          res.status(200).json(rows);
        }


      } else if (columna == "sale servicio") {

        if (servicioUsuario[0].idServicio == 2) {

          const [rows] = await pool.query(`
          SELECT 
          a.idactaMovimiento,
          a.obsActaRecha,
          DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion,
          a.descripcion,
          DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
          a.guiaTransportadora, 
          rm.razonMovimientocol, 
          eam.nombre AS estadoActaMovimiento, 
          te.nombre AS tipoEntrega, 
          ts.tercerocol AS tercerocolEntrada, 
          tss.tercerocol AS tercerocolSalida, 
          a.imgGuiaTrans,
          a.imgActaFisica,
          tu.tercerocol AS nombreUsuarioRegistra,
          ter.tercerocol AS nombreUsuarioValida,
          a.entraCliente,
          a.saleCliente
          FROM actamovimiento a
          INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
          INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
          LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
          LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero where tss.tercerocol LIKE CONCAT('%', ?, '%') || a.saleCliente LIKE CONCAT('%', ?, '%')
          ORDER BY
              CASE 
                  WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                  WHEN eam.nombre = 'Aceptada' THEN 2
                  WHEN eam.nombre = 'Rechazada' THEN 3
                  ELSE 4 
              END  LIMIT ${offset}, ${itemsPerPage};`, [buscar, buscar]);



          const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actamovimiento a  
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          where tss.tercerocol LIKE CONCAT('%', ?, '%') || a.saleCliente LIKE CONCAT('%', ?, '%')`, [buscar, buscar]);

          res.status(200).json({
            data: rows,
            total: totalItems
          });


        } else {

          const [rows] = await pool.query(`
          SELECT 
          a.idactaMovimiento, 
          a.obsActaRecha, 
          DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion, 
          a.descripcion, 
          DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
          a.guiaTransportadora,  
          rm.razonMovimientocol,
          eam.nombre AS estadoActaMovimiento, 
          te.nombre AS tipoEntrega,
          ts.tercerocol AS tercerocolEntrada, 
          tss.tercerocol AS tercerocolSalida, 
          a.imgGuiaTrans, 
          tu.tercerocol AS nombreUsuarioRegistra, 
          ter.tercerocol AS nombreUsuarioValida, 
          a.validarActa, 
          a.entraCliente, 
          a.saleCliente 
          FROM actamovimiento a
          INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
          INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
          LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
          LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero where (tss.tercerocol = ? || a.saleCliente = ?) and (a.idUsuarioRegistra = ? || a.idUsuarioValida = ?)
          ORDER BY
              CASE 
                  WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                  WHEN eam.nombre = 'Aceptada' THEN 2
                  WHEN eam.nombre = 'Rechazada' THEN 3
                  ELSE 4 
              END
        
            
          `, [buscar, buscar, idUsuario, idUsuario]);



          // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
          res.status(200).json(rows);

        }

      } else if (columna == "fecha creacion") {

        if (servicioUsuario[0].idServicio == 2) {

          const [rows] = await pool.query(`
          SELECT 
          a.idactaMovimiento,
          a.obsActaRecha,
          DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d %H:%i') as fechaValidacion,
          a.descripcion,
          DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d %H:%i') as fechaRegistro, 
          a.guiaTransportadora, 
          rm.razonMovimientocol, 
          eam.nombre AS estadoActaMovimiento, 
          te.nombre AS tipoEntrega, 
          ts.tercerocol AS tercerocolEntrada, 
          tss.tercerocol AS tercerocolSalida, 
          a.imgGuiaTrans,
          a.imgActaFisica,
          tu.tercerocol AS nombreUsuarioRegistra,
          ter.tercerocol AS nombreUsuarioValida,
          a.entraCliente,
          a.saleCliente
          FROM actamovimiento a
          INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
          INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
          INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
          LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
          LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
          LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
          LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
          INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
          INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
          INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
          LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
          LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero WHERE DATE(a.fechaRegistro) LIKE CONCAT('%', ?, '%')
          ORDER BY
              CASE 
                  WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                  WHEN eam.nombre = 'Aceptada' THEN 2
                  WHEN eam.nombre = 'Rechazada' THEN 3
                  ELSE 4 
              END  LIMIT ${offset}, ${itemsPerPage};`, buscar);

          const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actamovimiento a WHERE DATE(a.fechaRegistro) LIKE CONCAT('%', ?, '%')`, buscar);

          res.status(200).json({
            data: rows,
            total: totalItems
          });


        }

      } else if (columna == "fecha aceptacion") {

        const [rows] = await pool.query(`
        SELECT 
        a.idactaMovimiento,
        a.obsActaRecha,
        DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d %H:%i') as fechaValidacion,
        a.descripcion,
        DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d %H:%i') as fechaRegistro, 
        a.guiaTransportadora, 
        rm.razonMovimientocol, 
        eam.nombre AS estadoActaMovimiento, 
        te.nombre AS tipoEntrega, 
        ts.tercerocol AS tercerocolEntrada, 
        tss.tercerocol AS tercerocolSalida, 
        a.imgGuiaTrans,
        a.imgActaFisica,
        tu.tercerocol AS nombreUsuarioRegistra,
        ter.tercerocol AS nombreUsuarioValida,
        a.entraCliente,
        a.saleCliente
        FROM actamovimiento a
        INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
        INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
        INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
        LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
        LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
        LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
        LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
        INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
        INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
        INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
        INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
        LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
        LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero  WHERE DATE(a.fechaValidacion) LIKE CONCAT('%', ?, '%')
        ORDER BY
            CASE 
                WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
                WHEN eam.nombre = 'Aceptada' THEN 2
                WHEN eam.nombre = 'Rechazada' THEN 3
                ELSE 4 
            END  LIMIT ${offset}, ${itemsPerPage};`, buscar);

        const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actamovimiento a  WHERE DATE(a.fechaValidacion) LIKE CONCAT('%', ?, '%')`, buscar);


        res.status(200).json({
          data: rows,
          total: totalItems
        });

      } else if (columna == "verMovimientosOnts") {

        const [rows] = await pool.query(`
        SELECT 
        a.idactaMovimiento,
        a.obsActaRecha,
        DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion,
        a.descripcion,
        DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
        a.guiaTransportadora, 
        rm.razonMovimientocol, 
        eam.nombre AS estadoActaMovimiento, 
        te.nombre AS tipoEntrega, 
        ts.tercerocol AS tercerocolEntrada, 
        tss.tercerocol AS tercerocolSalida, 
        a.imgActaFisica,
        a.imgGuiaTrans,
        tu.tercerocol AS nombreUsuarioRegistra,
        ter.tercerocol AS nombreUsuarioValida,
        a.entraCliente,
        a.saleCliente FROM movimiento 
        inner join actamovimiento a on a.idactaMovimiento = movimiento.actaMovimiento_idactaMovimiento
        inner join activofijo on activofijo.idactivoFijo = movimiento.activoFijo_idactivoFijo
        INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento 
        INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
        INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega 
        LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
        LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
        LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
        LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
        INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
        INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
        INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
        INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
        LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
        LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero where activofijo.numeroActivo = ?
        ORDER BY
          CASE 
            WHEN eam.nombre = 'Pendiente Aceptacion' THEN 1
            WHEN eam.nombre = 'Aceptada' THEN 2
            WHEN eam.nombre = 'Rechazada' THEN 3
            ELSE 4 
        END  LIMIT ${offset}, ${itemsPerPage};`, buscar);


        const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM movimiento 
        inner join activofijo on activofijo.idactivoFijo = movimiento.activoFijo_idactivoFijo where activofijo.numeroActivo = ?`, buscar);


        res.status(200).json({
          data: rows,
          total: totalItems
        });

      } else if (columna == "servicio") {

        if (buscar == "alcala1") {
          const [rows] = await pool.query(`select 
          idactivoFijo, numeroActivo, 
          activofijo.serial, MAC,
          descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
          DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
          categoriainv.nombre as categoria , 
          estadouso.estadoUsocol AS estado ,
          proveedorinven.nombre as proveedor,
          tercero.tercerocol as servicio,
          referencia_idreferencia as referencia,
          usuario,
          usuarioModifica,
          servicio_Cliente
          from activofijo
          inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
          inner join estadouso on idestadoUso = estadoUso_idestadoUso
          inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
          LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
          LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero where servicio_idservicio = 2 order by idactivoFijo desc LIMIT ${offset}, ${itemsPerPage};
          `);

          const [totalItems] = await pool.query('SELECT COUNT(*) AS total FROM activofijo where servicio_idservicio = 2');
          res.status(200).json({
            data: rows,
            total: totalItems
          });

        } else if (buscar == "alcala2") {

          const [rows] = await pool.query(`select 
          idactivoFijo, numeroActivo, 
          activofijo.serial, MAC,
          descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
          DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
          categoriainv.nombre as categoria , 
          estadouso.estadoUsocol AS estado ,
          proveedorinven.nombre as proveedor,
          tercero.tercerocol as servicio,
          referencia_idreferencia as referencia,
          usuario,
          usuarioModifica,
          servicio_Cliente
          from activofijo
          inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
          inner join estadouso on idestadoUso = estadoUso_idestadoUso
          inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
          LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
          LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero where servicio_idservicio = 3 order by idactivoFijo desc LIMIT ${offset}, ${itemsPerPage};
          `);

          const [totalItems] = await pool.query('SELECT COUNT(*) AS total FROM activofijo where servicio_idservicio = 3');
          res.status(200).json({
            data: rows,
            total: totalItems
          });



        } else {
          const [rows] = await pool.query(`select 
          idactivoFijo, numeroActivo, 
          activofijo.serial, MAC,
          descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
          DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
          categoriainv.nombre as categoria , 
          estadouso.estadoUsocol AS estado ,
          proveedorinven.nombre as proveedor,
          tercero.tercerocol as servicio,
          referencia_idreferencia as referencia,
          usuario,
          usuarioModifica,
          servicio_Cliente
          from activofijo
          inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
          inner join estadouso on idestadoUso = estadoUso_idestadoUso
          inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
          LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
          LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero 
          where tercero.tercerocol LIKE ? || servicio_Cliente  LIKE ?  order by idactivoFijo desc LIMIT ${offset}, ${itemsPerPage};`, [[`%${buscar}%`], [`%${buscar}%`]]);

          const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM activofijo 
          LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
          LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero
          where tercero.tercerocol LIKE ?  || servicio_Cliente  LIKE ?`, [[`%${buscar}%`], [`%${buscar}%`],]);
          res.status(200).json({
            data: rows,
            total: totalItems
          });
        }


      }



      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.


    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};


const buscarRegistrosPorFechaAndServicio = async (req, res) => {

  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta la siguiente consulta SQL y se obtiene el resultado.

      const servicio = req.params.servicio;
      const fechaInicio = req.params.fechaInicio;
      const fechaFin = req.params.fechaFin;

      const page = parseInt(req.params.page) || 1; // Página actual
      const itemsPerPage = parseInt(req.params.itemPerPage) || 10;
      const offset = (page - 1) * itemsPerPage;

      if (servicio == "vacio") {

        const [rows] = await pool.query(`select 
        idactivoFijo, numeroActivo, 
        activofijo.serial, MAC,
        descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
        DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
        categoriainv.nombre as categoria , 
        estadouso.estadoUsocol AS estado ,
        proveedorinven.nombre as proveedor,
        tercero.tercerocol as servicio,
        referencia_idreferencia as referencia,
        usuario,
        usuarioModifica,
        servicio_Cliente
        from activofijo
        inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
        inner join estadouso on idestadoUso = estadoUso_idestadoUso
        inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
        LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
        LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero where fechaIngreso >= ? && fechaIngreso <= ? LIMIT ${offset}, ${itemsPerPage};`, [fechaInicio, fechaFin]);

        const [totalItems] = await pool.query('SELECT COUNT(*) AS total FROM activofijo  where fechaIngreso >= ? && fechaIngreso <= ? ', [fechaInicio, fechaFin]);
        res.status(200).json({
          data: rows,
          total: totalItems
        });

      } else {
        const [rows] = await pool.query(`select 
        idactivoFijo, numeroActivo, 
        activofijo.serial, MAC,
        descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
        DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
        categoriainv.nombre as categoria , 
        estadouso.estadoUsocol AS estado ,
        proveedorinven.nombre as proveedor,
        tercero.tercerocol as servicio,
        referencia_idreferencia as referencia,
        usuario,
        usuarioModifica,
        servicio_Cliente
        from activofijo
        inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
        inner join estadouso on idestadoUso = estadoUso_idestadoUso
        inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
        LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
        LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero where (tercerocol = ? || servicio_Cliente=? ) && fechaIngreso >= ? && fechaIngreso <= ? LIMIT ${offset}, ${itemsPerPage}; `, [servicio, servicio, fechaInicio, fechaFin]);

        const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM activofijo 
          LEFT join servicio on servicio.idservicio = activofijo.servicio_idservicio
          LEFT join tercero on servicio.tercero_idtercero = tercero.idtercero
          where (tercerocol = ? || servicio_Cliente=? ) && fechaIngreso >= ? && fechaIngreso <= ? `, [servicio, servicio, fechaInicio, fechaFin]);
        res.status(200).json({
          data: rows,
          total: totalItems
        });
      }



      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.


    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};


//funcion que obtiene todos los activos fijos de la base de datos
const getActivosFijos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta la siguiente consulta SQL y se obtiene el resultado.

      const page = parseInt(req.params.page) || 1; // Página actual
      const itemsPerPage = parseInt(req.params.itemsPerPage) || 10;
      const offset = (page - 1) * itemsPerPage;

      const [rows] = await pool.query(`call obtenerAllActivosFijos(?,?)`, [offset, itemsPerPage]);
      const totalItems = await pool.query('SELECT COUNT(*) AS total FROM activofijo');

      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json({
        data: rows[0],
        total: totalItems[0][0].total
      });

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const getIdActivosFijos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta la siguiente consulta SQL y se obtiene el resultado.

      const numServicio = req.body.numServicio;


      const [rows] = await pool.query(`select idactivoFijo, numeroActivo, MAC, serial  from activofijo where servicio_Cliente = ?`, numServicio);

      if (rows == "") {
        res.status(200).json({ msj: "no existen onts con este numero de servicio" });
      } else {
        // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
        res.status(200).json(rows);
      }




    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

//-------------------------------------------------------------------------------------------------------------------------------------------//


//funcion que obtiene todos los activos fijos de la base de datos del respectivo tecnico que haga la consulta
const getActivosFijosTecnicos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta la siguiente consulta SQL y se obtiene el resultado.

      const numeroTercero = req.params.usuarioNombre;

      const [rows] = await pool.query(`select 
      idactivoFijo, numeroActivo, 
      activofijo.serial, MAC,
      descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fechaIngreso , 
      DATE_FORMAT(fechaModificacion,'%Y-%m-%d') AS fechaModificacion , 
      categoriainv.nombre as categoria , 
      estadouso.estadoUsocol AS estado ,
      proveedorinven.nombre as proveedor,
      tercero.tercerocol as servicio,
      marca.marcacol,
      tipoequipo.nombreEquipo as tipoEquipo,
      referencia.nombre as referencia_ont ,
      referencia_idreferencia as referencia,
      usuario,
      usuarioModifica
      from activofijo
      inner join categoriainv on categoriainv.idcategoriaInv = categoriaInv_idcategoriaInv
      inner join estadouso on idestadoUso = estadoUso_idestadoUso
      inner join proveedorinven on idproveedorInven = proveedorInven_idproveedorInven
      inner join servicio on servicio.idservicio = activofijo.servicio_idservicio
      inner join tercero on servicio.tercero_idtercero = tercero.idtercero 
      inner join referencia on referencia.idreferencia = referencia_idreferencia 
      inner join tipoequipo on tipoequipo.idtipoEquipo = referencia.tipoEquipo_idtipoEquipo
      inner join marca on marca.idmarca = referencia.marca_idmarca where tercero.numeroTercero = ? order by idactivoFijo desc;`, [numeroTercero]);

      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const totalActivosFijosTecnicos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta la siguiente consulta SQL y se obtiene el resultado.

      const numeroTercero = req.params.numTercero;

      const [rows] = await pool.query(`
      select count(idactivoFijo) as total from activofijo 
      inner join servicio on servicio.idservicio = activofijo.servicio_idservicio
      inner join tercero on servicio.tercero_idtercero = tercero.idtercero where tercero.numeroTercero = ? `, numeroTercero);

      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};


//-------------------------------------------------------------------------------------------------------------------------------------------//


//obtener un solo activo fijo para poder editarlo
const getOneActivoFijo = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Se obtiene el parámetro "id" de la solicitud.
      const id = req.params.id;

      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
      const [rows] = await pool.query(
        `select numeroActivo, activofijo.serial, MAC, referencia.idreferencia, referencia.nombre , descripcion, DATE_FORMAT(fechaIngreso,'%Y-%m-%d') AS fh_ingreso , categoriainv.nombre as categoria, estadouso.estadoUsocol, proveedorinven.nombre as proveedor, categoriainv.idcategoriaInv as idcategoria
        from activofijo
        inner join categoriainv on categoriaInv_idcategoriaInv = categoriainv.idcategoriaInv
        inner join estadouso on estadoUso_idestadoUso = estadouso.idestadoUso
        inner join proveedorinven on proveedorInven_idproveedorInven = proveedorinven.idproveedorInven 
        inner join referencia on referencia.idreferencia = referencia_idreferencia where idactivoFijo = ?`, [id]
      );

      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};



//Funcion para crerar activos fijos
const postActivosFijos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Se obtienen los valores necesarios de la solicitud
      const serial = req.body.serial;
      const mac = req.body.mac;
      const textArea = req.body.textArea;
      const BODEGAS_ID = req.body.bodega;
      const proveedor = req.body.proveedor;
      const categoria = req.body.categoria;
      const referencia = req.body.referencia;
      const usuarioNombre = req.body.usuarioNombre;

      const fechaActual = new Date();
      const anio = fechaActual.getFullYear();
      const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaActual.getDate()).padStart(2, "0");
      const fechaFormateada = `${anio}-${mes}-${dia}`;



      const [numeroTotal] = await pool.query("select max(numeroActivo) as numeroActivo from activofijo");

      /*  const usuarioNombre = req.body.usuarioNombre;
 
       const bodegaExcel = req.body.bodegaExcel;
       const textoDelSelectExcel = req.body.textoDelSelectExcel; */

      // Insertar datos en la tabla 'activos_fijos' de la base de datos



      const [rows] = await pool.query(
        `INSERT INTO activofijo 
          (numeroActivo,serial,MAC, descripcion, usuarioModifica, fechaIngreso,usuario,categoriaInv_idcategoriaInv,estadoUso_idestadoUso ,referencia_idreferencia, servicio_idservicio, proveedorInven_idproveedorInven) VALUES
          (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          numeroTotal[0].numeroActivo + 1,
          serial,
          mac,
          textArea,
          "",
          fechaFormateada,
          usuarioNombre,
          categoria,
          1,
          referencia,
          BODEGAS_ID,
          proveedor
        ]
      );

      // Obtener el último ID insertado en la tabla 'activos_fijos'
      /* const [id] = await pool.query(
        `SELECT LAST_INSERT_ID() AS last_id FROM activos_fijos`
      );

      if (id == null) {
        id = authorize().then(ultimoID).catch(console.error);


        async function ultimoID(auth) {
          try {
            // Se crea un objeto "sheets" utilizando la versión "v4" de la API de Google Sheets y la autenticación proporcionada
            const sheets = google.sheets({ version: "v4", auth });

            // Se realiza una consulta para obtener los valores de una hoja de cálculo específica
            const consulta = await sheets.spreadsheets.values.get({
              spreadsheetId: "12QPuQ6Nw77qo19PpuQukFOB2QYUhCedzmHEKNH5zzWk",
              range: "Data!A2:L",
              majorDimension: "ROWS",
            });

            const filas = consulta.data.values;

            if (!filas || filas.length === 0) {
              // Comprueba si no se encontraron datos en la consulta
              console.log("No se encontraron datos.");
              return;
            }

            // Obtén el último ID de la hoja de cálculo
            const ultimoID = filas[filas.length - 1][0];

            console.log('Último ID:', ultimoID);
            return ultimoID;
          } catch (error) {
            console.error('Error al obtener el último ID:', error);
            throw error;
          }
        }


      }

      // Autorizar la conexión con Google Sheets y escribir los datos
      authorize().then(writeData).catch(console.error);

      function writeData(auth) {
        const sheets = google.sheets({
          version: "v4",
          auth,
        });

        // Datos a insertar en la hoja de cálculo
        let values = [
          [
            id[0].last_id,
            macSerial,
            bodegaExcel,
            textoDelSelectExcel,
            descripcion,
            "AUN SIN SERVICIO",
            estado,
            proveedor,
            fh_ingreso,
            "AUN SIN MODIFICACIONES",
            "AUN SIN MODIFICACIONES",
            usuarioNombre,
          ],
        ];

        const resource = {
          values,
        };

        // Agregar los datos en la hoja de cálculo
        sheets.spreadsheets.values.append(
          {
            spreadsheetId: "12QPuQ6Nw77qo19PpuQukFOB2QYUhCedzmHEKNH5zzWk",
            range: "Data!A2",
            valueInputOption: "RAW",
            resource: resource,
          },
          (err, result) => {
            if (err) {
              // Manejar el error
              console.log(err);
            } else {
              console.log(
                "%d cells updated on range: %s",
                result.data.updates.updatedCells,
                result.data.updates.updatedRange
              );
            }
          }
        );
      } */

      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};
//-------------------------------------------------------------------------------------------------------------------------------------------//

//Funcion para actualizar algun activo fijo
const putActivosFijos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Obtener la fecha actual y formatearla
      const fechaActual = new Date();
      const anio = fechaActual.getFullYear();
      const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaActual.getDate()).padStart(2, "0");
      const fechaFormateada = `${anio}-${mes}-${dia}`;

      // Obtener los valores necesarios de la solicitud
      const serial = req.body.serial;
      const macSerial = req.body.macSerial;
      const descripcion = req.body.descripcion;
      const estado = req.body.estado;
      const proveedor = req.body.proveedor;
      const fh_ultima_modificacion = fechaFormateada;
      const categoria = req.body.categoria;
      const ID = req.body.id;
      const idUsuario = req.body.idUsuario;
      const usuarioNombre = req.body.usuarioNombre;
      const referencia = req.body.referencia;


      // Autorizar la conexión con Google Sheets y actualizar los datos
      /* authorize().then(updateData).catch(console.error);

      function updateData(auth) {
        const sheets = google.sheets({
          version: "v4",
          auth,
        });

        sheets.spreadsheets.values.get(
          {
            spreadsheetId: "12QPuQ6Nw77qo19PpuQukFOB2QYUhCedzmHEKNH5zzWk",
            range: "Data!A2:L",
          },
          (err, response) => {
            if (err) {
              console.error(err);
              return;
            }

            const rows = response.data.values;
            let rowIndexToUpdate = -1;

            // Buscar el registro por ID
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              const recordId = row[0]; // Suponiendo que el ID se encuentra en la primera columna

              if (recordId === ID) {
                rowIndexToUpdate = i + 2; // Sumar 2 para ajustar al índice de la hoja de cálculo
                break;
              }
            }

            if (rowIndexToUpdate === -1) {
              console.log("No se encontró un registro con el ID proporcionado.");
              return;
            }

            // Actualizar los valores del registro encontrado
            rows[rowIndexToUpdate - 2][0] = ID;
            rows[rowIndexToUpdate - 2][1] = macSerial;
            rows[rowIndexToUpdate - 2][3] = textoDelSelectExcel;
            rows[rowIndexToUpdate - 2][4] = descripcion;
            rows[rowIndexToUpdate - 2][6] = estado;
            rows[rowIndexToUpdate - 2][7] = proveedor;
            rows[rowIndexToUpdate - 2][8] = fh_ingreso;
            rows[rowIndexToUpdate - 2][9] = fh_ultima_modificacion;
            rows[rowIndexToUpdate - 2][10] = "Edicion";
            rows[rowIndexToUpdate - 2][11] = usuarioNombre;

            // Modificar los valores del registro encontrado en la hoja de cálculo
            const values = [rows[rowIndexToUpdate - 2]];

            const resource = {
              values,
            };

            sheets.spreadsheets.values.update(
              {
                spreadsheetId: "12QPuQ6Nw77qo19PpuQukFOB2QYUhCedzmHEKNH5zzWk",
                range: `Data!A${rowIndexToUpdate}`,
                valueInputOption: "RAW",
                resource: resource,
              },
              (err, result) => {
                if (err) {
                  console.error(err);
                } else {
                  console.log(
                    "%d cells updated on range: %s",
                    result.data.updatedCells,
                    result.data.updatedRange
                  );
                }
              }
            );
          }
        );
      } */

      // Actualizar los valores en la tabla 'activos_fijos' de la base de datos
      const [rows] = await pool.query(
        `update activofijo SET 
          serial=? ,MAC=?, descripcion=?, estadoUso_idestadoUso=? ,referencia_idreferencia=? ,fechaModificacion=?, usuarioModifica=?, categoriaInv_idcategoriaInv=?, proveedorInven_idproveedorInven = ? WHERE idactivoFijo=? `,
        [

          serial,
          macSerial,
          descripcion,
          estado,
          referencia,
          fechaFormateada,
          usuarioNombre,
          categoria,
          proveedor,
          ID,
        ]
      );

      res.status(200).json(rows);

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};
//-------------------------------------------------------------------------------------------------------------------------------------------//


//Funcion para saber si el SERIAL que esta dilingenciando el usuario ya existe en la base de datos o no, esto se informa en el momento que el usuario sale del campo input
const getCopySerial = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Se obtiene el parámetro "id" de la solicitud.
      const serial = req.params.serial;


      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
      const [rows] = await pool.query(
        `SELECT serial FROM inventario.activofijo where serial = ?`, [serial]
      );



      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};
//--------------------------------------------------------------------------------------------------------------------------------------------//


//Funcion para saber si la MAC que esta dilingenciando el usuario ya existe en la base de datos o no, esto se informa en el momento que el usuario sale del campo input
const getCopyMac = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Se obtiene el parámetro "id" de la solicitud.
      const mac = req.params.mac;


      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
      const [rows] = await pool.query(
        `SELECT MAC FROM activofijo where MAC = ?`, [mac]
      );


      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};
//----------------------------AQUI TERMINAN LAS FUNCIONES RELACIONADAS CON EL REGISTRO O EDICION DE ACTIVOS FIJOS-----------------------------------------------//


//---------------------------AQUI COMIENZAN LAS FUNCIONES RELACIONES CON LOS MOVIMIENTOS DE LOS ACTIVOS FIJOS ENTRE BODEGAS-------------------------------------//
const buscarActivoFijoMover = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Se obtiene el parámetro "id" de la solicitud.
      const bodegaSale = req.params.bodegaSale;
      const numero = req.params.numero;
      const usuario = req.params.usuario;
      const razon = req.params.razon;



      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.

      if (razon == 18) {

        const [rows] = await pool.query(
          `SELECT idactivoFijo, activofijo.numeroActivo, categoriainv.nombre as categoria , referencia.nombre as referencia, marca.marcacol as marca, proveedorinven.nombre as proveedor, numeroActivo, activofijo.MAC, activofijo.serial, tercero.tercerocol AS bodega , servicio.idservicio, estadoM FROM activofijo
        INNER JOIN servicio ON servicio.idservicio = activofijo.servicio_idservicio
        inner join categoriainv on categoriainv.idcategoriaInv = activofijo.categoriaInv_idcategoriaInv
        INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero
        inner join referencia on referencia.idreferencia = activofijo.referencia_idreferencia
        inner join marca on marca.idmarca = referencia.marca_idmarca
        inner join proveedorinven on proveedorinven.idproveedorInven = activofijo.proveedorInven_idproveedorInven
        WHERE activofijo.numeroActivo = ?  && servicio.idservicio = ? `, [numero, bodegaSale]
        );

        // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
        res.status(200).json(rows);

      } else if (razon == 17) {

        const [rows] = await pool.query(
          `SELECT idactivoFijo, activofijo.numeroActivo, categoriainv.nombre as categoria , referencia.nombre as referencia, marca.marcacol as marca, proveedorinven.nombre as proveedor, numeroActivo, activofijo.MAC, activofijo.serial, tercero.tercerocol AS bodega , servicio.idservicio, estadoM FROM activofijo
        INNER JOIN servicio ON servicio.idservicio = activofijo.servicio_idservicio
        inner join categoriainv on categoriainv.idcategoriaInv = activofijo.categoriaInv_idcategoriaInv
        INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero
        inner join referencia on referencia.idreferencia = activofijo.referencia_idreferencia
        inner join marca on marca.idmarca = referencia.marca_idmarca
        inner join proveedorinven on proveedorinven.idproveedorInven = activofijo.proveedorInven_idproveedorInven
        WHERE activofijo.numeroActivo = ?  && tercero.tercerocol =? `, [numero, 'venta']
        );

        // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
        res.status(200).json(rows);

      } else {

        const [rows] = await pool.query(
          `SELECT idactivoFijo, activofijo.numeroActivo, categoriainv.nombre as categoria , referencia.nombre as referencia, marca.marcacol as marca, proveedorinven.nombre as proveedor, numeroActivo, activofijo.MAC, activofijo.serial, tercero.tercerocol AS bodega , servicio.idservicio, estadoM FROM activofijo
        INNER JOIN servicio ON servicio.idservicio = activofijo.servicio_idservicio
        inner join categoriainv on categoriainv.idcategoriaInv = activofijo.categoriaInv_idcategoriaInv
        INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero
        inner join referencia on referencia.idreferencia = activofijo.referencia_idreferencia
        inner join marca on marca.idmarca = referencia.marca_idmarca
        inner join proveedorinven on proveedorinven.idproveedorInven = activofijo.proveedorInven_idproveedorInven
        WHERE activofijo.numeroActivo = ?  && tercero.tercerocol =? `, [numero, usuario]
        );

        // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
        res.status(200).json(rows);

      }


    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};


//--------------------------------------------------------------------------------------------------------------//
const buscarActivoFijoMoverTecnicos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Se obtiene el parámetro "id" de la solicitud.
      const numero = req.params.numero;
      const usuario = req.params.usuario;
      const numTercero = req.params.numTercero

      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
      const [rows] = await pool.query(
        `SELECT idactivoFijo, categoriainv.nombre as categoria , referencia.nombre as referencia, marca.marcacol as marca, proveedorinven.nombre as proveedor, numeroActivo, activofijo.MAC, activofijo.serial, tercero.tercerocol AS bodega , servicio.idservicio, estadoM FROM activofijo
        INNER JOIN servicio ON servicio.idservicio = activofijo.servicio_idservicio
        inner join categoriainv on categoriainv.idcategoriaInv = activofijo.categoriaInv_idcategoriaInv
        INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero
        inner join referencia on referencia.idreferencia = activofijo.referencia_idreferencia
        inner join marca on marca.idmarca = referencia.marca_idmarca
        inner join proveedorinven on proveedorinven.idproveedorInven = activofijo.proveedorInven_idproveedorInven
        WHERE activofijo.numeroActivo = ?  && tercero.tercerocol =? && numeroTercero=? `, [numero, usuario, numTercero]
      );

      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);


    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};



const razonDeMovimiento = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.


      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
      const [rows] = await pool.query(`select * from razonmovimiento where 
      razonMovimientocol='Retiro Final' or
      razonMovimientocol ='Envio a Técnico' or
      razonMovimientocol='Salida Baja' or
      razonMovimientocol='Venta Salida' or
      razonMovimientocol='Ajuste Inventario Ingreso ' or
      razonMovimientocol='Ajuste Inventario Salida' ORDER BY 
    CASE razonMovimientocol
      WHEN 'Envio a Técnico' THEN 1
      WHEN 'Retiro Final' THEN 2
      WHEN 'Salida Baja' THEN 3
      WHEN 'Venta Salida' THEN 4
      WHEN 'Ajuste Inventario Ingreso' THEN 5
      WHEN 'Ajuste Inventario Salida' THEN 6
      ELSE 7
    END `);


      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const getRazonesDeMovimiento = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.


      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
      const [rows] = await pool.query(`select idrazonMovimiento, razonMovimientocol from razonmovimiento where 
      razonMovimientocol ='Instalación Inicial' or
      razonMovimientocol='Instalación Traslado' or 
      razonMovimientocol='Instalación Migración' or
      razonMovimientocol='Instalación Soporte' or
      razonMovimientocol='Retiro Final' or
      razonMovimientocol='Retiro Soporte' or
      razonMovimientocol='Retiro Migración' or
      razonMovimientocol='Retiro Traslado'`);


      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const getRazonDeMovimientoTecnicos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const [rows] = await pool.query(`select idrazonMovimiento, razonMovimientocol from razonmovimiento where 
      razonMovimientocol ='Instalación Inicial' or
      razonMovimientocol='Instalación Traslado' or 
      razonMovimientocol='Instalación Migración' or
      razonMovimientocol='Instalación Soporte' or
      razonMovimientocol='Retiro Final' or
      razonMovimientocol='Retiro Soporte' or
      razonMovimientocol='Retiro Migración' or
      razonMovimientocol='Retiro Traslado' or
      razonMovimientocol='Reconexion' or
      razonMovimientocol='Envio a Técnico' or
      razonMovimientocol='Devolución a central'`);

      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);


      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const tipoDeEntrega = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.


      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
      const [rows] = await pool.query(`select * from tipoentrega`);


      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const Bodegas = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const usuario = req.params.usuario
      const razon = req.params.razon;
      const numTercero = req.params.numTercero;

      if (usuario != 'alcala1') {

        if (razon == 'Devolución a central') {

          // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
          const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo
          from servicio 
          inner join tercero on tercero_idtercero = tercero.idtercero 
          inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where  tercero.tercerocol = 'alcala1'`);
          res.status(200).json(rows);
        } else if (razon == 'Instalación Inicial' || razon == 'Instalación Traslado' || razon == 'Instalación Migración' || razon == 'Instalación Soporte') {
          const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo
          from servicio 
          inner join tercero on tercero_idtercero = tercero.idtercero 
          inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where tercero.tercerocol <> ? AND  tercero.tercerocol <> ?  AND  tercero.tercerocol <> ?`, [usuario.toLowerCase().trim(), 'alcala1', 'alcala2']);
          res.status(200).json(rows);
        } else if (razon == 'Retiro Final' || razon == 'Retiro Soporte' || razon == 'Retiro Migración' || razon == 'Retiro Traslado') {
          const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo
          from servicio 
          inner join tercero on tercero_idtercero = tercero.idtercero 
          inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where tercero.tercerocol = ? && tercero.numeroTercero = ? `, [usuario.toLowerCase().trim(), numTercero]);
          res.status(200).json(rows);
        } else if (razon == "Reconexion") {
          // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
          const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo
          from servicio 
          inner join tercero on tercero_idtercero = tercero.idtercero 
          inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where  tercero.tercerocol = ?`, 'alcala1');
          res.status(200).json(rows);
        } else if (razon == "Envio a Técnico") {
          // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
          const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo, tercero.cedula
          from servicio 
          inner join tercero on tercero_idtercero = tercero.idtercero 
          inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where tiposervicio.tipoServiciocol = 'Cuadrilla' && tercero.tercerocol <> ?`, usuario.toLowerCase().trim());
          res.status(200).json(rows);
        } else if (razon == "nodo instalacion") {

          const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo
        from servicio 
        inner join tercero on tercero_idtercero = tercero.idtercero 
        inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where tiposervicio.tipoServiciocol = ?`, 'nodo');

          res.status(200).json(rows);

        } else if (razon == "nodo retiro") {

          const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo
        from servicio 
        inner join tercero on tercero_idtercero = tercero.idtercero 
        inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where tercero.tercerocol = ?`, 'harold');

          res.status(200).json(rows);

        }

        //aqui toca hacer las otras condiciones con los retiros


      } else if (razon == "Envio a Técnico") {

        // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
        const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo, tercero.cedula
        from servicio 
        inner join tercero on tercero_idtercero = tercero.idtercero 
        inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where tiposervicio.tipoServiciocol = 'Cuadrilla'`);
        res.status(200).json(rows);
      } else if (razon == "Salida Baja") {

        // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
        const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo
          from servicio 
          inner join tercero on tercero_idtercero = tercero.idtercero 
          inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where  tercero.tercerocol = ? or tercero.tercerocol = ? `, ['alcala2', 'Pendiente']);
        res.status(200).json(rows);


      } else if (razon == "Ajuste Inventario Salida") {
        // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
        const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo
         from servicio 
         inner join tercero on tercero_idtercero = tercero.idtercero 
         inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where  tercero.tercerocol = ?`, 'alcala1');
        res.status(200).json(rows);
      } else if (razon == "Venta Salida") {
        // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
        const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo
        from servicio 
        inner join tercero on tercero_idtercero = tercero.idtercero 
        inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where  tercero.tercerocol = ?`, 'alcala1');
        res.status(200).json(rows);
      } else if (razon == "Ajuste Inventario Ingreso") {
        // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
        const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo
        from servicio 
        inner join tercero on tercero_idtercero = tercero.idtercero 
        inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where  tercero.tercerocol = ?`, 'alcala1');
        res.status(200).json(rows);
      } else if (razon == 'Retiro Final') {
        const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol AS nombre , tiposervicio.tipoServiciocol as tipo
      from servicio 
      inner join tercero on tercero_idtercero = tercero.idtercero 
      inner join tiposervicio on tipoServicio_idtipoServicio = tiposervicio.idtipoServicio where tercero.tercerocol = ? && tercero.numeroTercero = ? `, [usuario.toLowerCase().trim(), 5065]);
        res.status(200).json(rows);
      }

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const getBodegasTecnicos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const usuario = req.params.usuario;
      const numTercero = req.params.numTercero;

      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
      const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol as nombre from servicio 
      inner join tercero on tercero.idtercero = servicio.tercero_idtercero where tercero.tercerocol = ? && tercero.numeroTercero = ? `, [usuario, numTercero]);


      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const getBodegaAjusteInventario = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
      const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol as nombre from servicio 
      inner join tercero on tercero.idtercero = servicio.tercero_idtercero where tercero.tercerocol = ? or tercero.tercerocol = ? `, ['alcala2', 'Pendiente']);


      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const getBodegaAjusteInventarioIngreso = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
      const [rows] = await pool.query(`select idservicio as ID , tercero.tercerocol as nombre from servicio 
      inner join tercero on tercero.idtercero = servicio.tercero_idtercero where tercero.tercerocol = ?`, 'venta');


      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};



const postCrearActaDeMovimiento = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const RazonMovimiento = req.body.RazonMovimiento;
      const TipoEntrega = req.body.TipoEntrega || 1;
      const BodegaEntra = req.body.BodegaEntra;
      const bodegaSale = req.body.BodegaSale;
      const Descripcion = req.body.Descripcion;
      const GuiaTrasportadora = req.body.GuiaTrasportadora;
      const estadoActa = req.body.estadoActa || 1;
      const nombreUsuario = req.body.nombre;
      const idOnts = JSON.parse(req.body.idOnts);

      const ServicioDelClienteEspecifico = req.body.ServicioDelClienteEspecifico
      const numTercero = req.body.numTercero;
      const idAgenda = req.body.idAgenda;

      const fechaActual = new Date();
      const anio = fechaActual.getFullYear();
      const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaActual.getDate()).padStart(2, "0");
      const hora = String(fechaActual.getHours()).padStart(2, "0");
      const minutos = String(fechaActual.getMinutes()).padStart(2, "0");
      const segundos = String(fechaActual.getSeconds()).padStart(2, "0");

      const fechaFormateada = `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

      async function uploadToDrive(filePath, fileName) {
        const fileMetadata = {
          name: fileName,
          parents: ['1x_5IJyOW5IzK3kenaw4_6NpWt8F_sSfd'],
        };
        const media = {
          mimeType: 'image/jpeg', // Reemplaza según el tipo de archivo
          body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id',
        });

        return response.data.id; // Devuelve el ID del archivo en Google Drive
      }


      let ImgGuia = null;

      if (req.file) {
        const filePath = req.file.path;
        const fileName = req.file.originalname;

        // Sube el archivo a Google Drive y obtén el ID
        const fileId = await uploadToDrive(filePath, fileName);
        ImgGuia = fileId;

        // Borra el archivo temporal después de subirlo a Google Drive
        fs.unlinkSync(filePath);
      }

      const connection = await pool.getConnection();


      try {

        await connection.beginTransaction();

        const [obtenerUsuarioId] = await connection.query('select u.idusuarios from usuarios as u inner join tercero as t on t.idtercero = u.tercero_idtercero where t.tercerocol = ?', nombreUsuario);

        //const [actasRepetidas] = await connection.query(`select * from actamovimiento where idServicioEntra = ? && estadoActaMov_idestadoActaMov = 1 `, BodegaEntra);

        //const [actasRepetidasClientes] = await connection.query(`select * from actamovimiento where entraCliente = ? && estadoActaMov_idestadoActaMov = 1 `, BodegaEntra);


        if (ImgGuia == null) {

          if (RazonMovimiento == 1 || RazonMovimiento == 2 || RazonMovimiento == 3 || RazonMovimiento == 4 || RazonMovimiento == 19) {

            const [rows] = await connection.query(`insert into actamovimiento 
              (descripcion,razonMovimiento_idrazonMovimiento,fechaRegistro,guiaTransportadora,
              imgGuiaTrans,estadoActaMov_idestadoActaMov,TipoEntrega_idTipoEntrega,entraCliente,
              idServicioSale,idUsuarioRegistra,numTercero,idAgenda) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)` , [Descripcion, RazonMovimiento, fechaFormateada, GuiaTrasportadora, ImgGuia, estadoActa, TipoEntrega, BodegaEntra, bodegaSale, obtenerUsuarioId[0].idusuarios, numTercero, idAgenda]);

            const idActaMovimientos = rows.insertId; // Obtener el ID del último registro insertado

            for (let i = 0; i < idOnts.length; i++) {
              const [rows1] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento,estadoMovimiento) VALUES (?,?,?)`, [idOnts[i], idActaMovimientos, 0]);
              const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, idOnts[i]]);
            }

            await connection.commit();
            // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
            res.status(200).json(rows);

          } else if (RazonMovimiento == 9 || RazonMovimiento == 10 || RazonMovimiento == 20) {



            const [rows] = await connection.query(`insert into actamovimiento 
              (descripcion,razonMovimiento_idrazonMovimiento,fechaRegistro,guiaTransportadora,
              imgGuiaTrans,estadoActaMov_idestadoActaMov,TipoEntrega_idTipoEntrega,idServicioEntra,
              idServicioSale,idUsuarioRegistra,numTercero) VALUES (?,?,?,?,?,?,?,?,?,?,?)` , [Descripcion, RazonMovimiento, fechaFormateada, GuiaTrasportadora, ImgGuia, estadoActa, TipoEntrega, BodegaEntra, bodegaSale, obtenerUsuarioId[0].idusuarios, numTercero]);

            const idActaMovimientos = rows.insertId; // Obtener el ID del último registro insertado

            for (let i = 0; i < idOnts.length; i++) {
              const [rows1] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento,estadoMovimiento) VALUES (?,?,?)`, [idOnts[i], idActaMovimientos, 0]);
              const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, idOnts[i]]);
            }

            await connection.commit();
            // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
            res.status(200).json(rows);

          } else if (RazonMovimiento == 5 || RazonMovimiento == 6 || RazonMovimiento == 7 || RazonMovimiento == 8) {

            const [rows] = await connection.query(`insert into actamovimiento 
              (descripcion,razonMovimiento_idrazonMovimiento,fechaRegistro,guiaTransportadora,
              imgGuiaTrans,estadoActaMov_idestadoActaMov,TipoEntrega_idTipoEntrega,idServicioEntra,
              saleCliente,idUsuarioRegistra,numTercero) VALUES (?,?,?,?,?,?,?,?,?,?,?)` , [Descripcion, RazonMovimiento, fechaFormateada, GuiaTrasportadora, ImgGuia, estadoActa, TipoEntrega, BodegaEntra, bodegaSale, obtenerUsuarioId[0].idusuarios, numTercero]);

            const idActaMovimientos = rows.insertId; // Obtener el ID del último registro insertado

            if (ServicioDelClienteEspecifico.length >= 1) {

              const [ontRetirar] = await connection.query(`select idactivoFijo from activofijo where numeroActivo = ?`, [ServicioDelClienteEspecifico]);
              const [rows1] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento,estadoMovimiento) VALUES (?,?,?)`, [ontRetirar[0].idactivoFijo, idActaMovimientos, 0]);
              const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, ontRetirar[0].idactivoFijo]);

              await connection.commit();
              // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
              res.status(200).json(rows);

            } else {

              const [ontRetirar] = await connection.query(`select idactivoFijo from activofijo where numeroActivo = ?`, [idOnts]);
              const [rows1] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento,estadoMovimiento) VALUES (?,?,?)`, [ontRetirar[0].idactivoFijo, idActaMovimientos, 0]);
              const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, ontRetirar[0].idactivoFijo]);

              await connection.commit();
              // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
              res.status(200).json(rows);
            }

          } else if (RazonMovimiento == 14 || RazonMovimiento == 18 || RazonMovimiento == 17) {

            const [rows] = await connection.query(`insert into actamovimiento 
              (descripcion,razonMovimiento_idrazonMovimiento,fechaRegistro,guiaTransportadora,
              imgGuiaTrans,estadoActaMov_idestadoActaMov,TipoEntrega_idTipoEntrega,idServicioEntra,
              idServicioSale,idUsuarioRegistra,numTercero) VALUES (?,?,?,?,?,?,?,?,?,?,?)` , [Descripcion, RazonMovimiento, fechaFormateada, GuiaTrasportadora, ImgGuia, estadoActa, TipoEntrega, BodegaEntra, bodegaSale, obtenerUsuarioId[0].idusuarios, numTercero]);

            const idActaMovimientos = rows.insertId; // Obtener el ID del último registro insertado

            for (let i = 0; i < idOnts.length; i++) {
              const [rows1] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento,estadoMovimiento) VALUES (?,?,?)`, [idOnts[i], idActaMovimientos, 0]);
              const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, idOnts[i]]);
            }

            await connection.commit();
            // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
            res.status(200).json(rows);


          } else if (RazonMovimiento == 15) {
            const [rows] = await connection.query(`insert into actamovimiento 
              (descripcion,razonMovimiento_idrazonMovimiento,fechaRegistro,guiaTransportadora,
              imgGuiaTrans,estadoActaMov_idestadoActaMov,TipoEntrega_idTipoEntrega,idServicioEntra,
              idServicioSale,idUsuarioRegistra,numTercero) VALUES (?,?,?,?,?,?,?,?,?,?,?)` , [Descripcion, RazonMovimiento, fechaFormateada, GuiaTrasportadora, ImgGuia, estadoActa, TipoEntrega, 110, bodegaSale, obtenerUsuarioId[0].idusuarios, numTercero]);

            const idActaMovimientos = rows.insertId; // Obtener el ID del último registro insertado

            for (let i = 0; i < idOnts.length; i++) {
              const [rows1] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento,estadoMovimiento) VALUES (?,?,?)`, [idOnts[i], idActaMovimientos, 0]);
              const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, idOnts[i]]);
            }

            await connection.commit();
            // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
            res.status(200).json(rows);
          }



        } else {

          if (RazonMovimiento == 9 || RazonMovimiento == 10) {

            const [rows] = await connection.query(`insert into actamovimiento 
              (descripcion,razonMovimiento_idrazonMovimiento,fechaRegistro,guiaTransportadora,
              imgGuiaTrans,estadoActaMov_idestadoActaMov,TipoEntrega_idTipoEntrega,idServicioEntra,
              idServicioSale,idUsuarioRegistra,numTercero) VALUES (?,?,?,?,?,?,?,?,?,?,?)` , [Descripcion, RazonMovimiento, fechaFormateada, GuiaTrasportadora, ImgGuia, estadoActa, TipoEntrega, BodegaEntra, bodegaSale, obtenerUsuarioId[0].idusuarios, numTercero]);

            const idActaMovimientos = rows.insertId; // Obtener el ID del último registro insertado

            for (let i = 0; i < idOnts.length; i++) {
              const [rows1] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento,estadoMovimiento) VALUES (?,?,?)`, [idOnts[i], idActaMovimientos, 0]);
              const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, idOnts[i]]);
            }



            await connection.commit();
            // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
            res.status(200).json(rows);

          } else if (RazonMovimiento == 1 || RazonMovimiento == 2 || RazonMovimiento == 3 || RazonMovimiento == 4 || RazonMovimiento == 19) {

            const [rows] = await connection.query(`insert into actamovimiento 
                (descripcion,razonMovimiento_idrazonMovimiento,fechaRegistro,guiaTransportadora,
                imgActaFisica,estadoActaMov_idestadoActaMov,TipoEntrega_idTipoEntrega,entraCliente,
                idServicioSale,idUsuarioRegistra,numTercero, idAgenda) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)` , [Descripcion, RazonMovimiento, fechaFormateada, GuiaTrasportadora, ImgGuia, estadoActa, TipoEntrega, BodegaEntra, bodegaSale, obtenerUsuarioId[0].idusuarios, numTercero, idAgenda]);

            const idActaMovimientos = rows.insertId; // Obtener el ID del último registro insertado

            for (let i = 0; i < idOnts.length; i++) {
              const [rows1] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento,estadoMovimiento) VALUES (?,?,?)`, [idOnts[i], idActaMovimientos, 0]);
              const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, idOnts[i]]);
            }

            await connection.commit();
            // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
            res.status(200).json(rows);


          } else if (RazonMovimiento == 5 || RazonMovimiento == 6 || RazonMovimiento == 7 || RazonMovimiento == 8) {

            const [rows] = await connection.query(`insert into actamovimiento 
                (descripcion,razonMovimiento_idrazonMovimiento,fechaRegistro,guiaTransportadora,
                imgActaFisica,estadoActaMov_idestadoActaMov,TipoEntrega_idTipoEntrega,idServicioEntra,
                saleCliente,idUsuarioRegistra,numTercero,idAgenda) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)` , [Descripcion, RazonMovimiento, fechaFormateada, GuiaTrasportadora, ImgGuia, estadoActa, TipoEntrega, BodegaEntra, bodegaSale, obtenerUsuarioId[0].idusuarios, numTercero, idAgenda]);



            const idActaMovimientos = rows.insertId; // Obtener el ID del último registro insertado
           
            if (ServicioDelClienteEspecifico.length >= 1) {


              const [ontRetirar] = await connection.query(`select idactivoFijo from activofijo where numeroActivo = ?`, [ServicioDelClienteEspecifico]);
              const [rows1] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento,estadoMovimiento) VALUES (?,?,?)`, [ontRetirar[0].idactivoFijo, idActaMovimientos, 0]);
              const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, ontRetirar[0].idactivoFijo]);

              await connection.commit();
              // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
              res.status(200).json(rows);

            } else if (idOnts.length > 1) {

              for (let i = 0; i < idOnts.length; i++) {

                const [rows1] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento,estadoMovimiento) VALUES (?,?,?)`, [idOnts[i], idActaMovimientos, 0]);
                const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, idOnts[i]]);
              }




              await connection.commit();
              // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
              res.status(200).json(rows);
            } else {

              const [rows1] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento,estadoMovimiento) VALUES (?,?,?)`, [idOnts, idActaMovimientos, 0]);
              const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, idOnts]);
              await connection.commit();
              // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
              res.status(200).json(rows);
            }

          }

        }



      } catch (error) {
        await connection.rollback();
        console.error('Error al ejecutar las consultas:', error);
        res.status(500).json({ error: 'Error al ejecutar las consultas' });
      } finally {
        connection.release();
      }



    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};



const getAllActaMovimientos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      const page = parseInt(req.params.page) || 1; // Página actual
      const itemsPerPage = parseInt(req.params.itemsPerPage) || 10;
      const offset = (page - 1) * itemsPerPage;


      const [rows] = await pool.query(`
      SELECT 
      a.idactaMovimiento,
      a.obsActaRecha,
      DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d %H:%i') as fechaValidacion,
      a.descripcion,
      DATE_FORMAT(a.fechaRegistro, '%Y-%m-%d %H:%i') as fechaRegistro, 
      a.guiaTransportadora, 
      rm.razonMovimientocol, 
      eam.nombre AS estadoActaMovimiento, 
      te.nombre AS tipoEntrega, 
      ts.tercerocol AS tercerocolEntrada, 
      tss.tercerocol AS tercerocolSalida, 
      a.imgGuiaTrans,
      a.imgActaFisica,
      tu.tercerocol AS nombreUsuarioRegistra,
      ter.tercerocol AS nombreUsuarioValida,
      a.entraCliente,
      a.saleCliente,
      a.numTercero
  FROM actamovimiento a
  INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
  INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
  INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
  LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
  LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
  LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
  LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
  INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
  INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
  INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
  INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
  LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
  LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero
  ORDER BY idactaMovimiento desc  LIMIT ${offset}, ${itemsPerPage};
    
`);

      const totalItems = await pool.query('SELECT COUNT(*) AS total FROM actamovimiento');


      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json({
        data: rows,
        total: totalItems[0]
      });
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};


const getAllMovimientosTecnicos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const nombreUsuario = req.params.nombreUsuario;

      const [rows] = await pool.query(`
  SELECT 
    a.idactaMovimiento,
    a.obsActaRecha,
    DATE_FORMAT(a.fechaValidacion,'%Y-%m-%d') as fechaValidacion,
    a.descripcion,
    DATE_FORMAT(a.fechaRegistro,'%Y-%m-%d') as fechaRegistro, 
    a.guiaTransportadora, 
    rm.razonMovimientocol, 
    eam.nombre AS estadoActaMovimiento, 
    te.nombre AS tipoEntrega, 
    ts.tercerocol AS tercerocolEntrada, 
    tss.tercerocol AS tercerocolSalida, 
    a.imgGuiaTrans,
    a.imgActaFisica,
    tu.tercerocol AS nombreUsuarioRegistra,
    ter.tercerocol AS nombreUsuarioValida,
    a.entraCliente,
    a.saleCliente,
    a.numTercero
  FROM actamovimiento a
  INNER JOIN razonmovimiento rm ON a.razonMovimiento_idrazonMovimiento = rm.idrazonMovimiento
  INNER JOIN estadoactamov eam ON a.estadoActaMov_idestadoActaMov = eam.idestadoActaMov
  INNER JOIN tipoentrega te ON a.tipoEntrega_idtipoEntrega = te.idTipoEntrega
  LEFT JOIN servicio se ON a.idServicioEntra = se.idservicio
  LEFT JOIN tercero ts ON se.tercero_idtercero = ts.idtercero
  LEFT JOIN servicio ss ON a.idServicioSale = ss.idservicio
  LEFT JOIN tercero tss ON ss.tercero_idtercero = tss.idtercero
  INNER JOIN usuarios u ON u.idusuarios = a.idUsuarioRegistra
  INNER JOIN tercero tu ON tu.idtercero = u.tercero_idtercero
  INNER JOIN usuarios usu ON usu.idusuarios = a.idUsuarioRegistra
  INNER JOIN tercero tt ON tt.idtercero = usu.tercero_idtercero
  LEFT JOIN usuarios usua ON usua.idusuarios = a.idUsuarioValida
  LEFT JOIN tercero ter ON ter.idtercero = usua.tercero_idtercero
  WHERE ts.numeroTercero = ? OR tss.numeroTercero = ?
  ORDER BY idactaMovimiento desc
    
`, [nombreUsuario, nombreUsuario]);


      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const getActasDeMovimientoOperaciones = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const numeroTercero = req.params.numTercero
      const numServicio = req.params.numServicio

      const [rows] = await pool.query(`select idactaMovimiento,entraCliente,numTercero from actamovimiento where entraCliente = ? && numTercero = ? && estadoActaMov_idestadoActaMov = 1`, [numServicio, numeroTercero]);


      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const getActasMovimientoOperacionesValidadas = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {

      

      const idAgenda = req.params.idAgenda;
      const tipoOperacion = req.params.tipoOperacion;

      let actaInstalacionInicialMovimiento;
      let actaInstalacionInicialMarquilla;


      let actaReconexionMovimiento;
      let actaReconexionMarquilla;


      let actaRetiroMovimiento;
      let actaRetiroOperaciones;
      let actaFachadaCasa;

      let actaMigracionInstalacionMovimiento;
      let actaMigracionRetiroMovimiento;
      let actaMigracionOperacionesRetiro;

      let actaTrasladoIntalacionMovimiento;
      let actaTrasladoRetiroMovimiento;
      let actaTrasladoIntalacionMarquilla;
      let actaTrasladoRetiroMarquilla;

      let actaSoporteInstalacionMovimiento;
      let actaSoporteRetiroMovimiento;
      let actaSoporteMarquilla;

      if (tipoOperacion == "Solicitud de instalación") {
      
        const [actaInstalacionInicialMovimientoResult] = await pool.query(`
          SELECT estadoActaMov_idestadoActaMov as estadoActaMovimiento FROM actamovimiento 
          WHERE idAgenda = ? AND razonMovimiento_idrazonMovimiento = 1 ORDER BY idactaMovimiento DESC LIMIT 1`, [idAgenda]);

        const [actaInstalacionInicialMarquillaResult] = await pool.query(`
          SELECT estadoActaOperacion as estadoActaOperaciones FROM actasdeoperaciones 
          WHERE idAgenda = ? AND razonActaOperacion = 29 ORDER BY idactasDeOperaciones DESC LIMIT 1`, [idAgenda]);

        // Verifica que haya resultados antes de intentar acceder a las propiedades
        if (actaInstalacionInicialMovimientoResult.length > 0 && actaInstalacionInicialMarquillaResult.length > 0) {
          actaInstalacionInicialMovimiento = actaInstalacionInicialMovimientoResult[0];
          actaInstalacionInicialMarquilla = actaInstalacionInicialMarquillaResult[0];


          if (actaInstalacionInicialMovimiento.estadoActaMovimiento == 2 && actaInstalacionInicialMarquilla.estadoActaOperaciones == 2) {

            const agendaFinalizada = finalizarAgenda(token, idAgenda);
            console.log(agendaFinalizada);

            res.status(200).json({
              actasDeInstalacionInicial: actaInstalacionInicialMovimiento.estadoActaMovimiento,
              actasDeInstalacionMarquillaInicial: actaInstalacionInicialMarquilla.estadoActaOperaciones
            });

          }else{
            res.status(200).json({
              actasDeInstalacionInicial: actaInstalacionInicialMovimiento.estadoActaMovimiento,
              actasDeInstalacionMarquillaInicial: actaInstalacionInicialMarquilla.estadoActaOperaciones
            });
          }

        } else {
          res.status(200).json({ message: "No se encontraron actas correspondientes de instalacion inicial" });
        }

      } else if (tipoOperacion == "Solicitud de conexión (por suspención temporal)") {

        
          const [actaInstalacionReconexionMovimientoResult] = await pool.query(`
            SELECT estadoActaMov_idestadoActaMov as estadoActaMovimiento FROM actamovimiento 
            WHERE idAgenda = ? AND razonMovimiento_idrazonMovimiento = 19 ORDER BY idactaMovimiento DESC LIMIT 1`, [idAgenda]);

          const [actaInstalacionRexonexionMarquillaResult] = await pool.query(`
            SELECT estadoActaOperacion as estadoActaOperaciones FROM actasdeoperaciones 
            WHERE idAgenda = ? AND razonActaOperacion = 30 ORDER BY idactasDeOperaciones DESC LIMIT 1`, [idAgenda]);

           

          if (actaInstalacionReconexionMovimientoResult.length > 0 || actaInstalacionRexonexionMarquillaResult.length > 0) {

            actaReconexionMovimiento = actaInstalacionReconexionMovimientoResult[0];
            actaReconexionMarquilla = actaInstalacionRexonexionMarquillaResult[0] ?? "vacio";

            
            if(actaReconexionMovimiento.estadoActaMovimiento == 2 && actaReconexionMarquilla.estadoActaOperaciones == 2){

              const agendaFinalizada = finalizarAgenda(token, idAgenda);
              console.log(agendaFinalizada);

              res.status(200).json({
                actasDeReconexionMovimiento: actaReconexionMovimiento.estadoActaMovimiento,
                actasDeOperacionesReconexionMarquilla: actaReconexionMarquilla.estadoActaOperaciones
              });

            }else{
              res.status(200).json({
                actasDeReconexionMovimiento: actaReconexionMovimiento.estadoActaMovimiento,
                 actasDeOperacionesReconexionMarquilla: actaReconexionMarquilla !== "vacio" ? actaReconexionMarquilla.estadoActaOperaciones : "vacio"
              });
            } 

          } else {
            res.status(200).json({ message: "No se encontraron actas correspondientes de reconexion" });
          }


      }else if(tipoOperacion == "Terminación del contrato cancelación del servicio"){
       
        const [actaRetiroMovimientoResult] = await pool.query(`
          SELECT estadoActaMov_idestadoActaMov as estadoActaMovimiento FROM actamovimiento 
          WHERE idAgenda = ? AND razonMovimiento_idrazonMovimiento = 5 ORDER BY idactaMovimiento DESC LIMIT 1`, [idAgenda]);

        const [actaRetiroOperacionesResult] = await pool.query(`
          SELECT estadoActaOperacion as estadoActaOperaciones FROM actasdeoperaciones 
          WHERE idAgenda = ? AND razonActaOperacion = 31 ORDER BY idactasDeOperaciones DESC LIMIT 1`, [idAgenda]);

        const [actaFachadaCasaResult] = await pool.query(`
          SELECT estadoActaOperacion as estadoActaOperaciones FROM actasdeoperaciones 
          WHERE idAgenda = ? AND razonActaOperacion = 28 ORDER BY idactasDeOperaciones DESC LIMIT 1`, [idAgenda]);
 
        if (actaRetiroMovimientoResult.length > 0 || actaRetiroOperacionesResult.length > 0 || actaFachadaCasaResult.length>0) {

           actaRetiroMovimiento = actaRetiroMovimientoResult[0] ?? "vacio"
           actaRetiroOperaciones = actaRetiroOperacionesResult[0]  ?? "vacio"
           actaFachadaCasa = actaFachadaCasaResult[0] ?? "vacio";
        

          if(actaRetiroMovimiento.estadoActaMovimiento == 2 && actaRetiroOperaciones.estadoActaOperaciones == 2){

            const agendaFinalizada = finalizarAgenda(token, idAgenda);
            console.log(agendaFinalizada);

            res.status(200).json({
              actaRetiroMovimiento: actaRetiroMovimiento.estadoActaMovimiento,
              actaRetiroOperaciones: actaRetiroOperaciones.estadoActaOperaciones,
              actaFachadaCasa: actaFachadaCasa.estadoActaOperaciones
            });

          }else if(actaRetiroMovimiento == "vacio" && actaRetiroOperaciones == "vacio" && actaFachadaCasa.estadoActaOperaciones == 2){

            const agendaFinalizada = finalizarAgenda(token, idAgenda);
            console.log(agendaFinalizada);

            res.status(200).json({
              actaRetiroMovimiento: actaRetiroMovimiento.estadoActaMovimiento,
              actaRetiroOperaciones: actaRetiroOperaciones.estadoActaOperaciones,
              actaFachadaCasa: actaFachadaCasa.estadoActaOperaciones
            });

          } else{
            res.status(200).json({
              actaRetiroMovimiento: actaRetiroMovimiento !== "vacio" ? actaRetiroMovimiento.estadoActaMovimiento : "vacio",
              actaRetiroOperaciones: actaRetiroOperaciones !== "vacio" ? actaRetiroOperaciones.estadoActaOperaciones : "vacio",
              actaFachadaCasa: actaFachadaCasa.estadoActaOperaciones
            });
          }

      

        }else{
          res.status(200).json({ message: "No se encontraron actas correspondientes de retiro" });
        }


       
      }else if(tipoOperacion == "Migración"){

        const [actaInstalacionMigracionResult] = await pool.query(`
        SELECT estadoActaMov_idestadoActaMov as estadoActaMovimiento FROM actamovimiento 
        WHERE idAgenda = ? AND razonMovimiento_idrazonMovimiento = 3 ORDER BY idactaMovimiento DESC LIMIT 1`, [idAgenda]);

        const [actaRetiroMigracionResult] = await pool.query(`
        SELECT estadoActaMov_idestadoActaMov as estadoActaMovimiento FROM actamovimiento 
        WHERE idAgenda = ? AND razonMovimiento_idrazonMovimiento = 7 ORDER BY idactaMovimiento DESC LIMIT 1`, [idAgenda]);

        const [actaInstalacionMarquillaMigracionResult] = await pool.query(`
        SELECT estadoActaOperacion as estadoActaOperaciones FROM actasdeoperaciones 
        WHERE idAgenda = ? AND razonActaOperacion = 29 ORDER BY idactasDeOperaciones DESC LIMIT 1`, [idAgenda]);

        if (actaInstalacionMigracionResult.length > 0 || actaRetiroMigracionResult.length > 0 || actaInstalacionMarquillaMigracionResult.length>0) {

          actaMigracionInstalacionMovimiento = actaInstalacionMigracionResult[0] || "vacio";
          actaMigracionRetiroMovimiento = actaRetiroMigracionResult[0] || "vacio";
          actaMigracionOperacionesRetiro = actaInstalacionMarquillaMigracionResult[0] || "vacio"

          if(actaMigracionInstalacionMovimiento.estadoActaMovimiento == 2 && actaMigracionRetiroMovimiento.estadoActaMovimiento == 2 && actaMigracionOperacionesRetiro.estadoActaOperaciones == 2){

            const agendaFinalizada = finalizarAgenda(token, idAgenda);
            console.log(agendaFinalizada);

            res.status(200).json({
              actaMigracionInstalacionMovimiento: actaMigracionInstalacionMovimiento.estadoActaMovimiento,
              actaMigracionRetiroMovimiento: actaMigracionRetiroMovimiento.estadoActaMovimiento,
              actaMigracionOperacionesRetiro: actaMigracionOperacionesRetiro.estadoActaOperaciones
            });

          }else{

            res.status(200).json({
              actaMigracionInstalacionMovimiento: actaMigracionInstalacionMovimiento.estadoActaMovimiento,
              actaMigracionRetiroMovimiento: actaMigracionRetiroMovimiento.estadoActaMovimiento,
              actaMigracionOperacionesRetiro: actaMigracionOperacionesRetiro.estadoActaOperaciones
            });


          }

        }else{
          res.status(200).json({ message: "No se encontraron actas correspondientes de migracion" });
        }

      }else if(tipoOperacion == "Traslado"){

        const [actaInstalacionTrasladoMovimiento] = await pool.query(`
          SELECT estadoActaMov_idestadoActaMov as estadoActaMovimiento FROM actamovimiento 
          WHERE idAgenda = ? AND razonMovimiento_idrazonMovimiento = 2 ORDER BY idactaMovimiento DESC LIMIT 1`, [idAgenda]);
  
          const [actaRetiroTrasladoMovimiento] = await pool.query(`
          SELECT estadoActaMov_idestadoActaMov as estadoActaMovimiento FROM actamovimiento 
          WHERE idAgenda = ? AND razonMovimiento_idrazonMovimiento = 8 ORDER BY idactaMovimiento DESC LIMIT 1`, [idAgenda]);
  
          const [actaInstalacionMarquillaTraslado] = await pool.query(`
          SELECT estadoActaOperacion as estadoActaOperaciones FROM actasdeoperaciones 
          WHERE idAgenda = ? AND razonActaOperacion = 35 ORDER BY idactasDeOperaciones DESC LIMIT 1`, [idAgenda]);
  
          const [actaRetiroMarquillaTraslado] = await pool.query(`
          SELECT estadoActaOperacion as estadoActaOperaciones FROM actasdeoperaciones 
          WHERE idAgenda = ? AND razonActaOperacion = 34 ORDER BY idactasDeOperaciones DESC LIMIT 1`, [idAgenda]);

            if(actaInstalacionTrasladoMovimiento.length>0 || actaRetiroTrasladoMovimiento.length>0 || actaInstalacionMarquillaTraslado.length>0 || actaRetiroMarquillaTraslado.length>0){
             
              actaTrasladoIntalacionMovimiento = actaInstalacionTrasladoMovimiento[0] || "vacio";
              actaTrasladoRetiroMovimiento = actaRetiroTrasladoMovimiento[0] || "vacio";
              actaTrasladoIntalacionMarquilla = actaInstalacionMarquillaTraslado[0] || "vacio";
              actaTrasladoRetiroMarquilla = actaRetiroMarquillaTraslado[0] || "vacio";
              

              if(actaTrasladoIntalacionMovimiento.estadoActaMovimiento == 2 && actaTrasladoRetiroMovimiento.estadoActaMovimiento == 2 && actaTrasladoIntalacionMarquilla.estadoActaOperaciones == 2 && actaTrasladoRetiroMarquilla.estadoActaOperaciones == 2){

                const agendaFinalizada = finalizarAgenda(token, idAgenda);
                console.log(agendaFinalizada);

                
                res.status(200).json({
                  actaTrasladoIntalacionMovimiento: actaTrasladoIntalacionMovimiento.estadoActaMovimiento,
                  actaTrasladoRetiroMovimiento: actaTrasladoRetiroMovimiento.estadoActaMovimiento,
                  actaTrasladoIntalacionMarquilla: actaTrasladoIntalacionMarquilla.estadoActaOperaciones,
                  actaTrasladoRetiroMarquilla:actaTrasladoRetiroMarquilla.estadoActaOperaciones 
                });

              }else if(actaTrasladoIntalacionMovimiento.estadoActaMovimiento == 2 && actaTrasladoRetiroMovimiento.estadoActaMovimiento == 2 &&  actaTrasladoIntalacionMarquilla.estadoActaOperaciones == 2 && actaTrasladoRetiroMarquilla == 'vacio'){

                const agendaFinalizada = finalizarAgenda(token, idAgenda);
                console.log(agendaFinalizada);

                
                res.status(200).json({
                  actaTrasladoIntalacionMovimiento: actaTrasladoIntalacionMovimiento.estadoActaMovimiento,
                  actaTrasladoRetiroMovimiento: actaTrasladoRetiroMovimiento.estadoActaMovimiento,
                  actaTrasladoIntalacionMarquilla: actaTrasladoIntalacionMarquilla.estadoActaOperaciones,
                  actaTrasladoRetiroMarquilla:actaTrasladoRetiroMarquilla.estadoActaOperaciones 
                });

              }else if(actaTrasladoIntalacionMovimiento.estadoActaMovimiento == 2 && actaTrasladoIntalacionMarquilla.estadoActaOperaciones == 2 && actaTrasladoRetiroMarquilla == 'vacio' && actaTrasladoRetiroMovimiento == 'vacio'){

                const agendaFinalizada = finalizarAgenda(token, idAgenda);
                console.log(agendaFinalizada);

                
                res.status(200).json({
                  actaTrasladoIntalacionMovimiento: actaTrasladoIntalacionMovimiento.estadoActaMovimiento,
                  actaTrasladoRetiroMovimiento: actaTrasladoRetiroMovimiento.estadoActaMovimiento,
                  actaTrasladoIntalacionMarquilla: actaTrasladoIntalacionMarquilla.estadoActaOperaciones,
                  actaTrasladoRetiroMarquilla:actaTrasladoRetiroMarquilla.estadoActaOperaciones 
                });

              }else if(actaTrasladoIntalacionMovimiento == 'vacio' && actaTrasladoIntalacionMarquilla == 'vacio' && actaTrasladoRetiroMarquilla.estadoActaOperaciones == 2 && actaTrasladoRetiroMovimiento.estadoActaMovimiento == 2){

                const agendaFinalizada = finalizarAgenda(token, idAgenda);
                console.log(agendaFinalizada);

                
                res.status(200).json({
                  actaTrasladoIntalacionMovimiento: actaTrasladoIntalacionMovimiento.estadoActaMovimiento,
                  actaTrasladoRetiroMovimiento: actaTrasladoRetiroMovimiento.estadoActaMovimiento,
                  actaTrasladoIntalacionMarquilla: actaTrasladoIntalacionMarquilla.estadoActaOperaciones,
                  actaTrasladoRetiroMarquilla:actaTrasladoRetiroMarquilla.estadoActaOperaciones 
                });

              }else if(actaTrasladoIntalacionMovimiento == 'vacio' && actaTrasladoIntalacionMarquilla == 'vacio' && actaTrasladoRetiroMarquilla == 'vacio' && actaTrasladoRetiroMovimiento.estadoActaMovimiento == 2){

                const agendaFinalizada = finalizarAgenda(token, idAgenda);
                console.log(agendaFinalizada);

                
                res.status(200).json({
                  actaTrasladoIntalacionMovimiento: actaTrasladoIntalacionMovimiento.estadoActaMovimiento,
                  actaTrasladoRetiroMovimiento: actaTrasladoRetiroMovimiento.estadoActaMovimiento,
                  actaTrasladoIntalacionMarquilla: actaTrasladoIntalacionMarquilla.estadoActaOperaciones,
                  actaTrasladoRetiroMarquilla:actaTrasladoRetiroMarquilla.estadoActaOperaciones 
                });

              }else{

                
                res.status(200).json({
                  actaTrasladoIntalacionMovimiento: actaTrasladoIntalacionMovimiento.estadoActaMovimiento,
                  actaTrasladoRetiroMovimiento: actaTrasladoRetiroMovimiento.estadoActaMovimiento,
                  actaTrasladoIntalacionMarquilla: actaTrasladoIntalacionMarquilla.estadoActaOperaciones,
                  actaTrasladoRetiroMarquilla:actaTrasladoRetiroMarquilla.estadoActaOperaciones 
                });

              }
             
            }else{
              res.status(200).json({ message: "No se encontraron actas correspondientes de traslado" });
            }


       

      }else if(
        tipoOperacion == "Soporte técnico Internet: Internet intermitente" || 
        tipoOperacion == 'Soporte técnico Internet: Otras fallas de intertnet' || 
        tipoOperacion == 'Soporte técnico Internet: Internet lento' ||
        tipoOperacion == 'Soporte técnico Internet: No hay internet' ||
        tipoOperacion == 'Soporte técnico Internet: Mover WiFi'){

        const [actaInstalacionSoporteMovimientoResult] = await pool.query(`
          SELECT estadoActaMov_idestadoActaMov as estadoActaMovimiento FROM actamovimiento 
          WHERE idAgenda = ? AND razonMovimiento_idrazonMovimiento = 4 ORDER BY idactaMovimiento DESC LIMIT 1`, [idAgenda]);
  
          const [actaRetiroSoporteMovimientoResult] = await pool.query(`
          SELECT estadoActaMov_idestadoActaMov as estadoActaMovimiento FROM actamovimiento 
          WHERE idAgenda = ? AND razonMovimiento_idrazonMovimiento = 6 ORDER BY idactaMovimiento DESC LIMIT 1`, [idAgenda]);
  
          const [actaSoporteMarquillaResult] = await pool.query(`
          SELECT estadoActaOperacion as estadoActaOperaciones FROM actasdeoperaciones 
          WHERE idAgenda = ? AND razonActaOperacion = 32 ORDER BY idactasDeOperaciones DESC LIMIT 1`, [idAgenda]);


        if(actaInstalacionSoporteMovimientoResult.length>0 || actaRetiroSoporteMovimientoResult.length>0 || actaSoporteMarquillaResult.length>0){

          actaSoporteInstalacionMovimiento = actaInstalacionSoporteMovimientoResult[0] || "vacio"
          actaSoporteRetiroMovimiento = actaRetiroSoporteMovimientoResult[0] || "vacio"
          actaSoporteMarquilla = actaSoporteMarquillaResult[0] || "vacio"

      

          if(actaSoporteInstalacionMovimiento.estadoActaMovimiento == 2 && actaSoporteRetiroMovimiento.estadoActaMovimiento == 2 && actaSoporteMarquilla.estadoActaOperaciones == 2){
            
            const agendaFinalizada = finalizarAgenda(token, idAgenda);
            console.log(agendaFinalizada);

                
            res.status(200).json({
              actaSoporteInstalacionMovimiento: actaSoporteInstalacionMovimiento.estadoActaMovimiento,
              actaSoporteRetiroMovimiento: actaSoporteRetiroMovimiento.estadoActaMovimiento,
              actaSoporteMarquilla: actaSoporteMarquilla.estadoActaOperaciones
              
            });

          }else if(actaSoporteInstalacionMovimiento.estadoActaMovimiento == 2 && actaSoporteRetiroMovimiento.estadoActaMovimiento == 2 && actaSoporteMarquilla == 'vacio'){

            const agendaFinalizada = finalizarAgenda(token, idAgenda);
            console.log(agendaFinalizada);

                
            res.status(200).json({
              actaSoporteInstalacionMovimiento: actaSoporteInstalacionMovimiento.estadoActaMovimiento,
              actaSoporteRetiroMovimiento: actaSoporteRetiroMovimiento.estadoActaMovimiento,
              actaSoporteMarquilla: actaSoporteMarquilla.estadoActaOperaciones
              
            });

          }else if(actaSoporteInstalacionMovimiento == 'vacio' && actaSoporteRetiroMovimiento == 'vacio' && actaSoporteMarquilla.estadoActaOperaciones == 2){

            const agendaFinalizada = finalizarAgenda(token, idAgenda);
            console.log(agendaFinalizada);

                
            res.status(200).json({
              actaSoporteInstalacionMovimiento: actaSoporteInstalacionMovimiento.estadoActaMovimiento,
              actaSoporteRetiroMovimiento: actaSoporteRetiroMovimiento.estadoActaMovimiento,
              actaSoporteMarquilla: actaSoporteMarquilla.estadoActaOperaciones
              
            });

          }else{
            
            res.status(200).json({
              actaSoporteInstalacionMovimiento: actaSoporteInstalacionMovimiento.estadoActaMovimiento,
              actaSoporteRetiroMovimiento: actaSoporteRetiroMovimiento.estadoActaMovimiento,
              actaSoporteMarquilla: actaSoporteMarquilla.estadoActaOperaciones
            });

          }


        }else{
          res.status(200).json({ message: "No se encontraron actas correspondientes de soporte" });
        }


        

      }else{
        res.status(200).json({ message: "No se encontro ese tipo de operacion" });
      }


    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};


const validarActa = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      const fechaActual = new Date();
      const anio = fechaActual.getFullYear();
      const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaActual.getDate()).padStart(2, "0");
      const hora = String(fechaActual.getHours()).padStart(2, "0");
      const minutos = String(fechaActual.getMinutes()).padStart(2, "0");
      const segundos = String(fechaActual.getSeconds()).padStart(2, "0");

      const fechaFormateada = `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.
      const id = req.params.id;
      const servicio = req.params.servicio;
      const servicioSale = req.params.servicioSale;
      const nombreUsuario = req.params.nombres;
      const numeroTercero = req.params.numeroTercero;
      const numTerceroCreoActa = req.params.numTerceroCreoActa;
      const tipoMovimiento = req.params.tipoMovimiento;

      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        if (nombreUsuario == 'karol yiseth mosquera alzate' || nombreUsuario == "mari luz pulgarin") {

          if (tipoMovimiento == "Instalación Inicial" || tipoMovimiento == "Instalación Traslado" || tipoMovimiento == "Instalación Migración" || tipoMovimiento == "Instalación Soporte" || tipoMovimiento == 'Reconexion') {
            [obtenerUsuarioId] = await connection.query(`select u.idusuarios from usuarios as u inner join tercero as t on t.idtercero = u.tercero_idtercero where t.tercerocol = ?  `, nombreUsuario);
            [servicioActivo] = await connection.query(`SELECT idServicio FROM servicio INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero WHERE LOWER(tercero.tercerocol) = ? && tercero.numeroTercero = ?`, [servicio, numTerceroCreoActa]);
          } else {
            [obtenerUsuarioId] = await connection.query(`select u.idusuarios from usuarios as u inner join tercero as t on t.idtercero = u.tercero_idtercero where t.tercerocol = ?`, nombreUsuario);
            [servicioActivo] = await connection.query(`SELECT idServicio FROM servicio INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero WHERE LOWER(tercero.tercerocol) = ?`, servicio);
          }

        } else {
          [obtenerUsuarioId] = await connection.query(`select u.idusuarios from usuarios as u inner join tercero as t on t.idtercero = u.tercero_idtercero where t.tercerocol = ? && t.numeroTercero = ? `, [nombreUsuario, numeroTercero]);
          [servicioActivo] = await connection.query(`SELECT idServicio FROM servicio INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero WHERE LOWER(tercero.tercerocol) = ? && tercero.numeroTercero = ?`, [servicio, numeroTercero]);
        }

        if (servicioActivo == "") {
          [servicioActivoCliente] = await connection.query(`SELECT entraCliente as idServicio FROM actamovimiento where entraCliente = ?`, servicio);
        }

        if (tipoMovimiento == "Devolución a central" || tipoMovimiento == "Instalación Inicial" || tipoMovimiento == "Instalación Traslado" || tipoMovimiento == "Instalación Migración" || tipoMovimiento == "Instalación Soporte" || tipoMovimiento == "Reconexion") {

          [servicioSaleActivo] = await connection.query(`SELECT idServicio FROM servicio INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero WHERE LOWER(tercero.tercerocol) = ? && tercero.numeroTercero = ? `, [servicioSale, numTerceroCreoActa]);

        } else {
          [servicioSaleActivo] = await connection.query(`SELECT idServicio FROM servicio INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero WHERE LOWER(tercero.tercerocol) = ? `, servicioSale);
        }

        if (servicioSaleActivo == "") {
          [servicioSaleActivoCliente] = await connection.query(`SELECT saleCliente as idServicio  FROM actamovimiento  WHERE saleCliente = ?`, servicioSale);
        }

        if (servicioActivo == "" && servicioSaleActivo.length > 0) {
          [cantidadMovimientosClientes] = await connection.query(`
            SELECT activofijo.numeroActivo
            FROM movimiento 
            INNER JOIN actamovimiento ON movimiento.actaMovimiento_idactaMovimiento = actamovimiento.idactaMovimiento
            INNER JOIN activofijo ON movimiento.activoFijo_idactivoFijo = activofijo.idactivoFijo
            WHERE actamovimiento.entraCliente = ? && actamovimiento.idServicioSale =? && estadoMovimiento=0 && actamovimiento.estadoActaMov_idestadoActaMov = 1  `, [servicioActivoCliente[0].idServicio, servicioSaleActivo[0].idServicio]);

          for (const movimiento of cantidadMovimientosClientes) {
            await connection.query(
              `UPDATE activofijo SET servicio_idservicio=? , servicio_Cliente=? , estadoM=? WHERE numeroActivo = ?`,
              [servicioActivoCliente[0].idServicio, servicioActivoCliente[0].idServicio, 0, movimiento.numeroActivo]
            );
          }

          const [validarActa] = await connection.query(`update actamovimiento SET idUsuarioValida=? , estadoActaMov_idestadoActaMov=?, fechaValidacion=? where idactaMovimiento = ? `, [obtenerUsuarioId[0].idusuarios, 2, fechaFormateada, id]);



          await connection.commit();
          // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
          res.status(200).json({ estado: 200 });


        } else if (servicioSaleActivo == "" && servicioActivo.length > 0) {

          [cantidadMovimientosClientes] = await connection.query(`
            SELECT activofijo.numeroActivo
            FROM movimiento 
            INNER JOIN actamovimiento ON movimiento.actaMovimiento_idactaMovimiento = actamovimiento.idactaMovimiento
            INNER JOIN activofijo ON movimiento.activoFijo_idactivoFijo = activofijo.idactivoFijo
            WHERE actamovimiento.idServicioEntra = ? && actamovimiento.saleCliente =? && estadoMovimiento=0 && actamovimiento.estadoActaMov_idestadoActaMov = 1  `, [servicioActivo[0].idServicio, servicioSaleActivoCliente[0].idServicio]);

          for (const movimiento of cantidadMovimientosClientes) {
            await connection.query(
              `UPDATE activofijo SET servicio_idservicio=? , servicio_Cliente=? , estadoM=? WHERE numeroActivo = ?`,
              [servicioActivo[0].idServicio, "", 0, movimiento.numeroActivo]
            );
          }

          const [validarActa] = await connection.query(`update actamovimiento SET idUsuarioValida=? , estadoActaMov_idestadoActaMov=?, fechaValidacion=? where idactaMovimiento = ? `, [obtenerUsuarioId[0].idusuarios, 2, fechaFormateada, id]);



          await connection.commit();
          // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
          res.status(200).json({ estado: 200 });


        } else {

          [cantidadMovimientos] = await connection.query(`
            SELECT activofijo.numeroActivo
            FROM movimiento 
            INNER JOIN actamovimiento ON movimiento.actaMovimiento_idactaMovimiento = actamovimiento.idactaMovimiento
            INNER JOIN activofijo ON movimiento.activoFijo_idactivoFijo = activofijo.idactivoFijo
            WHERE actamovimiento.idServicioEntra = ? && actamovimiento.idServicioSale =? && estadoMovimiento=0 && actamovimiento.estadoActaMov_idestadoActaMov = 1 && actamovimiento.idactaMovimiento = ?  `, [servicioActivo[0].idServicio, servicioSaleActivo[0].idServicio, id]);

          for (const movimiento of cantidadMovimientos) {
            await connection.query(
              `UPDATE activofijo SET servicio_idservicio=?  , estadoM=? WHERE numeroActivo = ?`,
              [servicioActivo[0].idServicio, 0, movimiento.numeroActivo]
            );
          }

          const [validarActa] = await connection.query(`update actamovimiento SET idUsuarioValida=? , estadoActaMov_idestadoActaMov=?, fechaValidacion=? where idactaMovimiento = ? `, [obtenerUsuarioId[0].idusuarios, 2, fechaFormateada, id]);



          await connection.commit();
          // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
          res.status(200).json({ estado: 200 });

        }

        /* for (const movimiento of cantidadMovimientos) {
          await connection.query(
            `UPDATE activofijo SET servicio_idservicio=?, estadoM=? WHERE numeroActivo = ?`,
            [servicioActivo[0].idServicio, 0, movimiento.numeroActivo]
          );
        }


        const [validarActa] = await connection.query(`update actamovimiento SET idUsuarioValida=? , estadoActaMov_idestadoActaMov=?, fechaValidacion=? where idactaMovimiento = ? `, [usuario, 2, fechaFormateada, id]);



        await connection.commit();
        // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
        res.status(200).json({ estado: 200 });
 */



      } catch (error) {
        // Rollback de la transacción en caso de error
        await connection.rollback();
        console.error('Error al ejecutar las consultas:', error);
        res.status(500).json({ error: 'Error al ejecutar las consultas' });
      } finally {
        // Liberar la conexión al pool
        connection.release();
      }

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const anularActa = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {

      const fechaActual = new Date();
      const anio = fechaActual.getFullYear();
      const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaActual.getDate()).padStart(2, "0");
      const hora = String(fechaActual.getHours()).padStart(2, "0");
      const minutos = String(fechaActual.getMinutes()).padStart(2, "0");
      const segundos = String(fechaActual.getSeconds()).padStart(2, "0");

      const fechaFormateada = `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const id = req.params.id;
      const nombreUsuario = req.params.nombres;
      const anular = req.params.anular;
      const servicio = req.params.servicio;
      const numeroTercero = req.params.numeroTercero;
      const numTerceroCreoActa = req.params.numTerceroCreoActa;
      const tipoMovimiento = req.params.tipoMovimiento;

      const connection = await pool.getConnection();

      try {

        await connection.beginTransaction();

        if (nombreUsuario == 'karol yiseth mosquera alzate' || nombreUsuario == "mari luz pulgarin") {
          [obtenerUsuarioId] = await connection.query('select u.idusuarios from usuarios as u inner join tercero as t on t.idtercero = u.tercero_idtercero where t.tercerocol = ?', nombreUsuario);
          [servicioActivo] = await connection.query(`SELECT idServicio FROM servicio INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero WHERE LOWER(tercero.tercerocol) = ?`, servicio);
        } else {
          [obtenerUsuarioId] = await connection.query(`select u.idusuarios from usuarios as u inner join tercero as t on t.idtercero = u.tercero_idtercero where t.tercerocol = ? && t.numeroTercero = ? `, [nombreUsuario, numeroTercero]);
          [servicioActivo] = await connection.query(`SELECT idServicio FROM servicio INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero WHERE LOWER(tercero.tercerocol) = ? && tercero.numeroTercero = ?`, [servicio, numeroTercero]);
        }



        if (servicioActivo == "") {

          if (tipoMovimiento == "Devolución a central") {

            [servicioActivo] = await connection.query(`SELECT entraCliente as idServicio FROM actamovimiento WHERE entraCliente = ? && tercero.numeroTercero = ? `, [servicio, numTerceroCreoActa]);

          } else {
            [servicioActivo] = await connection.query(`SELECT entraCliente as idServicio FROM actamovimiento WHERE entraCliente = ?`, servicio);
          }



          const [cantidadMovimientos] = await connection.query(`
          SELECT activofijo.numeroActivo
          FROM movimiento 
          INNER JOIN actamovimiento ON movimiento.actaMovimiento_idactaMovimiento = actamovimiento.idactaMovimiento
          INNER JOIN activofijo ON movimiento.activoFijo_idactivoFijo = activofijo.idactivoFijo
          WHERE actamovimiento.entraCliente = ? && estadoMovimiento=0 && actamovimiento.estadoActaMov_idestadoActaMov = 1 `, servicioActivo[0].idServicio,
          );

          for (const movimiento of cantidadMovimientos) {
            await connection.query(
              `update activofijo SET estadoM=? where numeroActivo = ? `,
              [0, movimiento.numeroActivo]
            );
          }

          const [validarActa] = await connection.query(`update actamovimiento SET idUsuarioValida=? , obsActaRecha=?, estadoActaMov_idestadoActaMov=?, fechaValidacion=? where idactaMovimiento = ? `, [obtenerUsuarioId[0].idusuarios, anular, 3, fechaFormateada, id]);

          await connection.commit();
          // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
          res.status(200).json(validarActa);

        } else {

          const [cantidadMovimientos] = await connection.query(`
          SELECT activofijo.numeroActivo
          FROM movimiento 
          INNER JOIN actamovimiento ON movimiento.actaMovimiento_idactaMovimiento = actamovimiento.idactaMovimiento
          INNER JOIN activofijo ON movimiento.activoFijo_idactivoFijo = activofijo.idactivoFijo
          WHERE actamovimiento.idServicioEntra = ?`, servicioActivo[0].idServicio,
          );

          for (const movimiento of cantidadMovimientos) {
            await connection.query(
              `update activofijo SET estadoM=? where numeroActivo = ? `,
              [0, movimiento.numeroActivo]
            );
          }

          const [validarActa] = await connection.query(`update actamovimiento SET idUsuarioValida=? , obsActaRecha=?, estadoActaMov_idestadoActaMov=?, fechaValidacion=? where idactaMovimiento = ? `, [obtenerUsuarioId[0].idusuarios, anular, 3, fechaFormateada, id]);

          await connection.commit();
          // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
          res.status(200).json(validarActa);

        }




      } catch (error) {
        // Rollback de la transacción en caso de error
        await connection.rollback();
        console.error('Error al ejecutar las consultas:', error);
        res.status(500).json({ error: 'Error al ejecutar las consultas' });
      } finally {
        // Liberar la conexión al pool
        connection.release();
      }



    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const getAllActas = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {

      const id = req.params.id;


      // Se ejecuta una consulta SQL utilizando el parámetro "id" para obtener los datos correspondientes.
      const [rows] = await pool.query(
        `select activofijo.idactivoFijo, activofijo.numeroActivo, activofijo.serial, activofijo.MAC , actamovimiento.idactaMovimiento  from movimiento 
        inner join actamovimiento on movimiento.actaMovimiento_idactaMovimiento = actamovimiento.idactaMovimiento
        inner join activofijo on movimiento.activoFijo_idactivoFijo = activofijo.idactivoFijo where movimiento.actaMovimiento_idactaMovimiento = ? && movimiento.estadoMovimiento=0`, id
      );



      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(rows);
    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};




//-------------------------------------------------------------------------------------------------------------------------------------------//

//Crear activos fijos en el sistema  
const postMovimientos = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Se obtienen los valores necesarios de la solicitud
      const idActivo = req.body.idActivo;
      const idActa = req.body.idActa;

      const connection = await pool.getConnection();

      try {

        await connection.beginTransaction();

        const [rows] = await connection.query(`insert into movimiento (activoFijo_idactivoFijo,actaMovimiento_idactaMovimiento) VALUES (?,?)`, [idActivo, idActa]);

        const [actualizarActivo] = await connection.query(`update activofijo SET estadoM=? where idactivoFijo=? `, [1, idActivo]);

        await connection.commit();

        res.status(200).json(rows);

      } catch (error) {

        // Rollback de la transacción en caso de error
        await connection.rollback();
        console.error('Error al ejecutar las consultas:', error);
        res.status(500).json({ error: 'Error al ejecutar las consultas' });

      } finally {
        // Liberar la conexión al pool
        connection.release();
      }


    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};


const eliminarOntDelActa = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Se obtienen los valores necesarios de la solicitud
      const id = req.params.id;
      const idActa = req.params.idActa;
      console.log(id);
      const connection = await pool.getConnection();

      try {

        await connection.beginTransaction();

        const [valores] = await connection.query(
          `select activofijo.idactivoFijo, estadoactamov.nombre, activofijo.numeroActivo, activofijo.serial, activofijo.MAC , actamovimiento.idactaMovimiento  from movimiento 
          inner join actamovimiento on movimiento.actaMovimiento_idactaMovimiento = actamovimiento.idactaMovimiento
          inner join estadoactamov on actamovimiento.estadoActaMov_idestadoActaMov = estadoactamov.idestadoActaMov
          inner join activofijo on movimiento.activoFijo_idactivoFijo = activofijo.idactivoFijo where activofijo.idactivoFijo = ?`, id
        );

        const [rows] = await connection.query(`update movimiento SET estadoMovimiento=1 where actaMovimiento_idactaMovimiento = ? && activoFijo_idactivoFijo=?`, [idActa, id]);

        const [update] = await connection.query(`UPDATE activofijo SET estadoM=? WHERE idactivoFijo = ?`, [0, id])




        await connection.commit();

        res.status(200).json(valores);

      } catch (error) {

        // Rollback de la transacción en caso de error
        await connection.rollback();
        console.error('Error al ejecutar las consultas:', error);
        res.status(500).json({ error: 'Error al ejecutar las consultas' });

      } finally {
        // Liberar la conexión al pool
        connection.release();
      }


    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};


const retiroCliente = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const numServicio = req.body.numServicio;

      const [rows] = await pool.query(`select idactivoFijo, numeroActivo, MAC, serial from activofijo where servicio_Cliente = ?  && estadoM = ?`, [numServicio, 0]);

      if (rows == "") {

        return res.status(200).json(rows)

      } else if (rows.length > 1) {

        return res.status(200).json(rows)

      } else {

        return res.status(200).json(rows)
      }


    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const retiroClienteEspecifico = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const idActivoFijo = req.body.idActivoFijo;

      const [rows] = await pool.query(`select idactivoFijo, numeroActivo, MAC, serial from activofijo where numeroActivo = ?`, idActivoFijo);

      if (rows == "") {
        return res.status(200).json(rows)
      } else {
        return res.status(200).json(rows)
      }

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};



//-------------------------------END-POINT TECNICOS----------------------------//


const ObtenerTecnicos = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const [rows] = await pool.query(`SELECT idservicio, tercero.tercerocol,numeroTercero FROM servicio 
      inner join tercero on tercero_idtercero = tercero.idtercero where tipoServicio_idtipoServicio = 4 && estado = 0 `);

      res.status(200).json(rows);

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};


const registrarTecnicoNuevo = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      // Se obtienen los valores necesarios de la solicitud
      const nombreTecnico = req.body.nombreTecnico;

      const connection = await pool.getConnection();

      try {

        await connection.beginTransaction();

        const [rows] = await connection.query(`insert into tercero (tercerocol) VALUES (?)`, nombreTecnico);

        const idUltimoTercero = rows.insertId; // Obtener el ID del último registro insertado

        const [rows2] = await connection.query(`insert into servicio (tercero_idtercero,tipoServicio_idtipoServicio) VALUES (?,?) `, [idUltimoTercero, 4]);

        const [rows3] = await connection.query(`SELECT MAX(idusuarios) + 1 AS nuevo_id FROM usuarios`);
        console.log(rows3[0].nuevo_id);

        const [rows4] = await connection.query(`insert into usuarios (idusuarios,tercero_idtercero) VALUES (?,?) `, [rows3[0].nuevo_id, idUltimoTercero]);

        await connection.commit();

        res.status(200).json(rows);

      } catch (error) {

        // Rollback de la transacción en caso de error
        await connection.rollback();
        console.error('Error al ejecutar las consultas:', error);
        res.status(500).json({ error: 'Error al ejecutar las consultas' });

      } finally {
        // Liberar la conexión al pool
        connection.release();
      }


    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const cedulaTecnico = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const cedulaTecnico = req.params.cedulaTecnico;

      const [rows] = await pool.query(`select tercero.cedula from servicio inner join tercero on tercero_idtercero = tercero.idtercero where idservicio = ? `, cedulaTecnico);

      res.status(200).json(rows);

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};

const cambiarEstadoTecnico = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);

    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const numTerceroTecnico = req.body.numTerceroTecnico;
      const [rows] = await pool.query(`update tercero set estado=1 where numeroTercero = ?`, numTerceroTecnico);

      res.status(200).json(rows);

    } else {
      // Si el código de respuesta de la función validarToken no es 200, se imprime un mensaje de "Autorización inválida" en la consola y se devuelve un código de estado 401 con un mensaje indicando que el token es inválido.
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    // Si se produce un error durante la ejecución del código, se captura y se imprime en la consola. Se devuelve un código de estado 500 con un mensaje indicando que no se pudo establecer la conexión.
    console.error(error);
    res.status(500).json({
      message: "Error no se pudo establecer la conexión",
    });
  }
};





module.exports = {
  postActivosFijos,
  putActivosFijos,
  getActivosFijos,
  getIdActivosFijos,
  getOneActivoFijo,
  getCopySerial,
  getCopyMac,
  buscarActivoFijoMover,
  buscarActivoFijoMoverTecnicos,
  razonDeMovimiento,
  getRazonesDeMovimiento,
  getRazonDeMovimientoTecnicos,
  getActasMovimientoOperacionesValidadas,
  tipoDeEntrega,
  Bodegas,
  getBodegasTecnicos,
  postCrearActaDeMovimiento,
  getAllActaMovimientos,
  getAllMovimientosTecnicos,
  getActasDeMovimientoOperaciones,
  validarActa,
  anularActa,
  getActivosFijosTecnicos,
  getAllActas,
  postMovimientos,
  eliminarOntDelActa,
  retiroCliente,
  retiroClienteEspecifico,
  ObtenerTecnicos,
  buscarRegistros,
  registrarTecnicoNuevo,
  getBodegaAjusteInventario,
  buscarRegistrosPorFechaAndServicio,
  getBodegaAjusteInventarioIngreso,
  cedulaTecnico,
  totalActivosFijosTecnicos,
  cambiarEstadoTecnico,
  inicio
};

