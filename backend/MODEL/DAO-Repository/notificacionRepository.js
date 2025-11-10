require('dotenv').config();
const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);
const TABLE = process.env.AIRTABLE_TABLE_NOTIFICACIONES;
const { mapearNotificacionTurno, mapearNotificacionUsuario } = require("../Mappers/notificacionMapper");

// Obtener todas las notificaciones
async function obtenerNotificaciones() {
    const records = await base(TABLE).select().all();
    return records;
}

// Obtener una notificación por ID normal (idNotificacion)
async function obtenerNotificacionByIdNormal(idNotificacion) {
    const records = await base(TABLE)
        .select({
            filterByFormula: `{idNotificacion} = ${Number(idNotificacion)}`
        })
        .firstPage();

    return records.length > 0 ? records[0] : null;
}

// Obtener la ID interna de Airtable usando idNotificacion
async function obtenerIdAirtablePorIdNotificacion(idNotificacion) {
    const record = await obtenerNotificacionByIdNormal(idNotificacion);
    return record ? record.id : null;
}

// Crear nueva notificación
async function crearNotificacion(nuevaNotificacion) {
    try {
        const record = await base(TABLE).create([
            {
                fields: {
                    idNotificacion: nuevaNotificacion.idNotificacion,
                    mensajeNotificacion: nuevaNotificacion.mensajeNotificacion,
                    mensajeLeido: nuevaNotificacion.mensajeLeido,

                    // NOMBRES CORRECTOS:
                    idTurnoVinculado: nuevaNotificacion.idTurnoVinculado,
                    idUsuarioVinculado: nuevaNotificacion.idUsuarioVinculado
                }
            }
        ]);

        return record[0];
    } catch (error) {
        return { error };
    }
}



// Marcar notificación como leída
async function marcarNotificacionLeida(idNotificacion) {
    const idAirtable = await obtenerIdAirtablePorIdNotificacion(idNotificacion);
    if (!idAirtable) return { error: `No se encontró la notificación ${idNotificacion}` };

    try {
        const result = await base(TABLE).update(idAirtable, {
            mensajeLeido: true
        });

        return result;
    } catch (error) {
        return { error };
    }
}

// Eliminar una notificación
async function eliminarNotificacion(idNotificacion) {
    const idAirtable = await obtenerIdAirtablePorIdNotificacion(idNotificacion);
    if (!idAirtable) return { error: `No se encontró la notificación ${idNotificacion}` };

    try {
        return await base(TABLE).destroy(idAirtable);
    } catch (error) {
        return { error };
    }
}

module.exports = {
    obtenerNotificaciones,
    obtenerNotificacionByIdNormal,
    obtenerIdAirtablePorIdNotificacion,
    crearNotificacion,
    marcarNotificacionLeida,
    eliminarNotificacion
};
