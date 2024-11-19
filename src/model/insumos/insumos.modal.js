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

async function getInsumoPorTecnico(servicioTecnico) {
    try {

        const [result] = await pool.query(`select nombreInsumo,totalInsumosExistentes as total from insumos where servicio_idservicio = ?`, servicioTecnico);

        return result;
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

async function getAllActasDeMovimientoTecnicos(numTerceroTecnico,usuarioSesion) {

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
        INNER JOIN tercero terSale ON serSale.tercero_idtercero = terSale.idtercero where terEntra.numeroTercero = ? or a.usuarioRegistra=?  order by a.idactasMovimientoInsumos desc;`, [numTerceroTecnico,usuarioSesion]);

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
        console.error("Error al listar los insumos", error);
    }
}

async function getListInsumosTecnicos(numTerceroTecnico) {
    try {

        const [servicioTecnico] = await pool.query(`SELECT idServicio FROM servicio INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero 
        WHERE tercero.numeroTercero = ?`, numTerceroTecnico);

        const [result] = await pool.query(`Select idinsumo,nombreInsumo from insumos where servicio_idservicio = ?`,servicioTecnico[0].idServicio);

        return result;
    } catch (error) {
        console.error("Error al listar los insumos de los tecnicos", error);
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
    tipoActaDeInsumos,
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
            "CALL postActasDeMovimientoInsumos(?,?,?,?,?,?,?)",
            [
                idsInsumosJSON,
                tipoActaDeInsumos,
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


async function putAceptarActaDeMovimiento(idActaInsumos, servicioSale, servicioEntra, usuarioTercero, usuarioNombre) {
    try {

        const fechaActual = new Date();
        const anio = fechaActual.getFullYear();
        const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
        const dia = String(fechaActual.getDate()).padStart(2, "0");
        const hora = String(fechaActual.getHours()).padStart(2, "0");
        const minutos = String(fechaActual.getMinutes()).padStart(2, "0");
        const segundos = String(fechaActual.getSeconds()).padStart(2, "0");

        const fechaFormateada = `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

        let nuevoInsumoId = null;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [servicioSaleRows] = await pool.query(`SELECT idServicio FROM servicio INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero WHERE tercero.tercerocol = ?`, servicioSale);
            const [servicioEntraRows] = await pool.query(`SELECT idServicio FROM servicio INNER JOIN tercero ON tercero.idtercero = servicio.tercero_idtercero WHERE tercero.tercerocol = ?`, servicioEntra);

            const [movimientosInsumos] = await pool.query(`
            SELECT insumos_idinsumo, cantidadMovimientoInsumo
            FROM movimientosinsunos
            WHERE actasMovimientoInsumos_idactasMovimientoInsumos = ?`, [idActaInsumos]);



            for (let movimiento of movimientosInsumos) {
                const insumoId = movimiento.insumos_idinsumo;
                const cantidad = movimiento.cantidadMovimientoInsumo;

                const [nombreInsumoServicio] = await connection.query('select nombreInsumo from insumos where idinsumo = ? ', insumoId);

                const [insumoServicioRecibe] = await connection.query(`select idinsumo from insumos where nombreInsumo = ? and servicio_idservicio = ? `,
                    [nombreInsumoServicio[0].nombreInsumo, servicioEntraRows[0].idServicio]);

                if (insumoServicioRecibe == "") {
                    const crearNuevoInsumosTecnico = await connection.query(
                        `INSERT INTO insumos (nombreInsumo, totalEntradaInsumos, totalSalidaInsumos, totalInsumosExistentes, stockMinimo, stockOptimo, estadoStock, servicio_idservicio)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [nombreInsumoServicio[0].nombreInsumo, cantidad, 0, cantidad, 0, 0, 'optimo', servicioEntraRows[0].idServicio]
                    );

                    nuevoInsumoId = crearNuevoInsumosTecnico.insertId;

                }

                await connection.query(`update insumos set totalSalidaInsumos = totalSalidaInsumos + ? , totalInsumosExistentes = totalInsumosExistentes - ? ,
                estadoStock = IF(totalInsumosExistentes - ? < stockMinimo, 'bajo', 'optimo')
                where servicio_idservicio = ? and idinsumo = ?`, [cantidad, cantidad, cantidad, servicioSaleRows[0].idServicio, insumoId]);

                if (insumoServicioRecibe == "") {
                    await connection.query(`UPDATE insumos SET totalEntradaInsumos = totalEntradaInsumos + ?, totalInsumosExistentes = totalInsumosExistentes + ?,
                    estadoStock = IF(totalInsumosExistentes + ? < stockMinimo, 'bajo', 'optimo')
                    WHERE servicio_idservicio = ? AND idinsumo = ?`, [cantidad, cantidad, cantidad, servicioEntraRows[0].idServicio, nuevoInsumoId]);
                } else {
                    await connection.query(`UPDATE insumos SET totalEntradaInsumos = totalEntradaInsumos + ?, totalInsumosExistentes = totalInsumosExistentes + ?,
                    estadoStock = IF(totalInsumosExistentes + ? < stockMinimo, 'bajo', 'optimo')
                    WHERE servicio_idservicio = ? AND idinsumo = ?`, [cantidad, cantidad, cantidad, servicioEntraRows[0].idServicio, insumoServicioRecibe[0].idinsumo]);
                }

                await connection.query(`update actasmovimientoinsumos SET usuarioValida=? , estadoActaMov_idestadoActaMov=?, fechaValidacion=? 
                where idactasMovimientoInsumos = ? `, [usuarioNombre, 2, fechaFormateada, idActaInsumos]);

            }
            await connection.commit();

            return 200;


        } catch (error) {
            await connection.rollback();
            console.error('Error al ejecutar las consultas:', error);
            return 500;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Error al aceptar el acta de movimiento de insumos", error);
    }
}



async function putRechazarActaDeMovimiento(razonAnulacionActaInsumos, usuarioNombre,idActaInsumos) {
    try {

        const fechaActual = new Date();
        const anio = fechaActual.getFullYear();
        const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
        const dia = String(fechaActual.getDate()).padStart(2, "0");
        const hora = String(fechaActual.getHours()).padStart(2, "0");
        const minutos = String(fechaActual.getMinutes()).padStart(2, "0");
        const segundos = String(fechaActual.getSeconds()).padStart(2, "0");

        const fechaFormateada = `${anio}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

        const connection = await pool.getConnection();

        try {

            await connection.query(`update actasmovimientoinsumos SET usuarioValida=? , estadoActaMov_idestadoActaMov=?, fechaValidacion=? , obsActaRecha=?
            where idactasMovimientoInsumos = ? `, [usuarioNombre, 3, fechaFormateada, razonAnulacionActaInsumos , idActaInsumos]);

            await connection.commit();

            return 200;

        } catch (error) {
            await connection.rollback();
            console.error('Error al ejecutar las consultas:', error);
            return 500;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Error al rechazar el acta de movimiento de insumos", error);
    }
}



module.exports = {
    getAllInsumos,
    getAllHistorialInsumos,
    getInsumosFechaInicioFechFin,
    getOneNombreInsumo,
    getInsumoPorTecnico,
    postInsumosExistentes,
    postInsumoNuevo,

    getAllActasDeMovimiento,
    getAllActasDeMovimientoTecnicos,
    getListInsumos,
    getListInsumosTecnicos,
    validarInsumosExistentesActa,
    getInsumosPorIdActa,
    postActasDeMovimientosInsumos,
    putAceptarActaDeMovimiento,
    putRechazarActaDeMovimiento
};
