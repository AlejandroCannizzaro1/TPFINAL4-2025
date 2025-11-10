function mapearTurno(turnoRecord) {
    if (!turnoRecord || !turnoRecord.fields) return null;

    const fields = turnoRecord.fields;

    return {
        idTurno: fields.idTurno,                  // ID real que el front conoce
        fecha: fields.fecha,
        hora: fields.hora,
        tipoServicio: fields.tipoServicio || "",
        notas: fields.notas || "",
        turnoDisponible: fields.turnoDisponible === true,

        // Si tiene usuario vinculado, lo mandamos como ID normal (no el interno)
        usuarioVinculado: Array.isArray(fields.idUsuarioVinculado)
            ? fields.idUsuarioVinculado.length > 0
                ? fields.idUsuarioVinculado[0] // esto es id Airtable
                : null
            : null
    };
}

module.exports = { mapearTurno };
