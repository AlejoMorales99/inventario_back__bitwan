const pool = require("../../database/db");

async function getAllInsumos(numeroTerceroUsuario) {
    try {
        const [result] = await pool.query(
            "call obtenerInsumosPorTercero(?)",
            numeroTerceroUsuario
        );
        return result[0];
    } catch (error) {
        console.error("Error al listar los insumos", error);
    }
}

async function getAllHistorialInsumos() {
    try {
        const [result] = await pool.query("call obtenerHistorialComprasInsumosAll");
        return result[0];
    } catch (error) {
        console.error(
            "error al obtener el historial de las compras de los insumos",
            error
        );
    }
}

async function getInsumosFechaInicioFechFin(
    fechaInicio,
    fechaFin,
    insumoTextHistorial
) {
    try {
        if (insumoTextHistorial == "vacio") {
            const [result] = await pool.query(
                "call get_Insumos_FhInicio_FhFin(?,?)",
                [fechaInicio, fechaFin]
            );
            return result[0];
        } else {
            const [result] = await pool.query(
                "call get_Insumos_fhInicio_fhFin_insumo(?,?,?)",
                [fechaInicio, fechaFin, insumoTextHistorial]
            );
            return result[0];
        }
    } catch (error) {
        console.error(
            "Error al obtener los registros por fecha inicio fecha fin",
            error
        );
    }
}

async function getOneNombreInsumo(insumoText) {
    try {
        const [result] = await pool.query("call getOneNombreInsumo(?)", insumoText);

        const registrosYSumaTotal = {
            historialInsumosAll: result[0],
            total: result[1],
        };

        return registrosYSumaTotal;
    } catch (error) {
        console.error("Error al obtener el insumos a buscar", error);
    }
}

async function postInsumosExistentes(
    nuevoInsumos,
    cantidadNuevoInsumos,
    proveedor,
    marcaText,
    usuario,
    precio
) {
    try {
        const [results] = await pool.query(
            `CALL actualizarInsumosExistente(?, ?, ?, ?, ?, ?, @exitoProcedure);SELECT @exitoProcedure AS exitoProcedure;`,
            [
                nuevoInsumos,
                cantidadNuevoInsumos,
                proveedor,
                marcaText,
                usuario,
                precio,
            ]
        );
        const exito = results[1][0].exitoProcedure;

        if (exito == 1) {
            return exito;
        } else {
            return 0;
        }
    } catch (error) {
        console.error("Error al aumentar el insumo", error);
    }
}

async function postInsumoNuevo(
    nuevoInsumos,
    cantidadNuevoInsumos,
    precioInsumo,
    stockMinimo,
    proveedor,
    marcaText,
    usuario
) {
    try {
        const [existenciaInsumo] = await pool.query(
            "CALL validarExistenciaInsumo(?)",
            nuevoInsumos
        );

        console.log(existenciaInsumo[0]);

        if (existenciaInsumo[0] == "") {
            const [results] = await pool.query(
                `CALL insertarNuevoInsumo(?, ?, ?, ?, ?, ?, ?, @exitoProcedure);SELECT @exitoProcedure AS exitoProcedure;`,
                [
                    nuevoInsumos,
                    cantidadNuevoInsumos,
                    precioInsumo,
                    stockMinimo,
                    proveedor,
                    marcaText,
                    usuario,
                ]
            );

            console.log(results);

            const exito = results[1][0].exitoProcedure;

            if (exito == 1) {
                return exito;
            } else {
                return 0;
            }
        } else {
            return 2;
        }
    } catch (error) {
        console.error("Error al insertar el insumo", error);
    }
}

//-------------------------------Modelos de la funcionalidad de las actas de movimiento de insumos------------------------------------//

async function getAllActasDeMovimiento() {
    try {
        const [result] = await pool.query("call getAllActasDeMovimiento");
        return result[0];
    } catch (error) {
        console.error("Error al listar las actas de movimiento", error);
    }
}

async function getAllActasDeMovimientoTecnicos(numTerceroTecnico) {
    
    try {
        const [result] = await pool.query(`SELECT 
        a.idactasMovimientoInsumos as idActa,
        razonmovimiento.razonMovimientocol as razonM ,
        estadoactamov.nombre as estadoActa,
        a.tipoEnvio,
        a.fechaRegistro as fhR,
        a.fechaValidacion as fhV ,
        terEntra.tercerocol AS serEntra, 
        terSale.tercerocol AS serSale,
        a.usuarioRegistra,
        a.usuarioValida,
        a.descripcion as des,
        a.obsActaRecha
        FROM actasmovimientoinsumos as a
        INNER JOIN razonmovimiento  ON razonmovimiento.idrazonMovimiento = razonMovimiento_idrazonMovimiento
        INNER JOIN estadoactamov  ON estadoactamov.idestadoActaMov = estadoActaMov_idestadoActaMov
        INNER JOIN servicio serEntra ON a.servicioEntra = serEntra.idservicio
        INNER JOIN tercero terEntra ON serEntra.tercero_idtercero = terEntra.idtercero
        INNER JOIN servicio serSale ON a.servicioSale = serSale.idservicio
        INNER JOIN tercero terSale ON serSale.tercero_idtercero = terSale.idtercero where terEntra.numeroTercero = ?  order by a.idactasMovimientoInsumos desc;`,numTerceroTecnico);

        return result;

    } catch (error) {
        console.error(
            "Error al listar las actas de movimiento de los tecnicos",
            error
        );
    }
}

async function getListInsumos() {
    try {
        const [result] = await pool.query("call getListInsumos");
        return result[0];
    } catch (error) {
        console.error("Error al listar las actas de movimiento", error);
    }
}

async function validarInsumosExistentesActa(idsInsumos, cantidadesInsumos, numeroTerceroUsuario) {
    try {
        // Asegurarte de que los arrays tengan el mismo tamaño
        if (idsInsumos.length !== cantidadesInsumos.length) {
            throw new Error("Los arrays de ids y cantidades deben tener el mismo tamaño.");
        }

        let resultados = [];

        // Recorremos los insumos y cantidades
        for (let i = 0; i < idsInsumos.length; i++) {
            const idInsumo = idsInsumos[i];
            const cantidadInsumo = cantidadesInsumos[i];

            const [result] = await pool.query(`
                SELECT nombreInsumo, IF(totalInsumosExistentes >= ?, true, false) AS resultado
                FROM insumos
                WHERE idinsumo = ?
                AND servicio_idservicio = (
                    SELECT idservicio 
                    FROM servicio 
                    INNER JOIN tercero ON servicio.tercero_idtercero = tercero.idtercero 
                    WHERE tercero.numeroTercero = ?
                );
            `, [cantidadInsumo, idInsumo, numeroTerceroUsuario]);

            resultados.push(result);
        }

        return resultados;

    } catch (error) {
        console.error("Error al listar las actas de movimiento", error);
        throw error;
    }
}


async function getInsumosPorIdActa(idActaInsumo) {
    try {
        const [result] = await pool.query(
            `
            select insumos.nombreInsumo, movimientosinsunos.cantidadMovimientoInsumo, actasmovimientoinsumos.idactasMovimientoInsumos from insumos 
            inner join movimientosinsunos on movimientosinsunos.insumos_idinsumo = insumos.idinsumo
            inner join actasmovimientoinsumos on movimientosinsunos.actasMovimientoInsumos_idactasMovimientoInsumos = actasmovimientoinsumos.idactasMovimientoInsumos 
            where actasmovimientoinsumos.idactasMovimientoInsumos = ? `,
            idActaInsumo
        );
        return result;
    } catch (error) {
        console.error("Error al listar los insumos del id de un acta", error);
    }
}

async function postActasDeMovimientosInsumos(
    idsInsumos,
    cantidadesInsumos,
    Descripcion,
    tecnicoEnvio,
    numeroTerceroUsuario,
    usuarioNombre
) {
    try {
        const idsInsumosJSON = JSON.stringify(idsInsumos);
        const cantidadesInsumosJSON = JSON.stringify(cantidadesInsumos);

        const [existenciaInsumo] = await pool.query(
            "CALL postActasDeMovimientoInsumos(?,?,?,?,?,?)",
            [
                idsInsumosJSON,
                cantidadesInsumosJSON,
                Descripcion,
                tecnicoEnvio,
                numeroTerceroUsuario,
                usuarioNombre,
            ]
        );

        return 1;
    } catch (error) {
        console.error("Error al insertar el insumo", error);
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
    getAllActasDeMovimientoTecnicos,
    getListInsumos,
    validarInsumosExistentesActa,
    getInsumosPorIdActa,
    postActasDeMovimientosInsumos,
};
