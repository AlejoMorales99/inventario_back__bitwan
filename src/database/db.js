const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../../.env' });

// Crear un pool de conexiones a la base de datos MySQL
const pool = mysql.createPool({
  connectionLimit: 30,                   // Establecer el límite máximo de conexiones simultáneas en el pool
  host: process.env.DB_HOST_PRODUCCION,             // Obtener la dirección del host de la base de datos desde las variables de entorno
  port: process.env.DB_PORT_PRODUCCION,             // Obtener el puerto de la base de datos desde las variables de entorno
  user: process.env.DB_USER_PRODUCCION,             // Obtener el usuario de la base de datos desde las variables de entorno
  password: process.env.DB_PASSWORD_PRODUCCION,     // Obtener la contraseña de la base de datos desde las variables de entorno
  database: process.env.DB_NAME_PRODUCCION,         // Obtener el nombre de la base de datos desde las variables de entorno
  multipleStatements: true, // Habilita múltiples sentencias SQL
  waitForConnections: true,
  flags: '-SESSION_TRACK=NO_AUTOCOMMIT' // Desactivar autocommit
});

// Función para verificar la conexión a la base de datos
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();  // Obtener una conexión del pool
    console.log('Conexión a la base de datos establecida correctamente.');
  } catch (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('La conexión a la base de datos fue cerrada.');   // Error: la conexión a la base de datos se cerró
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('La base de datos tiene demasiadas conexiones.'); // Error: la base de datos tiene demasiadas conexiones
    } else if (err.code === 'ECONNREFUSED') {
      console.error('La conexión a la base de datos fue rechazada.');  // Error: la conexión a la base de datos fue rechazada
    } else {
      console.error(err);// Imprimir otros errores
    }
  } finally {
    if (connection) {
      connection.release();// Liberar la conexión al pool
    }
  }
}

// Llamar a la función para verificar la conexión a la base de datos
testConnection();

// Exportar el pool de conexiones para que pueda ser utilizado en otros módulos
module.exports = pool;