const pool = require('../../database/db.js');
const validarToken = require("../../validarTokenServicios/validarToken.js");

const getProveedor = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('SELECT * FROM proveedorinven');
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

const getOneProveedor = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {

      const idProveedor = req.params.idProveedor;

      const [rows] = await pool.query('SELECT * FROM proveedorinven where idproveedorInven = ? ', idProveedor);
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

const postProveedores = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    const proveedores = req.body.proveedor;

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('insert into proveedorinven (nombre) VALUES (?) ', [proveedores] );
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

const putProveedores = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    const idProveedor = req.body.idProveedor
    const proveedor = req.body.proveedor;

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query('update proveedorinven set nombre = ? where idproveedorInven = ?', [proveedor,idProveedor] );
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
    getProveedor,
    postProveedores,
    getOneProveedor,
    putProveedores
  };