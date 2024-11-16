const pool = require('../../database/db.js');
const validarToken = require("../../validarTokenServicios/validarToken.js");

const getEstado = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('select * from estadouso');
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

const getOneEstados = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {

      const idEstado = req.params.idEstado;


      const [rows] = await pool.query('select * from estadouso where idestadoUso = ? ',idEstado);
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


const postEstados = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    const estado = req.body.estado;

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('insert into estadouso (estadoUsocol) VALUES (?)', [estado] );
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


const putEstados = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    const idEstados = req.body.idEstados;
    const estado = req.body.estado;

    console.log(idEstados,estado);

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('update estadouso set estadoUsocol = ? where idestadoUso = ? ', [estado,idEstados] );
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
  getEstado,
  postEstados,
  getOneEstados,
  putEstados
};