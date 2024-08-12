const insumosModel = require("../../model/insumos/insumos.modal");
const validarToken = require("../../validarTokenServicios/validarToken.js");

async function getAllInsumos(req, res) {

  try {

    const token = req.headers.authorization.split(" ")[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token);

    if (data.code == 200) {

      const numeroTerceroUsuario = req.params.numeroTercero;


      const getAllInsumos = await insumosModel.getAllInsumos(numeroTerceroUsuario);

      res.status(200).json(getAllInsumos);

    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.log("Error en listar los insumos " + error);
    return res.status(401).json({ mensaje: "Error al listar los insumos" })
  }
}

async function getAllHistorialInsumos(req, res) {

  try {

    const token = req.headers.authorization.split(" ")[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token);

    if (data.code == 200) {

      const getAllHistorialInsumos = await insumosModel.getAllHistorialInsumos();

      res.status(200).json(getAllHistorialInsumos);

    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.log("Error en listar el historial de las compras " + error);
    return res.status(401).json({ mensaje: "Error al listar el historial de las compras" })
  }
}

async function getInsumosFechaInicioFechFin(req, res) {

  try {

    const token = req.headers.authorization.split(" ")[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token);

    if (data.code == 200) {

      const fechaInicio = req.params.fechaInicio;
      const fechaFin = req.params.fechaFin;
      const insumoTextHistorial = req.params.insumoTextHistorial

      const getRegistrosPorFechaInicioFechaFin = await insumosModel.getInsumosFechaInicioFechFin(fechaInicio, fechaFin, insumoTextHistorial);

      res.status(200).json(getRegistrosPorFechaInicioFechaFin);

    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.log("Error al obtener el registro por fecha inicio fecha fin " + error);
    return res.status(401).json({ mensaje: "Error al  obtener el registro por fecha inicio fecha fin" })
  }
}

async function getOneNombreInsumo(req, res) {

  try {

    const token = req.headers.authorization.split(" ")[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token);

    if (data.code == 200) {

      const insumoText = req.params.insumoText;

      const getOneNombreInsumo = await insumosModel.getOneNombreInsumo(insumoText);

      res.status(200).json(getOneNombreInsumo);

    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.log("Error en listar el insumos a buscar " + error);
    return res.status(401).json({ mensaje: "Error al listar el insumos a buscar" })
  }
}

async function postInsumosExistentes(req, res) {

  try {

    const token = req.headers.authorization.split(" ")[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token);

    if (data.code == 200) {

      const nuevoInsumos = req.body.nuevoInsumos;
      const cantidadNuevoInsumos = req.body.cantidadNuevoInsumos;
      const precioInsumo = req.body.precioInsumo;
      const proveedor = req.body.proveedor;
      const marcaText = req.body.marcaText;
      const usuario = req.body.usuario;

      const cantidadSinPuntos = parseInt(cantidadNuevoInsumos.replace(/\./g, ''), 10);
      const precioSinPuntos = parseInt(precioInsumo.replace(/\./g, ''), 10);

      const postInsumosExistentes = await insumosModel.postInsumosExistentes(nuevoInsumos, cantidadSinPuntos, proveedor, marcaText, usuario, precioSinPuntos);

      if (postInsumosExistentes == 1) {

        res.status(200).json({ mensaje: "Insumo aumentado con exito", estado: 200 });

      } else {
        res.status(422).json({ mensaje: "Error al aumentar el insumo", estado: 500 });
      }


    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.log("Error en aumentar los insumos " + error);
    return res.status(401).json({ mensaje: "Error al aumentar los insumos" })
  }
}

async function postInsumoNuevo(req, res) {

  try {

    const token = req.headers.authorization.split(" ")[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token);

    if (data.code == 200) {

      const nuevoInsumos = req.body.nuevoInsumos;
      const cantidadNuevoInsumos = req.body.cantidadNuevoInsumos;
      const stockMinimo = req.body.stockMinimo;
      const proveedor = req.body.proveedor;
      const marcaText = req.body.marcaText;
      const usuario = req.body.usuario;

      const cantidadSinPuntos = parseInt(cantidadNuevoInsumos.replace(/\./g, ''), 10);


      const postInsumoNuevo = await insumosModel.postInsumoNuevo(nuevoInsumos, cantidadSinPuntos, stockMinimo, proveedor, marcaText, usuario);

      if (postInsumoNuevo == 1) {

        res.status(200).json({ mensaje: "Insumo registrado con exito", estado: 200 });

      } else if (postInsumoNuevo == 2) {
        res.status(200).json({ mensaje: "Este insumo ya existe", estado: 409 });
      } else {
        res.status(200).json({ mensaje: "error al registrar el insumo", estado: 500 });
      }


    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.log("Error en registrar los insumos " + error);
    return res.status(401).json({ mensaje: "Error al registrar los insumos" })
  }
}


//----------------------------Controladores de la funcionalidad de las actas de movimiento de insumos---------------------------------//


async function getAllActasDeMovimiento(req, res) {

  try {

    const token = req.headers.authorization.split(" ")[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token);

    if (data.code == 200) {

      const getAllActasDeMovimiento = await insumosModel.getAllActasDeMovimiento();

      res.status(200).json(getAllActasDeMovimiento);

    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.log("Error en listar las actas de movimiento " + error);
    return res.status(401).json({ mensaje: "Error al listar las actas de movimiento" })
  }
}


async function getListInsumos(req, res) {

  try {

    const token = req.headers.authorization.split(" ")[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token);

    if (data.code == 200) {

      const getListInsumos = await insumosModel.getListInsumos();

      res.status(200).json(getListInsumos);

    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.log("Error en listar los insumos disponibles " + error);
    return res.status(401).json({ mensaje: "Error al listar los insumos disponibles" })
  }
}



async function postActasDeMovimientosInsumos(req, res) {

  try {

    const token = req.headers.authorization.split(" ")[1]; // Obtengo el token del encabezado de la solicitud

    if (!token) {
      // Si no se proporciona un token, se devuelve un código de estado 401 con un mensaje indicando que el token no fue proporcionado.
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const data = await validarToken(token);

    if (data.code == 200) {

      const registrosActa = req.body.registrosActa;
      const tecnicoEnvio = req.body.tecnicoEnvio;
      const numeroTerceroUsuario = req.body.usuarioTercero;
      const usuarioNombre = req.body.usuarioNombre;
      
      const idsInsumos = [];
      const cantidadesInsumos = [];
 
      registrosActa.forEach(insumo => {
        idsInsumos.push(insumo.idinsumo);
        cantidadesInsumos.push(Number(insumo.cantidad.replace(/\./g, ''))); // Convertir la cantidad a número
      });

      await insumosModel.postActasDeMovimientosInsumos(idsInsumos,cantidadesInsumos,tecnicoEnvio,numeroTerceroUsuario,usuarioNombre); 



      res.status(200).json({mensaje: "Insumo registrado con exito",estado:200});




    } else {
      console.log("Autorizacion invalida");
      return res.status(401).json({ message: 'Token inválido' });
    }

  } catch (error) {
    console.log("Error en registrar la acta de movimiento " + error);
    return res.status(401).json({ mensaje: "Error al registrar la acta de movimiento" })
  }
}



module.exports = {
  getAllInsumos,
  getAllHistorialInsumos,
  getInsumosFechaInicioFechFin,
  getOneNombreInsumo,
  postInsumosExistentes,
  postInsumoNuevo,


  getAllActasDeMovimiento,
  getListInsumos,
  postActasDeMovimientosInsumos
};
