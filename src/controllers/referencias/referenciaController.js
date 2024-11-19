// Importar el módulo 'pool' que proporciona la conexión a la base de datos
const pool = require("../../database/db.js");

const validarToken = require("../../validarTokenServicios/validarToken.js");

// Cargar las variables de entorno desde el archivo '.env'
require('dotenv').config({ path: '.env' });


//funcion que obtiene todas las referencias  de la base de datos
const getReferencias = async (req, res) => {
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
  
        const [rows] = await pool.query(`
        select idreferencia , referencia.nombre AS nombre , marca.marcacol Marca , wifi.nombre AS wifi , conexionnodo.nombre AS Nodo, tipoequipo.nombreEquipo
        from referencia 
        inner join marca on marca_idmarca = marca.idmarca
        inner join wifi on wifi_idwifi = wifi.idwifi
        inner join conexionnodo on conexionNodo_idconexionNodo = conexionnodo.idconexionNodo
        inner join tipoequipo on tipoEquipo_idtipoEquipo = idtipoEquipo order by idreferencia desc`);
  
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


const getOneReferencia = async (req, res) => {
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

      const idRefe = req.params.id;

      const [rows] = await pool.query(`select referencia.nombre as referencia , marca.idmarca , marca.marcacol as marca , wifi.idwifi , wifi.nombre as wifi , conexionnodo.idconexionNodo , conexionnodo.nombre as nodo, tipoequipo.idtipoEquipo, tipoequipo.nombreEquipo  from referencia 
      inner join marca on marca_idmarca = marca.idmarca
      inner join wifi on wifi_idwifi = wifi.idwifi
      inner join conexionnodo on conexionNodo_idconexionNodo= conexionnodo.idconexionNodo
      inner join  tipoequipo on tipoEquipo_idtipoEquipo = idtipoEquipo where idreferencia = ?`, idRefe );

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

const getTiposEquipos = async (req, res) => {
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


      const [rows] = await pool.query(`select * from tipoequipo`);

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


const postReferencias = async (req, res) => {
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
        const referenciaText = req.body.referenciaText;
        const marcaText = req.body.marcaText;
        const wifiText = req.body.wifiText;
        const nodoText = req.body.nodoText;
        const tipoEquipo = req.body.tipoEquipo;
  
        const [rows] = await pool.query(
          `INSERT INTO referencia 
            (nombre,marca_idmarca,wifi_idwifi,conexionNodo_idconexionNodo,tipoEquipo_idtipoEquipo) VALUES
            (?, ?, ?, ?, ?)`,
          [
            referenciaText,
            marcaText,
            wifiText,
            nodoText,
            tipoEquipo
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


const putReferencias = async (req, res) => {
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
     
      const referencia = req.body.referencia;
      const marca = req.body.marca;
      const wifi = req.body.wifi;
      const nodo = req.body.nodo;
      const tipoEquipoID = req.body.tipoEquipoID;
      const idParametro = req.body.idParametro;

      const [rows] = await pool.query(`update referencia set nombre = ?, marca_idmarca=?, wifi_idwifi=?,conexionNodo_idconexionNodo=? , tipoEquipo_idtipoEquipo = ? where idreferencia=?`,
      [referencia,marca,wifi,nodo,tipoEquipoID,idParametro]);

     
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
  getReferencias,
  postReferencias,
  getOneReferencia,
  putReferencias,
  getTiposEquipos
};
  