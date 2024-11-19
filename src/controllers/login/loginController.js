const pool = require('../../database/db.js');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

// Función para obtener un usuario
const getUsuario = async (req, res) => {
  try {
    // Obtener el nombre de usuario y la contraseña del cuerpo de la solicitud
    const username = req.body.username;
    const pass = req.body.password;

    // Consulta SQL para seleccionar los datos del usuario y el rol correspondiente
     const [rows] = await pool.query(`
    SELECT usuarios.ID, usuarios.usuario, usuarios.pass, usuarios.nombre, usuarios.apellido, roles.ID as rol from 
    usuarios inner join roles on usuarios.ID = roles.ID  where usuarios.usuario = ? and usuarios.pass = ? `, [username, pass]); 

    if(rows == ""){
      res.json({error:false});
    }else{
      
      if(rows[0].usuario == username && rows[0].pass == pass){
        const token = jwt.sign({rows} , process.env.SECRETKEY , { expiresIn: '1h' } )
  
        res.status(200).json({token, usuario:rows});
  
      }else{
        res.status(401).json({ message: 'Credenciales inválidas' });
      } 


    }
    
  } catch (error) {
    // Manejar cualquier error ocurrido durante la ejecución
    console.error(error);
    res.status(500).json({ message: 'Error no se pudo establecer la conexión' });
  }
};


const loginUsuario = async (req,res) =>{

  try {
    // Obtener el nombre de usuario y la contraseña del cuerpo de la solicitud
    const nombreUsuario = req.params.nombreUsuario;
    const numTercero = req.params.numTercero;
    
    // Consulta SQL para seleccionar los datos del usuario y el rol correspondiente
     const [rows] = await pool.query(`select tercerocol,numeroTercero, rol  from tercero where tercerocol = ? && numeroTercero = ?`,[nombreUsuario,numTercero]); 


    if(rows == ""){
      res.json({error:false});
    }else{
      
      res.status(200).json(rows);
  
    }

  } catch (error) {
   
    res.status(500).json({ message: 'Error no se pudo establecer la conexión' });
  }

}

const newUsuario = async (req,res) =>{

  const connection = await pool.getConnection();

  try {
    // Obtener el nombre de usuario y la contraseña del cuerpo de la solicitud
    const newUsuario = req.params.newUsuario;
    const numtercero = req.params.numtercero;
    const password = req.params.password
   
    await connection.beginTransaction();

  
    // Consulta SQL para seleccionar los datos del usuario y el rol correspondiente
    const [rows1] = await connection.query(`insert into tercero (tercerocol,numeroTercero,cedula,estado,rol) VALUES (?,?,?,?,?)`,[newUsuario,numtercero,password,0,'tecnico']);

    const idTerceroNew = rows1.insertId

     // Consulta para obtener el registro insertado
     const [rowsRegistroInsertado] = await connection.query(
      `SELECT * FROM tercero WHERE idtercero = ?`,
      [idTerceroNew]
  );

    const [rows2] = await connection.query(`insert into servicio (tercero_idtercero,tipoServicio_idtipoServicio) VALUES (?,?)`, [idTerceroNew,4] );

    const [idMaximo] = await connection.query(`SELECT MAX(idusuarios) as id FROM usuarios`)
    

    const [rows3] = await connection.query(`insert into usuarios (idusuarios,tercero_idtercero) VALUES (?,?)`, [idMaximo[0].id+1,idTerceroNew] );


    await connection.commit();
    res.status(200).json(rowsRegistroInsertado[0]);

  } catch (error) {
    await connection.rollback();
    console.error('Error al ejecutar las consultas:', error);
    res.status(500).json({ error: false });
  } finally {
    connection.release();
  }

}




module.exports = {
  getUsuario,
  loginUsuario,
  newUsuario
};