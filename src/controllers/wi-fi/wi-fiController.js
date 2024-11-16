const pool = require('../../database/db.js');
const validarToken = require("../../validarTokenServicios/validarToken.js");



const getWifi = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('SELECT * FROM wifi');
      res.status(200).json(rows);
    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error no se pudo establecer la conexion' });
  }
};

const getOneWifi = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud


    
    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {

      const id = req.params.id;


      const [rows] = await pool.query('SELECT * FROM wifi where idwifi = ?',[id]);
      res.status(200).json(rows);
    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error no se pudo establecer la conexion' });
  }
};



const postWifi = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    const wifi = req.body.wifi;

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('insert into wifi (nombre) VALUES (?)', [wifi]);
      res.status(200).json(rows);
    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error no se pudo establecer la conexion' });
  }
};


const wifiEditar = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    const idwifi = req.body.idwifi;
    const nombreWifi = req.body.nombreWifi

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('UPDATE wifi SET nombre = ? WHERE idwifi = ?', [nombreWifi,idwifi]);
      res.status(200).json(rows);
    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error no se pudo establecer la conexion' });
  }
};

module.exports = {
  getWifi,
  postWifi,
  getOneWifi,
  wifiEditar
};