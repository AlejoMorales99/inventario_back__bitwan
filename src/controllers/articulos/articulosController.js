const pool = require('../../database/db.js'); // Se importa el módulo 'pool' desde el archivo '../../database/db.js'
const validarToken = require("../../validarTokenServicios/validarToken.js"); // Se importa el módulo 'validarToken' desde el archivo "../../validarTokenServicios/validarToken.js"

// Función para obtener todos los artículos
const getArticulos = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Se obtiene el token del encabezado de la solicitud

    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' }); // Si no se proporciona el token, se envía una respuesta de error con el mensaje 'Token no proporcionado'
    }

    const data = await validarToken(token); // Se valida el token llamando a la función 'validarToken' con el token como argumento

    if (data.code == 200) { // Si el código de respuesta de 'validarToken' es 200 (éxito):

      // Ejecutar la consulta SQL para seleccionar todos los artículos
      const [rows] = await pool.query('SELECT nombre ,idreferencia FROM referencia'); // Se ejecuta la consulta SQL para seleccionar todos los artículos y se guarda el resultado en la variable 'rows'

      // Devolver los artículos como respuesta
      res.status(200).json(rows); // Se envía una respuesta exitosa con el resultado de la consulta (artículos) en formato JSON

    } else { // Si el código de respuesta de 'validarToken' no es 200:

      console.log("Autorizacion invalida"); // Se imprime en la consola el mensaje 'Autorizacion invalida'
      return res.status(401).json({ message: 'Token inválido' }); // Se envía una respuesta de error con el mensaje 'Token inválido'

    }

  } catch (error) {
    // Manejar cualquier error ocurrido durante la ejecución
    console.error(error); // Se imprime en la consola el error ocurrido durante la ejecución
    res.status(500).json({ message: 'Error no se pudo establecer la conexión' }); // Se envía una respuesta de error con el mensaje 'Error no se pudo establecer la conexión'
  }
};

module.exports = {
  getArticulos,
};
