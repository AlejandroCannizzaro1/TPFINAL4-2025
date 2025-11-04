const { Usuario } = require('../Entitites/FullEntities/usuario');

const {
    obtenerUsarios,
    crearUsuario,
    actualizarUsuario,
    editarUsuario,
    eliminarUsuario,
    obtenerUsuarioById, //Esta es obtenerUsuarioByIdNormal, solo que la exporta con este nombre a la funcion
    obtenerIdAirtablePorIdUsuario
} = require('../DAO-Repository/airtableRepositoryUsuarios');


// =================== Helpers ======================== 

//Autoincrementa  el idUsuario basado en el mayor existente en Airtable 
async function obtenerProximoIdUsuario() {
    const usuarios = await obtenerUsarios();
    if (!usuarios.length) return 1;

    const ids = usuarios
        .map(user => user.fields.idUsuario)
        .filter(id => !isNaN(id))
        .map(number);


    const maxId = Math.max(...ids);
    return maxId + 1;
}

//Busca Usuario por EMAIL 
async function buscarUsuarioPorEmail(email) {
    const usuarios = await obtenerUsarios();
    return usuarios.find(u => u.email === email) || null;
}

//Busca Usuario por nombreUsuario
async function buscarUsuarioPorNombreUsuario(nombreUsuario) {
    const usuarios = await obtenerUsarios();
    return usuarios.find(user => user.nombreUsuario === nombreUsuario) || null;
}

// =========== Funciones de Servicio ================
//Crear usuario nuevo
async function crearUsuarioService(datosUsuario) {
    const { email, nombreUsuario, contrasenia } = datosUsuario;

    //Verificar duplicados 
    const existe = await buscarUsuarioPorEmail(email);
    if (existe) {
        return { error: `El usuario con email ${email} ya existe` };
    }
    //Generar nuevo ID 
    const nuevoId = await obtenerProximoIdUsuario();

    //Crear instancia de la clase de usuario 
    const nuevoUsuario = new Usuario(email, nombreUsuario, contrasenia);
    nuevoUsuario.setidUsuario = nuevoId;
    nuevoUsuario.estadoAdmin = false;
    nuevoUsuario.setUsuarioPremium = false;

    //Guardar en AIRTABLE
    const resultado = await crearUsuario({
        idUsuario: nuevoUsuario.getIdUsuario,
        email: nuevoUsuario.getEmail,
        nombreUsuario: nuevoUsuario.getNombreUsuario,
        contrasenia: nuevoUsuario.getContrasenia,
        estadoAdmin: false,
        setUsuarioPremium: false,
        turnosUsuarios: nuevoUsuario.getTurnosUsuario
    });
    return { message: 'Usuario creado correctamente', data: resultado };
}

//Obtener usuario por ID NORMAL, GET 
async function obtenerUsuarioService(idUsuario) {
    const usuario = await obtenerUsuarioById(idUsuario);
    if (!usuario) return { error: `Usuario con ID ${idUsuario} NO ENCONTRADO` };
    return usuario;
}

//Actualizar usuario completo (PUT)
async function actualizarUsuarioService(idUsuario, nuevosDatos) {
    console.log(" [actualizarUsuarioService] Actualizando usuario con idUsuario:", idUsuario);

    // 1️ Buscar ID interno de Airtable a partir del idUsuario manual
    const idAirtable = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if (!idAirtable) {
        return { error: `Usuario con ID ${idUsuario} no encontrado.` };
    }

    // 2️ Validar que no intenten modificar el idUsuario
    if ('idUsuario' in nuevosDatos) {
        if (Number(nuevosDatos.idUsuario) !== Number(idUsuario)) {
            return { error: ` El campo 'idUsuario' es inmutable y no puede ser modificado.` };
        }
        // si es igual, lo eliminamos del body para evitar error 422
        delete nuevosDatos.idUsuario;
    }

    // 3️ Filtrar solo los campos válidos que Airtable acepta
    const camposPermitidos = [
        "nombreUsuario",
        "email",
        "contrasenia",
        "estadoAdmin",
        "usuarioPremium",
        "turnosUsuario"
    ];

    const datosFiltrados = {};
    for (const campo of camposPermitidos) {
        if (nuevosDatos[campo] !== undefined && nuevosDatos[campo] !== null) {
            datosFiltrados[campo] = nuevosDatos[campo];
        }
    }

    // 4️ Verificar que haya al menos un campo válido para actualizar
    if (Object.keys(datosFiltrados).length === 0) {
        return { error: "[]No se proporcionaron campos válidos para actualizar." };
    }

    // 5️ Agregar idUsuario original (para mantener coherencia en el registro)
    const datosCompletos = {
        ...datosFiltrados,
        idUsuario: Number(idUsuario)
    };

    // 6️ Enviar actualización a Airtable
    const resultado = await actualizarUsuario(idAirtable, datosCompletos);

    // 7️ Manejar posibles errores de Airtable (422 u otros)
    if (resultado.error) {
        return {
            error: `Error desde Airtable: ${resultado.error.message || "Error desconocido"}`,
            detalle: resultado
        };
    }

    // 8️ Retornar respuesta clara y uniforme
    return {
        message: `Usuario con idUsuario=${idUsuario} actualizado correctamente.`,
        data: resultado
    };
}
// Editar usuario parcialmente (PATCH)
async function editarUsuarioService(idUsuario, cambios) {
    console.log(`[Service PATCH] Actualizando usuario con idUsuario=${idUsuario}`);
    console.log("[Service PATCH] Body recibido:", cambios);

    // 1️ Buscar ID interno de Airtable
    const idAirtable = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if (!idAirtable) {
        return { error: `Usuario con ID ${idUsuario} NO ENCONTRADO` };
    }

    // 2️ Validar intento de modificar idUsuario
    if ("idUsuario" in cambios && Number(cambios.idUsuario) !== Number(idUsuario)) {
        return { error: `El campo idUsuario es inmutable y no puede ser modificado.` };
    }

    // 3️ Filtrar solo campos válidos
    const camposPermitidos = [
        "nombreUsuario",
        "email",
        "contrasenia",
        "estadoAdmin",
        "usuarioPremium",
        "turnosUsuario"
    ];

    const datosFiltrados = {};
    for (const campo of camposPermitidos) {
        if (cambios[campo] !== undefined && cambios[campo] !== null) {
            datosFiltrados[campo] = cambios[campo];
        }
    }

    // 4️ Verificar si hay algo que actualizar
    if (Object.keys(datosFiltrados).length === 0) {
        return { error: `No se proporcionaron campos válidos para actualizar.` };
    }

    // 5️ Llamar el PATCH del repo
    const resultado = await editarUsuario(idAirtable, datosFiltrados);

    // 6️ Respuesta uniforme
    return {
        message: `Usuario con idUsuario=${idUsuario} actualizado correctamente.`,
        data: resultado
    };
}
//Eliminar Usuario 
async function eliminarUsuarioService(idUsuario) {
    const idUsuarioAirtable = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if (!idUsuarioAirtable) {
        return { error: `Usuario de ID ${idUsuario} NO ENCONTRADO` };
    }

    const resultado = await eliminarUsuario(idUsuarioAirtable);
    return { message: `Usuario de ID ${idUsuario} eliminado`, data: resultado };
}

//Validar si el usuario es admin 
async function validarAdmin(idUsuario) {
    const usuarioAdmin = await obtenerUsuarioById(idUsuario);
    if (!usuarioAdmin) {
        return { error: `Usuario con ID ${idUsuario} NO ENCONTRADO` };
    }
    return usuario?.fields?.estadoAdmin === true;
}

async function setUsuarioAdmin(idUsuario, estado) {
    const idAirtable = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if (!idAirtable) {
        return { error: `Usuario con ID ${idUsuario} no encontrado` };
    }
    const resultado = await editarUsuarioService(idAirtable, {
        estadoAdmin: estado
    });
    return {
        message: `Usuario ${estado ? 'promovido a' : 'removido de'} admin`,
        data: resultado
    }
};

async function setUsuarioPremium(idUsuario, estado) {
    const idAirtable = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if (!idAirtable) {
        return { error: `Usuario con ID ${idUsuario} no encontrado` };
    }
    const resultado = await editarUsuarioService(idAirtable, {
        usuarioPremium: estado
    });
    return {
        message: `Usuario de ID ${idUsuario} ${estado ? 'tiene cuenta PREMIUM' : 'tiene cuenta REGULAR'}`,
        data: resultado
    }
}

module.exports = {
    setUsuarioAdmin,
    setUsuarioPremium,
    validarAdmin,
    eliminarUsuarioService,
    actualizarUsuarioService,
    editarUsuarioService,
    obtenerUsuarioService,
    buscarUsuarioPorEmail,
    buscarUsuarioPorNombreUsuario
}