const pool = require('../../database/db.js');
const validarToken = require("../../validarTokenServicios/validarToken.js");

const getMarca = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('SELECT * FROM marca');
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


const getOneMarca = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {

      idMarca = req.params.idMarca;

      const [rows] = await pool.query('SELECT * FROM marca where idmarca = ?',idMarca);
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


const postMarca = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    const marca = req.body.marca;

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('insert into marca (marcacol) VALUES (?)', [marca] );
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

const putMarca = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    const idMarca = req.body.idMarca;
    const marca = req.body.marca;

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('update marca set marcacol = ? where idmarca = ?', [marca,idMarca] );
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
  getMarca,
  postMarca,
  getOneMarca,
  putMarca
};