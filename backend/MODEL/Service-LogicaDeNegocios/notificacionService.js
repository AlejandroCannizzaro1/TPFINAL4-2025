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


// Obtiene notificaciones por ID de Usuario
async function obtenerNotificacionesPorIdUsuarioService(idUsuario) {

    const usuarioAirtableId = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if (!usuarioAirtableId) {
        return { error: `No existe el usuario con ID ${idUsuario}` };
    }

    const notificaciones = await obtenerNotificaciones();

    const filtradas = notificaciones.filter(n =>
        Array.isArray(n.fields.idUsuarioVinculado) &&
        n.fields.idUsuarioVinculado.includes(usuarioAirtableId)
    );

    if (filtradas.length === 0) {
        return { mensaje: `El usuario ${idUsuario} no tiene notificaciones` };
    }

    return await Promise.all(
        filtradas.map(async n => {

            // INICIALIZAMOS EN NULL POR SI NO HAY TURNO VINCULADO
            let idTurno = null;
            let fechaTurno = null;
            let horaTurno = null;
            let servicioTurno = null;

            const turnoAirtableId = n.fields.idTurnoVinculado?.[0] ?? null;

            if (turnoAirtableId) {
                const turno = await obtenerTurnoByIdAirtable(turnoAirtableId);

                idTurno = turno.fields.idTurno;
                fechaTurno = turno.fields.fecha;
                horaTurno = turno.fields.hora;
                servicioTurno = turno.fields.tipoServicio || "servicio";
            }

            return {
                idNotificacion: n.fields.idNotificacion,
                mensaje: n.fields.mensajeNotificacion,
                leida: n.fields.mensajeLeido,

                // CAMPOS PLANOS PARA EL FRONT
                idTurno,
                fechaTurno,
                horaTurno,
                servicioTurno
            };
        })
    );
}



// Obtiene notificaciones por ID de Turno. Solo manda las que le llegaron al admin para evitar duplicados 
async function obtenerNotificacionesPorIdTurnoService(idTurno) {

    const turnoAirtableId = await obtenerIdAirtablePorIdTurno(idTurno);
    if (!turnoAirtableId) {
        return { error: `No existe el turno con ID ${idTurno}` };
    }

    const admins = await obtenerAdminsService();
    const adminIds = admins.map(a => a.idAirtable);

    const notificaciones = await obtenerNotificaciones();

    // Filtrar solo las que pertenecen a ese turno y son notificaciones para admins
    const filtradas = notificaciones.filter(n =>
        Array.isArray(n.fields.idTurnoVinculado) &&
        n.fields.idTurnoVinculado.includes(turnoAirtableId) &&
        Array.isArray(n.fields.idUsuarioVinculado) &&
        n.fields.idUsuarioVinculado.some(uid => adminIds.includes(uid))
    );

    if (filtradas.length === 0) {
        return { mensaje: "No hay notificaciones para este turno (solo admin)." };
    }

    // Convertimos las notificaciones
    return await Promise.all(
        filtradas.map(async n => {
            const usuarioAirtableId = n.fields.idUsuarioVinculado?.[0] ?? null;

            let usuarioNombre = null;
            let usuarioIdNormal = null;

            if (usuarioAirtableId) {
                const usuario = await obtenerUsuarioByIdAirtable(usuarioAirtableId);
                usuarioNombre = usuario.fields.nombreUsuario;
                usuarioIdNormal = usuario.fields.idUsuario;
            }

            return {
                idNotificacion: n.fields.idNotificacion,
                mensaje: n.fields.mensajeNotificacion,
                idTurno,              // <-- ahora el front tiene acceso directo
                usuario: usuarioNombre,
                idUsuario: usuarioIdNormal
            };
        })
    );
}





module.exports = {
    obtenerProximoIdNotificacionService,
    crearNotificacionService,
    notificarReservaService,
    notificarCancelacionService,
    notificarEventoService, 
    obtenerNotificacionesPorIdUsuarioService, 
    obtenerNotificacionesPorIdTurnoService
};
