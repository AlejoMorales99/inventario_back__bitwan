//importo el archivo database el cual me permite realizar las consultas a la base de datos
const pool = require('../../database/db.js');

//importo el archivo validarToken el cual me confirma si el token que se envia el valido o no o si ya expiro
const validarToken = require("../../validarTokenServicios/validarToken.js");


//funcion para obtener las categorias
const getCategoria = async (req, res) => {
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
      const [rows] = await pool.query('SELECT * FROM categoriainv');
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

const getOneCategoria = async (req, res) => {
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
    
      const idCategoria = req.params.idCategoria
      

      const [rows] = await pool.query('SELECT * FROM categoriainv where idcategoriaInv = ?',idCategoria);
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



//funcion para crear nuevas categotias
const postCategorias = async (req, res) => {
  try {

     //guardo el token de autorizacion que viene en el encabezado de la solicitud
    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    //obtengo el valor que se me envia en el cuerpo de la solicitud
    const categoria = req.body.categoria;

    //si no se manda ningun token en el encabezado se le envio un mensaje al usuario de que no se envio el token de acceso
    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    //se envia el token a la funcion validarToken
    const data = await validarToken(token)

     //si el token es correcto obtendremos un code = 200 y podemos realizar la consulta a la base de datos si no enviaremos un mensaje al usuario diciendo token invalido 
    if (data.code == 200) {
      const [rows] = await pool.query('insert into categoriainv (nombre) VALUES (?)', [categoria] );
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

const putCategoria = async (req, res) => {
  try {

     //guardo el token de autorizacion que viene en el encabezado de la solicitud
    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    //obtengo el valor que se me envia en el cuerpo de la solicitud
    const idCategoria = req.body.idCategoria;
    const categoria = req.body.categoria;

    //si no se manda ningun token en el encabezado se le envio un mensaje al usuario de que no se envio el token de acceso
    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    //se envia el token a la funcion validarToken
    const data = await validarToken(token)

     //si el token es correcto obtendremos un code = 200 y podemos realizar la consulta a la base de datos si no enviaremos un mensaje al usuario diciendo token invalido 
    if (data.code == 200) {
      const [rows] = await pool.query('update categoriainv set nombre = ? where idcategoriaInv = ? ', [categoria,idCategoria] );
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


//exporto estas 2 funciones para que puedan ser usadas en mi archivo de rutas
module.exports = {
    getCategoria,
    postCategorias,
    getOneCategoria,
    putCategoria
  };