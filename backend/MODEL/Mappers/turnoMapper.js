const { obtenerUsuarioByIdAirtable } = require("../DAO-Repository/airtableRepositoryUsuarios");

async function mapearTurno(recordAirtable) {
    if (!recordAirtable || !recordAirtable.fields) return null;

    const f = recordAirtable.fields;

    let usuarioIdNormal = null;
    let usuarioNombre = null;

    if (Array.isArray(f.idUsuarioVinculado) && f.idUsuarioVinculado.length > 0) {
        const usuarioRecord = await obtenerUsuarioByIdAirtable(f.idUsuarioVinculado[0]);

        if (usuarioRecord && usuarioRecord.fields) {
            usuarioIdNormal = usuarioRecord.fields.idUsuario;
            usuarioNombre = usuarioRecord.fields.nombreUsuario;
        }
    }

    return {
        idTurno: f.idTurno,
        fecha: f.fecha,
        hora: f.hora,
        tipoServicio: f.tipoServicio || "",
        notas: f.notas || null,
        turnoDisponible: f.turnoDisponible === true,
        usuarioId: usuarioIdNormal,
        usuarioNombre,
        notificaciones: Array.isArray(f.Notificacion) ? f.Notificacion.slice() : []
    };
}

module.exports = { mapearTurno };
