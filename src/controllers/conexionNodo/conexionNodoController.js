//importo el archivo database el cual me permite realizar las consultas a la base de datos
const pool = require('../../database/db.js');

//importo el archivo validarToken el cual me confirma si el token que se envia el valido o no o si ya expiro
const validarToken = require("../../validarTokenServicios/validarToken.js");

//funcion para obtener todos los nodos de la base de datos
const getNodo = async (req, res) => {
    try {
  
      //guardo el token de autorizacion que viene en el encabezado de la solicitud
      const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud
  
      //si no se manda ningun token en el encabezado se le envio un mensaje al usuario de que no se envio el token de acceso
      if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
      }
  
       //se envia el token a la funcion validarToken
      const data = await validarToken(token)
  
       //si el token es correcto obtendremos un code = 200 y podemos realizar la consulta a la base de datos si no enviaremos un mensaje al usuario diciendo token invalido 
      if (data.code == 200) {
        const [rows] = await pool.query('SELECT * FROM conexionnodo');
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


const getOneNodo = async (req, res) => {
    try {
  
      //guardo el token de autorizacion que viene en el encabezado de la solicitud
      const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud
  
      //si no se manda ningun token en el encabezado se le envio un mensaje al usuario de que no se envio el token de acceso
      if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
      }
  
       //se envia el token a la funcion validarToken
      const data = await validarToken(token)
  
       //si el token es correcto obtendremos un code = 200 y podemos realizar la consulta a la base de datos si no enviaremos un mensaje al usuario diciendo token invalido 
      if (data.code == 200) {

        const id = req.params.id;

        const [rows] = await pool.query('SELECT * FROM conexionnodo where idconexionNodo=? ',id);
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




//funcion que crea nuevos nodos en la base de datos 
const postNodo = async (req, res) => {
    try {
  
      const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud
  
      const nodo = req.body.nodo;

      if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
      }
  
      const data = await validarToken(token)
  
      if (data.code == 200) {
        const [rows] = await pool.query('insert into conexionnodo (nombre) VALUES (?)' , nodo  );
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

const putNodo = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    const idNodo = req.body.idNodo;
    const nodo = req.body.nodo;

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token)

    if (data.code == 200) {
      const [rows] = await pool.query(`update conexionnodo set nombre = ? where idconexionNodo=?`,[nodo,idNodo]);
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
    getNodo,
    postNodo,
    getOneNodo,
    putNodo
  };