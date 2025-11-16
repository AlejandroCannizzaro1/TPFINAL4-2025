const { obtenerTurnoByIdAirtable } = require("../DAO-Repository/airtableRepositoryTurnos");


async function mapearNotificacionUsuario(notificacion) {

    const turnoAirtableId = notificacion.fields.idTurnoVinculado?.[0] ?? null;

    let idTurno = null;
    let fecha = null;
    let hora = null;
    let servicio = null;

    if (turnoAirtableId) {
        const turno = await obtenerTurnoByIdAirtable(turnoAirtableId);
        if (turno?.fields) {
            idTurno = turno.fields.idTurno;       // ID real
            fecha = turno.fields.fecha;
            hora = turno.fields.hora;
            servicio = turno.fields.tipoServicio || "servicio";
        }
    }

    return {
        idNotificacion: notificacion.fields.idNotificacion,
        mensaje: notificacion.fields.mensajeNotificacion,
        leida: notificacion.fields.mensajeLeido,
        idTurno,
        fecha,
        hora,
        servicio
    };
}




async function mapearNotificacionTurno(notificacion, obtenerTurnoByIdAirtable) {
    const turnoAirtableId = notificacion.fields.idTurnoVinculado?.[0] ?? null;

    let idTurno = null;
    let fecha = null;
    let hora = null;
    let servicio = null;

    if (turnoAirtableId) {
        const turno = await obtenerTurnoByIdAirtable(turnoAirtableId);
        idTurno = turno.fields.idTurno;
        fecha = turno.fields.fecha;
        hora = turno.fields.hora;
        servicio = turno.fields.tipoServicio || null;
    }

    return {
        idNotificacion: notificacion.fields.idNotificacion,
        mensaje: notificacion.fields.mensajeNotificacion,
        leida: notificacion.fields.mensajeLeido,
        idTurno,
        fecha,
        hora,
        servicio
    };
}


module.exports = {
    mapearNotificacionTurno,
    mapearNotificacionUsuario
};
