async function mapearUsuario(usuarioRecord) {
    if (!usuarioRecord || !usuarioRecord.fields) return null;

    const f = usuarioRecord.fields;

    return {
        idUsuario: f.idUsuario,
        nombreUsuario: f.nombreUsuario || "",
        email: f.email || "",
        contrasenia: f.contrasenia,
        usuarioPremium: f.usuarioPremium === true,
        estadoAdmin: f.estadoAdmin === true
    };
}

module.exports = { mapearUsuario };
