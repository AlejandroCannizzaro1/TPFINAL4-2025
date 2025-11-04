//  turnosService.js
const {
    obtenerTurnos,
    crearTurno,
    actualizarTurno,
    editarTurno,
    eliminarTurno,
    obtenerTurnoById,
    obtenerTurnoByIdAirtable,
    obtenerIdAirtablePorIdTurno
} = require('../DAO-Repository/airtableRepositoryTurnos');

const { obtenerUsuarioByIdAirtable } = require('../DAO-Repository/airtableRepositoryUsuarios');
const { validarAdmin } = require('../Service-LogicaDeNegocios/usuarioService');
const { Turno } = require('../Entitites/FullEntities/turno');


//Obtener proximo id de Turnos de Airtable 
async function obtenerProximoIdTurno() {
    const turnos = await obtenerTurnos();
    if (!turnos.length) return 1;

    const ids = turnos
        .map(user => user.fields.idTurno)
        .filter(id => !isNaN(id))
        .map(number);


    const maxId = Math.max(...ids);
    return maxId + 1;
}
//  Obtener todos los turnos
async function getTurnosService() {
    return await obtenerTurnos();
}

//  Obtener un turno por su ID normal
async function getTurnoByIdService(idTurno) {
    const turno = await obtenerTurnoById(idTurno);
    if (!turno) throw new Error(`No se encontró el turno con ID ${idTurno}`);
    return turno;
}

//  Crear un nuevo turno by el admin 
async function crearTurnoService(idUsuarioAdmin, fecha, hora, tipoServicio = '', notas = '') {
    //Validar que sea admin 
    const adminValido = await validarAdmin(idUsuarioAdmin);
    if (!adminValido) {
        return { error: 'No tenés permisos para crear turnos (solo admin)' };
    }

    //Validar datos basicos 
    if (!fecha || hora) {
        return { error: 'Faltan datos obligatorios: fecha u hora' };
    }

    const nuevoId = await obtenerProximoIdTurno();
    const nuevoTurno = new Turno(fecha, hora, tipoServicio, notas);

    //Adaptar para Airtable
    const turnoAirtable = {
        idTurno: nuevoId,
        fecha: new Date(nuevoTurno.getFecha).toISOString(),
        tipoServicio: nuevoTurno.getTipoServicio,
        notas: nuevoTurno.getNotas,
        turnoDisponible: nuevoTurno.getTurnoDisponible,
        usuarioVinculado: null
    }

    const resultado = await crearTurno(turnoAirtable);

    return {
        message: `Turno creado correctamente. (ID ${nuevoTurno.getIdTurno})`,
        data: resultado
    };
}

//  Reservar un turno
async function reservarTurnoService(idTurno, idUsuario) {
    const idAirtableTurno = await obtenerIdAirtablePorIdTurno(idTurno);
    if (!idAirtableTurno) throw new Error(`No se encontró el turno ${idTurno}`);

    const turno = await obtenerTurnoByIdAirtable(idAirtableTurno);
    if (!turno.fields.turnoDisponible) {
        throw new Error(`El turno ${idTurno} ya está reservado`);
    }

    const idAirtableUsuario = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if (!idAirtableUsuario) throw new Error(`No se encontró el usuario ${idUsuario}`);

    const nuevosDatos = {
        turnoDisponible: false,
        idCliente: idUsuario
    };

    return await editarTurno(idAirtableTurno, nuevosDatos);
}

//  Cancelar una reserva
async function cancelarReservaService(idTurno, idUsuario) {
    const idAirtableTurno = await obtenerIdAirtablePorIdTurno(idTurno);
    if (!idAirtableTurno) throw new Error(`No se encontró el turno ${idTurno}`);

    const turno = await obtenerTurnoByIdAirtable(idAirtableTurno);

    if (turno.fields.idCliente !== idUsuario) {
        throw new Error(`El turno ${idTurno} no pertenece al usuario ${idUsuario}`);
    }

    const nuevosDatos = {
        turnoDisponible: true,
        idCliente: null
    };

    return await editarTurno(idAirtableTurno, nuevosDatos);
}

//  Limpiar turnos pasados (por ejemplo, llamados por un admin)
async function limpiarTurnosPasadosService(fechaActual, idUsuarioAdmin) {
    const usuarioAdmin = await obtenerUsuarioByIdAirtable(idUsuarioAdmin);
    if (!usuarioAdmin.fields.estadoAdmin) {
        throw new Error('No tienes permisos de administrador para realizar esta acción');
    }

    const turnos = await obtenerTurnos();
    const pasados = turnos.filter(t => new Date(t.fields.fecha) < new Date(fechaActual));

    const eliminados = [];
    for (const turno of pasados) {
        await eliminarTurno(turno.id);
        eliminados.push(turno.fields.idTurno);
    }

    return { eliminados };
}

// Eliminar un turno (solo admin)
async function eliminarTurnoByAdminService(idTurno, idUsuarioAdmin) {
    const usuarioAdmin = await obtenerUsuarioByIdAirtable(idUsuarioAdmin);
    if (!usuarioAdmin.fields.estadoAdmin) {
        throw new Error('No tienes permisos de administrador para eliminar turnos');
    }

    const idAirtableTurno = await obtenerIdAirtablePorIdTurno(idTurno);
    if (!idAirtableTurno) throw new Error(`No se encontró el turno ${idTurno}`);

    return await eliminarTurno(idAirtableTurno);
}

module.exports = {
    getTurnosService,
    getTurnoByIdService,
    crearTurnoService,
    reservarTurnoService,
    cancelarReservaService,
    limpiarTurnosPasadosService,
    eliminarTurnoByAdminService, 
};
