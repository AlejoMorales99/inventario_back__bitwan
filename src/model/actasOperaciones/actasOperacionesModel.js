const pool = require("../../database/db");

async function getAllActasOperaciones(offset,itemsPerPage) {

    try {
        const [getActasOperacion] = await pool.query('call getAllActasDeOperacion(?,?)',[offset,itemsPerPage]);
        const totalActasOperacion = await pool.query('SELECT COUNT(*) AS total FROM actasdeoperaciones');

        const actasOperacionTotal = {
            data:getActasOperacion[0],
            total:totalActasOperacion[0][0].total
        }

        return actasOperacionTotal;

    } catch (error) {
        console.error('Error al obtener las actas de operaciones', error);
    }
}

async function getBuscarActasDeOperaciones(offset,itemsPerPage,registroBuscar,columnaBuscar) {

    try {
       
        if(columnaBuscar == "razonActaOperacion"){

            const [rows] = await pool.query(`
                SELECT 
                a.idactasDeOperaciones,
                rm.razonMovimientocol, 
                eam.nombre AS estadoActaNombre, 
                a.numServicioActa,
                a.usuarioCreoActa,
                a.usuarioValidoActa,
                a.imgActa,
                a.descripcion,
                a.obsActaRecha,
                a.nCajaNap,
                DATE_FORMAT(a.fechaValidacionActa,'%Y-%m-%d %H:%i') as fechaValidacionActa,
                DATE_FORMAT(a.fechaCreacionActa,'%Y-%m-%d %H:%i') as fechaCreacionActa
                FROM actasdeoperaciones a
                INNER JOIN razonmovimiento rm ON a.razonActaOperacion = rm.idrazonMovimiento
                INNER JOIN estadoactamov eam ON a.estadoActaOperacion = eam.idestadoActaMov
                where rm.razonMovimientocol LIKE CONCAT('%', ?, '%')
                
                
                LIMIT ${offset},${itemsPerPage};`,registroBuscar);

            const [totalItems] = await pool.query(`
            SELECT COUNT(*) AS total 
            FROM actasdeoperaciones a
            INNER JOIN razonmovimiento rm ON a.razonActaOperacion = rm.idrazonMovimiento  where rm.razonMovimientocol LIKE CONCAT('%', ?, '%')`,registroBuscar);

        return {
            data:rows,
            total:totalItems
        }

        }else if(columnaBuscar == "estadoActaOperacion"){

            const [rows] = await pool.query(`
                SELECT 
                a.idactasDeOperaciones,
                rm.razonMovimientocol, 
                eam.nombre AS estadoActaNombre, 
                a.numServicioActa,
                a.usuarioCreoActa,
                a.usuarioValidoActa,
                a.imgActa,
                a.descripcion,
                a.obsActaRecha,
                a.nCajaNap,
                DATE_FORMAT(a.fechaValidacionActa,'%Y-%m-%d %H:%i') as fechaValidacionActa,
                DATE_FORMAT(a.fechaCreacionActa,'%Y-%m-%d %H:%i') as fechaCreacionActa
                FROM actasdeoperaciones a
                INNER JOIN razonmovimiento rm ON a.razonActaOperacion = rm.idrazonMovimiento
                INNER JOIN estadoactamov eam ON a.estadoActaOperacion = eam.idestadoActaMov
                where eam.nombre LIKE CONCAT('%', ?, '%')
                
                
                LIMIT ${offset},${itemsPerPage};`,registroBuscar);

            const [totalItems] = await pool.query(`
            SELECT COUNT(*) AS total 
            FROM actasdeoperaciones a
            INNER JOIN estadoactamov eam ON a.estadoActaOperacion = eam.idestadoActaMov  where eam.nombre LIKE CONCAT('%', ?, '%')`,registroBuscar);

        return {
            data:rows,
            total:totalItems
        }



        }else if(columnaBuscar == "numServicioActa"){

            const [rows] = await pool.query(`
                SELECT 
                a.idactasDeOperaciones,
                rm.razonMovimientocol, 
                eam.nombre AS estadoActaNombre, 
                a.numServicioActa,
                a.usuarioCreoActa,
                a.usuarioValidoActa,
                a.imgActa,
                a.descripcion,
                a.obsActaRecha,
                a.nCajaNap,
                DATE_FORMAT(a.fechaValidacionActa,'%Y-%m-%d %H:%i') as fechaValidacionActa,
                DATE_FORMAT(a.fechaCreacionActa,'%Y-%m-%d %H:%i') as fechaCreacionActa
                FROM actasdeoperaciones a
                INNER JOIN razonmovimiento rm ON a.razonActaOperacion = rm.idrazonMovimiento
                INNER JOIN estadoactamov eam ON a.estadoActaOperacion = eam.idestadoActaMov
                where  a.numServicioActa LIKE CONCAT('%', ?, '%')
                
                
                LIMIT ${offset},${itemsPerPage};`,registroBuscar);

            const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actasdeoperaciones a where a.numServicioActa LIKE CONCAT('%', ?, '%')`,registroBuscar);

        return {
            data:rows,
            total:totalItems
        }



        }else if(columnaBuscar == "usuarioCreoActa"){

            const [rows] = await pool.query(`
                SELECT 
                a.idactasDeOperaciones,
                rm.razonMovimientocol, 
                eam.nombre AS estadoActaNombre, 
                a.numServicioActa,
                a.usuarioCreoActa,
                a.usuarioValidoActa,
                a.imgActa,
                a.descripcion,
                a.obsActaRecha,
                a.nCajaNap,
                DATE_FORMAT(a.fechaValidacionActa,'%Y-%m-%d %H:%i') as fechaValidacionActa,
                DATE_FORMAT(a.fechaCreacionActa,'%Y-%m-%d %H:%i') as fechaCreacionActa
                FROM actasdeoperaciones a
                INNER JOIN razonmovimiento rm ON a.razonActaOperacion = rm.idrazonMovimiento
                INNER JOIN estadoactamov eam ON a.estadoActaOperacion = eam.idestadoActaMov
                where a.usuarioCreoActa LIKE CONCAT('%', ?, '%')
                
                
                LIMIT ${offset},${itemsPerPage};`,registroBuscar);

            const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actasdeoperaciones a where a.usuarioCreoActa LIKE CONCAT('%', ?, '%')`,registroBuscar);

        return {
            data:rows,
            total:totalItems
        }



        }else if(columnaBuscar == "usuarioValidoActa"){

            const [rows] = await pool.query(`
                SELECT 
                a.idactasDeOperaciones,
                rm.razonMovimientocol, 
                eam.nombre AS estadoActaNombre, 
                a.numServicioActa,
                a.usuarioCreoActa,
                a.usuarioValidoActa,
                a.imgActa,
                a.descripcion,
                a.obsActaRecha,
                a.nCajaNap,
                DATE_FORMAT(a.fechaValidacionActa,'%Y-%m-%d %H:%i') as fechaValidacionActa,
                DATE_FORMAT(a.fechaCreacionActa,'%Y-%m-%d %H:%i') as fechaCreacionActa
                FROM actasdeoperaciones a
                INNER JOIN razonmovimiento rm ON a.razonActaOperacion = rm.idrazonMovimiento
                INNER JOIN estadoactamov eam ON a.estadoActaOperacion = eam.idestadoActaMov
                where  a.usuarioValidoActa LIKE CONCAT('%', ?, '%')
                
                
                LIMIT ${offset},${itemsPerPage};`,registroBuscar);

            const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actasdeoperaciones a where  a.usuarioValidoActa LIKE CONCAT('%', ?, '%')`,registroBuscar);

        return {
            data:rows,
            total:totalItems
        }



        }else if(columnaBuscar == "fechaCreacionActa"){
            console.log(registroBuscar);
            const [rows] = await pool.query(`
                SELECT 
                a.idactasDeOperaciones,
                rm.razonMovimientocol, 
                eam.nombre AS estadoActaNombre, 
                a.numServicioActa,
                a.usuarioCreoActa,
                a.usuarioValidoActa,
                a.imgActa,
                a.descripcion,
                a.obsActaRecha,
                a.nCajaNap,
                DATE_FORMAT(a.fechaValidacionActa,'%Y-%m-%d %H:%i') as fechaValidacionActa,
                DATE_FORMAT(a.fechaCreacionActa,'%Y-%m-%d %H:%i') as fechaCreacionActa
                FROM actasdeoperaciones a
                INNER JOIN razonmovimiento rm ON a.razonActaOperacion = rm.idrazonMovimiento
                INNER JOIN estadoactamov eam ON a.estadoActaOperacion = eam.idestadoActaMov
                where DATE(a.fechaCreacionActa)  LIKE CONCAT('%', ?, '%')
                
                
                LIMIT ${offset},${itemsPerPage};`,registroBuscar);

            const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actasdeoperaciones a where DATE(a.fechaCreacionActa)  LIKE CONCAT('%', ?, '%')`,registroBuscar);

        return {
            data:rows,
            total:totalItems
        }



        }else if(columnaBuscar == "fechaValidacionActa"){
         
            const [rows] = await pool.query(`
                SELECT 
                a.idactasDeOperaciones,
                rm.razonMovimientocol, 
                eam.nombre AS estadoActaNombre, 
                a.numServicioActa,
                a.usuarioCreoActa,
                a.usuarioValidoActa,
                a.imgActa,
                a.descripcion,
                a.obsActaRecha,
                a.nCajaNap,
                DATE_FORMAT(a.fechaValidacionActa,'%Y-%m-%d %H:%i') as fechaValidacionActa,
                DATE_FORMAT(a.fechaCreacionActa,'%Y-%m-%d %H:%i') as fechaCreacionActa
                FROM actasdeoperaciones a
                INNER JOIN razonmovimiento rm ON a.razonActaOperacion = rm.idrazonMovimiento
                INNER JOIN estadoactamov eam ON a.estadoActaOperacion = eam.idestadoActaMov
                where DATE(a.fechaValidacionActa)  LIKE CONCAT('%', ?, '%')
                
                
                LIMIT ${offset},${itemsPerPage};`,registroBuscar);

            const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actasdeoperaciones a where DATE(a.fechaValidacionActa)  LIKE CONCAT('%', ?, '%')`,registroBuscar);

        return {
            data:rows,
            total:totalItems
        }



        }else if(columnaBuscar == "numCaja"){

            const [rows] = await pool.query(`
                SELECT 
                a.idactasDeOperaciones,
                rm.razonMovimientocol, 
                eam.nombre AS estadoActaNombre, 
                a.numServicioActa,
                a.usuarioCreoActa,
                a.usuarioValidoActa,
                a.imgActa,
                a.descripcion,
                a.obsActaRecha,
                a.nCajaNap,
                DATE_FORMAT(a.fechaValidacionActa,'%Y-%m-%d %H:%i') as fechaValidacionActa,
                DATE_FORMAT(a.fechaCreacionActa,'%Y-%m-%d %H:%i') as fechaCreacionActa
                FROM actasdeoperaciones a
                INNER JOIN razonmovimiento rm ON a.razonActaOperacion = rm.idrazonMovimiento
                INNER JOIN estadoactamov eam ON a.estadoActaOperacion = eam.idestadoActaMov
                where  a.nCajaNap  LIKE CONCAT('%', ?, '%')
                
                
                LIMIT ${offset},${itemsPerPage};`,registroBuscar);

            const [totalItems] = await pool.query(`SELECT COUNT(*) AS total FROM actasdeoperaciones a where a.nCajaNap  LIKE CONCAT('%', ?, '%')`,registroBuscar);

        return {
            data:rows,
            total:totalItems
        }


        }



    } catch (error) {
        console.error('Error al obtener las actas de operaciones por el buscador', error);
    }
}


async function getAllActasOperacionesTecnicos(nombreTecnico) {

    try {
        const [getActasOperacion] = await pool.query('call getAllActasOperacionesTecnicos(?)',[nombreTecnico]);
       
        return getActasOperacion[0];

    } catch (error) {
        console.error('Error al obtener las actas de operaciones de un tecnico', error);
    }
}


async function postCrearActaOperaciones(RazonMovimiento,numServicioActa,usuarioCreoActa,ImgGuia,descripcion,fechaFormateada,idAgenda,ncajanap) {

    try {
        await pool.query('insert into actasdeoperaciones (razonActaOperacion,estadoActaOperacion,numServicioActa,usuarioCreoActa,fechaCreacionActa,imgActa,descripcion,idAgenda,nCajaNap) VALUES(?,?,?,?,?,?,?,?,?) ',[RazonMovimiento,1,numServicioActa,usuarioCreoActa,fechaFormateada,ImgGuia,descripcion,idAgenda,ncajanap]);
        return true;

    } catch (error) {
        console.error('Error al crear el acta de operaciones', error);
        return false;
    }
}

async function putActualizarActaOperacionesAceptar(tecnico_o_administractivo,idActaOperacion,fechaFormateada) {

    try {
        await pool.query('call putEstadoActaDeOperacionesAceptar(?,?,?)', [tecnico_o_administractivo,idActaOperacion,fechaFormateada]);
        return true;

    } catch (error) {
        console.error('Error al actualizar el acta de operaciones', error);
        return false;
    }
}

async function putActualizarActaOperacionesRechazar(tecnico_o_administractivo,idActaOperacion,fechaFormateada,razonAnulacion) {

    try {
        await pool.query('call putEstadoActaDeOperacionesRechazar(?,?,?,?)', [tecnico_o_administractivo,idActaOperacion,fechaFormateada,razonAnulacion]);
        return true;

    } catch (error) {
        console.error('Error al actualizar el acta de operaciones', error);
        return false;
    }
}

async function actualizarNumCaja(idOperacion,cambioCaja,tecnico_o_administractivo) {

    try {
        await pool.query('update actasdeoperaciones set nCajaNap = ? , ultimoUsuarioModifica=? where idactasDeOperaciones = ?',[idOperacion,tecnico_o_administractivo,cambioCaja]);
        return 200;

    } catch (error) {
        console.error('Error al actualizar el acta de operaciones', error);
        return false;
    }
}


module.exports = {
    getAllActasOperaciones,
    getBuscarActasDeOperaciones,
    getAllActasOperacionesTecnicos,
    postCrearActaOperaciones,
    putActualizarActaOperacionesAceptar,
    putActualizarActaOperacionesRechazar,
    actualizarNumCaja
}