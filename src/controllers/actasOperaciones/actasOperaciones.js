const actasOperacionesModal = require("../../model/actasOperaciones/actasOperacionesModel.js");
const validarToken = require("../../validarTokenServicios/validarToken.js");


const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: './guiasinventariobitwan-014a643817e6.json', // Reemplaza con la ruta a tu archivo JSON de credenciales
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

require('dotenv').config({ path: '../../../.env' });



//funcion que obtiene todas las actas de operaciones
async function getAllActasOperaciones(req, res){
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);
    
    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta la siguiente consulta SQL y se obtiene el resultado.

      const page = parseInt(req.params.page) || 1; // Página actual
      const itemsPerPage = parseInt(req.params.itemsPerPage) || 10;
      const offset = (page - 1) * itemsPerPage;

      const actasOperaciones = await actasOperacionesModal.getAllActasOperaciones(offset,itemsPerPage);
      

      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(actasOperaciones);

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


//funcion que obtiene actas de operacion dependiendo del filtro
async function getBuscarActasDeOperaciones(req, res){
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);
    
    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta la siguiente consulta SQL y se obtiene el resultado.

      const page = parseInt(req.params.page) || 1; // Página actual
      const itemsPerPage = parseInt(req.params.itemsPerPage) || 10;
      const offset = (page - 1) * itemsPerPage;
      const registroBuscar = req.params.registroBuscar;
      const columnaBuscar = req.params.columnaBuscar;

    

      const actasOperaciones = await actasOperacionesModal.getBuscarActasDeOperaciones(offset,itemsPerPage,registroBuscar,columnaBuscar);
      

      // Se devuelve un código de estado 200 con los datos obtenidos de la consulta SQL.
      res.status(200).json(actasOperaciones);

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

//funcion que obtiene todas las actas de operaciones de un tecnico especifico
async function getAllActasOperacionesTecnicos(req, res){
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);
    
    if (data.code == 200) {

      const nombreTecnico = req.params.nombreTecnico;
      
      const actasOperaciones = await actasOperacionesModal.getAllActasOperacionesTecnicos(nombreTecnico);
      
      res.status(200).json(actasOperaciones);

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

//Funcion que crea las actas de operaciones
async function postCrearActaOperaciones(req, res)  {
    try {
  
      const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud
  
      if (!token) {
        // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
      }
  
      // Se llama a la función validarToken para verificar y obtener datos a partir del token.
      const data = await validarToken(token);
  
  
      if (data.code == 200) {
        // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.
  
  
        const RazonMovimiento = req.body.RazonMovimiento;
        const numServicioActa = req.body.NumServicioOperaciones;
        const usuarioCreoActa = req.body.tecnico;
        const descripcion = req.body.Descripcion;
        const idAgenda = req.body.idAgenda;

        const fechaActual = new Date();
        const anio = fechaActual.getFullYear();
        const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
        const dia = String(fechaActual.getDate()).padStart(2, "0");
        const hora = String(fechaActual.getHours()).padStart(2, "0");
        const minutos = String(fechaActual.getMinutes()).padStart(2, "0");
        const segundos = String(fechaActual.getSeconds()).padStart(2, "0");
  
        const fechaFormateada = `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
  

        async function uploadToDrive(filePath, fileName) {
          const fileMetadata = {
            name: fileName, 
            parents: ['1x_5IJyOW5IzK3kenaw4_6NpWt8F_sSfd'],
          };
          const media = {
            mimeType: 'image/jpeg', // Reemplaza según el tipo de archivo
            body: fs.createReadStream(filePath),
          };
        
          const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
          });
        
          return response.data.id; // Devuelve el ID del archivo en Google Drive
        }
  
  
        let ImgGuia = null;
  
      if (req.file) {
        const filePath = req.file.path;
        const fileName = req.file.originalname;
  
        // Sube el archivo a Google Drive y obtén el ID
        const fileId = await uploadToDrive(filePath, fileName);
        ImgGuia = fileId;
  
        // Borra el archivo temporal después de subirlo a Google Drive
        fs.unlinkSync(filePath);
      }
        
        try {
  
          const condicion = await actasOperacionesModal.postCrearActaOperaciones(RazonMovimiento,numServicioActa,usuarioCreoActa,ImgGuia,descripcion,fechaFormateada,idAgenda);


          if(condicion){
            res.status(200).json({mensaje:"acta Creada con exito"});
          }else{
            res.status(500).json({mensaje:"error al crear el acta"});
          }

        } catch (error) {
          console.error('Error al crear la acta de operaciones:', error);
          res.status(500).json({ error: 'Error al crear el acta de operaciones' });
        }
  
  
  
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

//funcion que actualiza el estado de las actas de operaciones a aceptadas
async function putActualizarActaOperacionesAceptar(req, res)  {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const idActaOperacion = req.body.idActaOperacion;
      const tecnico_o_administractivo = req.body.tecnico_o_administractivo;
     
     

      const fechaActual = new Date();
      const anio = fechaActual.getFullYear();
      const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaActual.getDate()).padStart(2, "0");
      const hora = String(fechaActual.getHours()).padStart(2, "0");
      const minutos = String(fechaActual.getMinutes()).padStart(2, "0");
      const segundos = String(fechaActual.getSeconds()).padStart(2, "0");

      const fechaFormateada = `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

      
      try {

        const condicion = await actasOperacionesModal.putActualizarActaOperacionesAceptar(tecnico_o_administractivo,idActaOperacion,fechaFormateada);


        if(condicion){
          res.status(200).json({mensaje:"acta actualizada con exito"});
        }else{
          res.status(500).json({mensaje:"error al actualizar la acta"});
        }

      } catch (error) {
        console.error('Error al actualizar el estado del acta de operaciones:', error);
        res.status(500).json({ error: 'Error al actualizar el estado del actaDeOperaciones' });
      }


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

//funcion que actualiza el estado de las actas de operaciones a rechazadas
async function putActualizarActaOperacionesRechazar(req, res)  {
  try {

    const token = req.headers.authorization.split(' ')[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    // Se llama a la función validarToken para verificar y obtener datos a partir del token.
    const data = await validarToken(token);


    if (data.code == 200) {
      // Si el código de respuesta de la función validarToken es 200, se ejecuta el siguiente bloque de código.

      const idActaOperacion = req.body.idActaOperacion;
      const tecnico_o_administractivo = req.body.tecnico_o_administractivo;
      const razonAnulacion = req.body.razonAnulacion;
     
      const fechaActual = new Date();
      const anio = fechaActual.getFullYear();
      const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaActual.getDate()).padStart(2, "0");
      const hora = String(fechaActual.getHours()).padStart(2, "0");
      const minutos = String(fechaActual.getMinutes()).padStart(2, "0");
      const segundos = String(fechaActual.getSeconds()).padStart(2, "0");

      const fechaFormateada = `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

      
      try {

        const condicion = await actasOperacionesModal.putActualizarActaOperacionesRechazar(tecnico_o_administractivo,idActaOperacion,fechaFormateada,razonAnulacion,razonAnulacion);


        if(condicion){
          res.status(200).json({mensaje:"acta actualizada con exito"});
        }else{
          res.status(500).json({mensaje:"error al actualizar la acta"});
        }

      } catch (error) {
        console.error('Error al actualizar el estado del acta de operaciones:', error);
        res.status(500).json({ error: 'Error al actualizar el estado del actaDeOperaciones' });
      }


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
    getAllActasOperaciones,
    getBuscarActasDeOperaciones,
    getAllActasOperacionesTecnicos,
    postCrearActaOperaciones,
    putActualizarActaOperacionesAceptar,
    putActualizarActaOperacionesRechazar
};
  