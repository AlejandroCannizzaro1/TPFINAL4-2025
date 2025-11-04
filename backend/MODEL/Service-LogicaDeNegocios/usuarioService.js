const { Usuario } = require('../Entitites/FullEntities/usuario');

const {
    obtenerUsarios, 
    crearUsuario,
    actualizarUsuario,
    editarUsuario,
    eliminarUsuario,
    obtenerUsuarioById, //Esta es obtenerUsuarioByIdNormal, solo que la exporta con este nombre a la funcion
    obtenerIdAirtablePorIdUsuario
} = require ('../DAO-Repository/airtableRepositoryUsuarios');


// =================== Helpers ======================== 

//Autoincrementa  el idUsuario basado en el mayor existente en Airtable 
async function obtenerProximoIdUsuario(){
const usuarios = await obtenerUsarios();
if(!usuarios.length) return 1;

const ids = usuarios
.map(user => user.fields.idUsuario)
.filter(id => !isNaN(id))
.map(number);


const maxId = Math.max(...ids);
return maxId + 1;
}

//Busca Usuario por EMAIL 
async function buscarUsuarioPorEmail(email){
const usuarios = await obtenerUsarios();
return usuarios.find(u => u.email === email) || null;
}

//Busca Usuario por nombreUsuario
async function buscarUsuarioPorNombreUsuario(nombreUsuario){
    const usuarios = await obtenerUsarios();
    return usuarios.find(user => user.nombreUsuario === nombreUsuario) || null;
}

// =========== Funciones de Servicio ================
//Crear usuario nuevo
async function crearUsuarioService(datosUsuario){
const {email, nombreUsuario, contrasenia } = datosUsuario;

//Verificar duplicados 
const existe = await buscarUsuarioPorEmail(email);
if (existe ){
    return { error: `El usuario con email ${email} ya existe`};
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
    nombreUsuario : nuevoUsuario.getNombreUsuario,
    contrasenia: nuevoUsuario.getContrasenia,
    estadoAdmin : false,
    setUsuarioPremium: false,
    turnosUsuarios: nuevoUsuario.getTurnosUsuario
});
return { message: 'Usuario creado correctamente', data: resultado};
}

//Obtener usuario por ID NORMAL, GET 
async function obtenerUsuarioService(idUsuario){
    const usuario = await obtenerUsuarioById(idUsuario);
    if(!usuario) return {error: `Usuario con ID ${idUsuario} NO ENCONTRADO`};
    return usuario;
}

//Actualizar usuario completo (PUT)
async function actualizarUsuarioService(idUsuario, nuevosDatos){
    const idAirtable = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if(!idAirtable){
        return {error: `Ùsuario con ID ${idUsuario} no encontrado`};
    }

    const resultado = await actualizarUsuario(idAirtable, nuevosDatos);
    return { message: `Usuario actualizado correctamente`, data: resultado};
}

// Editar usuario parcialmente (PATCH)
async function editarUsuarioService(idUsuario, cambios){
    const idAirtableUsuario = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if(!idAirtableUsuario){
        return {error: `Usuario con ID ${idUsuario} NO ENCONTRADO`};
    }
    const resultado = await editarUsuario(idAirtableUsuario, cambios);
    return {message: `Usuario actualizado correctamente,`, data: resultado};
}

//Eliminar Usuario 
async function eliminarUsuarioService(idUsuario){
    const idUsuarioAirtable = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if(!idUsuarioAirtable){
        return {error: `Usuario de ID ${idUsuario} NO ENCONTRADO`};
    }

    const resultado = await eliminarUsuario(idUsuarioAirtable);
    return { message: `Usuario de ID ${idUsuario} eliminado`, data: resultado};
}

//Validar si el usuario es admin 
async function validarAdmin(idUsuario){
    const usuarioAdmin = await obtenerUsuarioById(idUsuario);
    if(!usuarioAdmin){
        return { error:`Usuario con ID ${idUsuario} NO ENCONTRADO`};
    }
    return usuario?.fields?.estadoAdmin === true;
}

async function setUsuarioAdmin(idUsuario, estado){
    const idAirtable = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if(!idAirtable){
            return { error: `Usuario con ID ${idUsuario} no encontrado` };
    }
    const resultado = await editarUsuario(idAirtable, {
        estadoAdmin : estado
    });
    return {
        message: `Usuario ${estado ? 'promovido a' : 'removido de'} admin`,
        data : resultado
    }
};

async function setUsuarioPremium(idUsuario, estado){
    const idAirtable = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if(!idAirtable){
                    return { error: `Usuario con ID ${idUsuario} no encontrado` };
    }
    const resultado = await editarUsuario(idAirtable, {
        usuarioPremium : estado
    });
    return {
        message:`Usuario de ID ${idUsuario} ${estado? 'tiene cuenta PREMIUM' : 'tiene cuenta REGULAR'}`,
        data : resultado
    }
}

