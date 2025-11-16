const { Usuario } = require('../Entitites/FullEntities/usuario');
const { mapearUsuario } = require('../Mappers/usuarioMapper');


const {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    editarUsuario,
    eliminarUsuario,
    obtenerUsuarioByIdNormal, //Esta es obtenerUsuarioByIdNormal, solo que la exporta con este nombre a la funcion
    obtenerIdAirtablePorIdUsuario,
    obtenerUsuarioByIdAirtable 
} = require('../DAO-Repository/airtableRepositoryUsuarios');


// =================== Helpers ======================== 

let ultimoIdUsuario = 0;  // variable global en memoria

async function obtenerProximoIdUsuario() {
    if (ultimoIdUsuario === 0) {
        const usuarios = await obtenerUsuarios();
        const ids = usuarios
            .map(u => parseInt(u.fields.idUsuario))
            .filter(id => !isNaN(id));
        ultimoIdUsuario = ids.length > 0 ? Math.max(...ids) : 0;
    }

    ultimoIdUsuario++;
    return ultimoIdUsuario;
}
//Busca Usuario por EMAIL 
async function buscarUsuarioPorEmailService(email) {
    try {
        if (!email) return { error: 'El email es obligatorio' };

        const usuarios = await obtenerUsuarios();
        if (!Array.isArray(usuarios)) return { error: 'Error al obtener usuarios' };

        const usuario = usuarios.find(u => u.fields?.email?.toLowerCase() === email.toLowerCase());

        if (!usuario) return { error: `No se encontró usuario con email ${email}` };

        return mapearUsuario(usuario);

    } catch (error) {
        return { error: 'Error interno al buscar usuario por email' };
    }
}


//Busca Usuario por nombreUsuario
async function buscarUsuarioPorNombreUsuarioService(nombreUsuario) {
    try {
        if (!nombreUsuario) return { error: 'El nombre de usuario es obligatorio' };

        const usuarios = await obtenerUsuarios();
        const usuario = usuarios.find(
            u => u.fields?.nombreUsuario?.toLowerCase() === nombreUsuario.toLowerCase()
        );

        if (!usuario) return { error: `Usuario ${nombreUsuario} no encontrado` };

        return mapearUsuario(usuario);

    } catch (error) {
        return { error: 'Error interno al buscar usuario por nombre de usuario' };
    }
}

// =========== Funciones de Servicio ================
//Crear usuario nuevo
async function crearUsuarioService(datosUsuario) {
    const { email, nombreUsuario, contrasenia } = datosUsuario;

    // Verificar duplicados 
    const usuario = await buscarUsuarioPorEmailService(email);

    // Si encontró un usuario (no hay error), significa que el email ya existe
    if (usuario && !usuario.error) {
        return { error: `El usuario con email ${email} ya existe` };
    }

    // Generar nuevo ID 
    const nuevoId = await obtenerProximoIdUsuario();

    // Crear instancia de la clase Usuario 
    const nuevoUsuario = new Usuario(email, nombreUsuario, contrasenia);
    nuevoUsuario.setidUsuario = nuevoId;
    nuevoUsuario.estadoAdmin = false;
    nuevoUsuario.setUsuarioPremium = false;

    // Guardar en Airtable
    const resultado = await crearUsuario({
        idUsuario: nuevoUsuario.getIdUsuario,
        email: nuevoUsuario.getEmail,
        nombreUsuario: nuevoUsuario.getNombreUsuario,
        contrasenia: nuevoUsuario.getContrasenia,
        estadoAdmin: false,
        usuarioPremium: false,
    });

    return { message: 'Usuario creado correctamente', data: mapearUsuario(resultado) };
}

//Obtener usuario por ID NORMAL, GET 
async function obtenerUsuarioService(idUsuario) {
    const usuario = await obtenerUsuarioByIdNormal(idUsuario);
    if (!usuario) return { error: `Usuario con ID ${idUsuario} NO ENCONTRADO` };

    return mapearUsuario(usuario);
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
        message: `Usuario con idUsuario=${idUsuario} editado, de forma parcial,correctamente.`,
        data: resultado
    };
}
//Eliminar Usuario 
async function eliminarUsuarioService(idUsuario) {
    console.log(`[eliminarUsuarioService] Eliminando usuario con ID NORMAL: ${idUsuario}`);

    // 1) Obtener ID interno de Airtable
    const idAirtableUsuario = await obtenerIdAirtablePorIdUsuario(idUsuario)
        .catch(() => null); // si da error, devolvemos null

    if (!idAirtableUsuario) {
        return { error: `No existe usuario con ID ${idUsuario}` };
    }

    // 2) Eliminar el usuario en Airtable
    const resultado = await eliminarUsuario(idAirtableUsuario);

    return {
        message: `Usuario ${idUsuario} eliminado correctamente.`,
        airtableIdEliminado: idAirtableUsuario,
        resultado
    };
}


//Validar si el usuario es admin 

async function validarAdminService(idUsuario) {
    // 1. Buscar el ID interno de Airtable a partir del ID lógico
    const idAirtableUsuario = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if (!idAirtableUsuario) {
        console.error(`No se encontró el usuario con ID normal ${idUsuario}`);
        return false;
    }

    // 2. Obtener el registro completo del usuario
    const usuarioAdmin = await obtenerUsuarioByIdAirtable(idAirtableUsuario);
    if (!usuarioAdmin || !usuarioAdmin.fields) {
        console.error(` No se pudo obtener el usuario en Airtable para ID interno ${idAirtableUsuario}`);
        return false;
    }

    // 3. Validar campo booleano
    return usuarioAdmin.fields.estadoAdmin === true;
}


//Setear a un usuario como Admin o sacarle esta funcionalidad
async function setUsuarioAdminService(idUsuario) {
    const idAirtable = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if (!idAirtable) {
        return { error: `Usuario con ID ${idUsuario} no encontrado` };
    }

    const usuarioActual = await obtenerUsuarioByIdAirtable(idAirtable);
    if (!usuarioActual) {
        return { error: `No se pudo obtener el usuario con ID de Airtable ${idAirtable}` };
    }

    const estadoActual = usuarioActual.fields.estadoAdmin === true;
    const nuevoEstado = !estadoActual;

    const resultado = await editarUsuario(idAirtable, {
        estadoAdmin: nuevoEstado
    });

    return {
    message: `Usuario ...`,
    data: mapearUsuario(resultado)
};
}

//Setear a un usuario como Premium o sacarle esta funcionalidad
async function setUsuarioPremiumService(idUsuario) {
    const idAirtable = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if (!idAirtable) {
        return { error: `Usuario con ID ${idUsuario} no encontrado` };
    }

    const usuarioActual = await obtenerUsuarioByIdAirtable(idAirtable);
    if (!usuarioActual) {
        return { error: `No se pudo obtener el usuario con ID de Airtable ${idAirtable}` };
    }

    const estadoActual = usuarioActual.fields.usuarioPremium === true;
    const nuevoEstado = !estadoActual;

    const resultado = await editarUsuario(idAirtable, {
        usuarioPremium: nuevoEstado
    });

    return {
    message: `Usuario ...`,
    data: mapearUsuario(resultado)
};
}

//Obtener administradores
async function obtenerAdminsService() {
    const usuarios = await obtenerUsuarios(); // Esto ya devuelve records de Airtable

    return usuarios
        .filter(u => u.fields.estadoAdmin === true)
        .map(u => ({
            idUsuario: u.fields.idUsuario,
            nombreUsuario: u.fields.nombreUsuario,
            email: u.fields.email,
            usuarioPremium: u.fields.usuarioPremium === true,
            estadoAdmin: true,
            idAirtable: u.id   // <- ESTO ES LA CLAVE
        }));
}




module.exports = {
    crearUsuarioService,
    setUsuarioAdminService,
    setUsuarioPremiumService,
    validarAdminService,
    eliminarUsuarioService,
    actualizarUsuarioService,
    editarUsuarioService,
    obtenerUsuarioService,
    buscarUsuarioPorEmailService,
    buscarUsuarioPorNombreUsuarioService,
    obtenerAdminsService

}
