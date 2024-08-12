const pool = require("../../database/db");




async function getAllInsumos(numeroTerceroUsuario) {

    try {
        const [result] = await pool.query('call obtenerInsumosPorTercero(?)', numeroTerceroUsuario);
        return result[0];

    } catch (error) {
        console.error('Error al listar los insumos', error);
    }
}

async function getAllHistorialInsumos() {

    try {
        const [result] = await pool.query('call obtenerHistorialComprasInsumosAll');
        return result[0];

    } catch (error) {
        console.error('error al obtener el historial de las compras de los insumos', error);
    }
}

async function getInsumosFechaInicioFechFin(fechaInicio,fechaFin,insumoTextHistorial) {

    try {

        if(insumoTextHistorial == "vacio"){

            const [result] = await pool.query('call get_Insumos_FhInicio_FhFin(?,?)',[fechaInicio,fechaFin]);
            return result[0];

        }else{

            const [result] = await pool.query('call get_Insumos_fhInicio_fhFin_insumo(?,?,?)',[fechaInicio,fechaFin,insumoTextHistorial]);
            return result[0];
 
        }
  
    } catch (error) {
        console.error('Error al obtener los registros por fecha inicio fecha fin', error);
    }  
}

async function getOneNombreInsumo(insumoText) {

    try {
        const [result] = await pool.query('call getOneNombreInsumo(?)', insumoText);

        const registrosYSumaTotal = {
            historialInsumosAll:result[0],
            total:result[1]
        }

        
        return registrosYSumaTotal;

    } catch (error) {
        console.error('Error al obtener el insumos a buscar', error);
    }
}


async function postInsumosExistentes(nuevoInsumos, cantidadNuevoInsumos, proveedor, marcaText, usuario,precio) {

    try {
        const [results] = await pool.query(`CALL actualizarInsumosExistente(?, ?, ?, ?, ?, ?, @exitoProcedure);SELECT @exitoProcedure AS exitoProcedure;`, [nuevoInsumos, cantidadNuevoInsumos, proveedor, marcaText, usuario,precio]);
        const exito = results[1][0].exitoProcedure;

        if (exito == 1) {
            return exito;
        } else {
            return 0;
        }

    } catch (error) {
        console.error('Error al aumentar el insumo', error);
    }

}

async function postInsumoNuevo(nuevoInsumos, cantidadNuevoInsumos, stockMinimo , proveedor, marcaText, usuario) {

    try {

        const [existenciaInsumo] = await pool.query('CALL validarExistenciaInsumo(?)',nuevoInsumos);

        

        if(existenciaInsumo[0] == "" ){
            
            const [results] = await pool.query(`CALL insertarNuevoInsumo(?, ?, ?, ?, ?, ?, @exitoProcedure);SELECT @exitoProcedure AS exitoProcedure;`, [nuevoInsumos, cantidadNuevoInsumos, stockMinimo , proveedor, marcaText, usuario]);
            const exito = results[1][0].exitoProcedure;
           
            if (exito == 1) {
                return exito;
            } else {
                return 0;
            }


        }else{
           return 2;
        }

    } catch (error) {
        console.error('Error al insertar el insumo', error);
    }

}

//-------------------------------Modelos de la funcionalidad de las actas de movimiento de insumos------------------------------------//


async function getAllActasDeMovimiento() {

    try {
        const [result] = await pool.query('call getAllActasDeMovimiento', );
        return result[0];

    } catch (error) {
        console.error('Error al listar las actas de movimiento', error);
    }
}

async function getListInsumos() {

    try {
        const [result] = await pool.query('call getListInsumos', );
        return result[0];

    } catch (error) {
        console.error('Error al listar las actas de movimiento', error);
    }
}


async function postActasDeMovimientosInsumos(idsInsumos, cantidadesInsumos, tecnicoEnvio , numeroTerceroUsuario,usuarioNombre) {
    
    try {
       
        const idsInsumosJSON = JSON.stringify(idsInsumos);
        const cantidadesInsumosJSON = JSON.stringify(cantidadesInsumos);

       

        const [existenciaInsumo] = await pool.query('CALL postActasDeMovimientoInsumos(?,?,?,?,?)',[idsInsumosJSON,cantidadesInsumosJSON,tecnicoEnvio,numeroTerceroUsuario,usuarioNombre]);

        return 1;

    } catch (error) {
        console.error('Error al insertar el insumo', error);
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
}