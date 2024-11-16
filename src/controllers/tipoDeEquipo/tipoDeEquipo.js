const pool = require('../../database/db.js');
const validarToken = require("../../validarTokenServicios/validarToken.js");

const getTipoDeEquipo = async (req, res) => {
  try {
  
    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud
  
    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
  
    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);
  
  
    if (data.code == 200) {
     
      const [rows] = await pool.query(
        `SELECT * FROM tipoequipo;`
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

const getOneTipoDeEquipo = async (req, res) => {
  try {
  
    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud
  
    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
  
    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);
  
  
    if (data.code == 200) {

      const idEquipo = req.params.idEquipo;
     
      const [rows] = await pool.query(
        `SELECT * FROM tipoequipo where idtipoEquipo = ?;`,idEquipo
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


const registrarEquipos = async (req, res) => {
  try {
  
    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud
  
    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
  
    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);
  
  
    if (data.code == 200) {
     
      const equipo = req.body.equipo;
      const [rows] = await pool.query(
        `INSERT INTO tipoequipo (nombreEquipo) VALUES (?)`, [equipo]
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
  
const putTipoDeEquipo = async (req, res) => {
  try {
  
    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud
  
    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
  
    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);
  
  
    if (data.code == 200) {
     
      const idEquipo = req.body.idEquipo;
      const equipo = req.body.equipo;

      const [rows] = await pool.query(
        `update tipoequipo set nombreEquipo = ? where idtipoEquipo = ?`, [equipo,idEquipo]
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
  

module.exports = {
    getTipoDeEquipo,
    registrarEquipos,
    getOneTipoDeEquipo,
    putTipoDeEquipo
  };