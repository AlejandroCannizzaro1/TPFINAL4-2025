const {
    obtenerNotificaciones,
    crearNotificacion,
    obtenerIdAirtablePorIdNotificacion,
    marcarNotificacionLeida,
    eliminarNotificacion
} = require("../DAO-Repository/notificacionRepository");

const { obtenerTurnoByIdAirtable, obtenerIdAirtablePorIdTurno } = require("../DAO-Repository/airtableRepositoryTurnos");
const { obtenerUsuarioByIdAirtable, obtenerIdAirtablePorIdUsuario } = require("../DAO-Repository/airtableRepositoryUsuarios");
const { obtenerAdminsService } = require('./usuarioService');


// Helper. Identifica si es un recordId de Airtable
function esRecordId(id) {
    return typeof id === "string" && id.startsWith("rec");
}


// Obtener el próximo ID incremental de notificación
async function obtenerProximoIdNotificacionService() {
    const notificaciones = await obtenerNotificaciones();
    if (!notificaciones || notificaciones.length === 0) return 1;

    const ids = notificaciones
        .map(n => parseInt(n.fields.idNotificacion))
        .filter(id => !isNaN(id));

    return ids.length === 0 ? 1 : Math.max(...ids) + 1;
}


// Crear notificación genérica
async function crearNotificacionService(turnoAirtableId, usuarioAirtableId, mensaje) {
    const nuevoId = await obtenerProximoIdNotificacionService();

    const nuevaNotificacion = {
        idNotificacion: nuevoId,
        mensajeNotificacion: mensaje,
        mensajeLeido: false,
        idTurnoVinculado: [turnoAirtableId],
        idUsuarioVinculado: usuarioAirtableId ? [usuarioAirtableId] : []

    };
    //para debugging 
    console.log("OBJETO FINAL A GUARDAR:", nuevaNotificacion);
    
    const resultado = await crearNotificacion(nuevaNotificacion);
    if (resultado.error) throw new Error(`Error creando notificación: ${resultado.error.message}`);

    return resultado;
}


// Notificación cuando se reserva
async function notificarReservaService(idTurno, idUsuario) {

    const turnoAirtableId = esRecordId(idTurno) ? idTurno : await obtenerIdAirtablePorIdTurno(idTurno);
    const usuarioAirtableId = esRecordId(idUsuario) ? idUsuario : await obtenerIdAirtablePorIdUsuario(idUsuario);

    const turno = await obtenerTurnoByIdAirtable(turnoAirtableId);
    const usuario = await obtenerUsuarioByIdAirtable(usuarioAirtableId);

    const mensajeUsuario = `Hola ${usuario.fields.nombreUsuario}! Reservaste el turno de ${turno.fields.tipoServicio || 'servicio'} el ${turno.fields.fecha} a las ${turno.fields.hora}.`;
    const mensajeAdmin = `El usuario ${usuario.fields.nombreUsuario} reservó un turno para ${turno.fields.fecha} a las ${turno.fields.hora}.`;

    return await notificarEventoService(turnoAirtableId, usuarioAirtableId, mensajeUsuario, mensajeAdmin);
}


// Notificación cuando se cancela
async function notificarCancelacionService(idTurno, idUsuario) {

    const turnoAirtableId = esRecordId(idTurno) ? idTurno : await obtenerIdAirtablePorIdTurno(idTurno);
    const usuarioAirtableId = esRecordId(idUsuario) ? idUsuario : await obtenerIdAirtablePorIdUsuario(idUsuario);

    const turno = await obtenerTurnoByIdAirtable(turnoAirtableId);
    const usuario = await obtenerUsuarioByIdAirtable(usuarioAirtableId);

    const mensajeUsuario = `Hola ${usuario.fields.nombreUsuario}. Se canceló tu turno del ${turno.fields.fecha} a las ${turno.fields.hora}.`;
    const mensajeAdmin = `El usuario ${usuario.fields.nombreUsuario} canceló su turno del ${turno.fields.fecha} a las ${turno.fields.hora}.`;

    return await notificarEventoService(turnoAirtableId, usuarioAirtableId, mensajeUsuario, mensajeAdmin);
}


// Notifica a usuario + admins
async function notificarEventoService(turnoAirtableId, usuarioAirtableId, mensajeUsuario, mensajeAdmin) {

    await crearNotificacionService(turnoAirtableId, usuarioAirtableId, mensajeUsuario);

    const admins = await obtenerAdminsService();

    // LOG PARA VER SI ESTÁN LLEGANDO LOS ADMINS CORRECTOS
    console.log("ADMINS ENCONTRADOS PARA NOTIFICAR:", admins);

    for (const admin of admins) {
        await crearNotificacionService(turnoAirtableId, admin.idAirtable, mensajeAdmin);
    }
}

module.exports = {
    obtenerProximoIdNotificacionService,
    crearNotificacionService,
    notificarReservaService,
    notificarCancelacionService,
    notificarEventoService
};
