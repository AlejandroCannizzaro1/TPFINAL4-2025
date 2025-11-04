//  turnosService.js
const {
    obtenerTurnos,
    crearTurno,
    actualizarTurno,
    editarTurno,
    eliminarTurno,
    obtenerTurnoById,
    obtenerTurnoByIdAirtable,
    obtenerIdAirtablePorIdTurno,
    obtenerTurnosPorUsuarioAirtable
} = require('../DAO-Repository/airtableRepositoryTurnos');

const { obtenerUsuarioByIdAirtable, obtenerIdAirtablePorIdUsuario } = require('../DAO-Repository/airtableRepositoryUsuarios');
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
  console.log(` Reservando turno ${idTurno} para usuario ${idUsuario}`);

  // 1️ Buscar ID interno del turno
  const idAirtableTurno = await obtenerIdAirtablePorIdTurno(idTurno);
  if (!idAirtableTurno) throw new Error(`No se encontró el turno ${idTurno}`);

  // 2️ Traer el turno actual para verificar disponibilidad
  const turno = await obtenerTurnoByIdAirtable(idAirtableTurno);
  if (!turno.fields.turnoDisponible) {
    throw new Error(`El turno ${idTurno} ya está reservado`);
  }

  // 3️ Buscar el record ID del usuario (interno de Airtable)
  const idAirtableUsuario = await obtenerIdAirtablePorIdUsuario(idUsuario);
  if (!idAirtableUsuario) throw new Error(`No se encontró el usuario ${idUsuario}`);

  // 4️ Armar los datos para actualizar el turno
  const nuevosDatos = {
    turnoDisponible: false,
    idUsuarioVinculado: [idAirtableUsuario], // relación directa con la tabla Usuarios
  };

  // 5️ Ejecutar PATCH en Airtable
  const resultado = await editarTurno(idAirtableTurno, nuevosDatos);

  // 6️ Manejar error de Airtable
  if (resultado.error) {
    console.error(" Error en Airtable:", resultado.error);
    throw new Error(`Error editando turno ${idAirtableTurno}: ${resultado.error.message}`);
  }

  console.log(" Turno reservado correctamente:", resultado);
  return resultado;
}

//Cancerlar Reserva 
async function cancelarReservaService(idTurno, idUsuario) {
  console.log(` Cancelando reserva del turno ${idTurno} para usuario ${idUsuario}`);

  // 1️ Buscar IDs internos
  const idAirtableTurno = await obtenerIdAirtablePorIdTurno(idTurno);
  const idAirtableUsuario = await obtenerIdAirtablePorIdUsuario(idUsuario);

  if (!idAirtableTurno) throw new Error(`No se encontró el turno ${idTurno}`);
  if (!idAirtableUsuario) throw new Error(`No se encontró el usuario ${idUsuario}`);

  // 2️ Traer el turno para verificar que le pertenece al usuario
  const turno = await obtenerTurnoByIdAirtable(idAirtableTurno);

  const usuarioActual = turno.fields.idUsuarioVinculado?.[0];
  if (usuarioActual !== idAirtableUsuario) {
    throw new Error(`El turno ${idTurno} no pertenece al usuario ${idUsuario}`);
  }

  // 3️ Liberar el turno
  const nuevosDatos = {
    turnoDisponible: true,
    idUsuarioVinculado: [], // se desasocia el usuario
  };

  // 4️ Ejecutar PATCH en Airtable
  const resultado = await editarTurno(idAirtableTurno, nuevosDatos);

  if (resultado.error) {
    console.error(" Error en Airtable:", resultado.error);
    throw new Error(`Error cancelando turno ${idAirtableTurno}: ${resultado.error.message}`);
  }

  console.log(" Reserva cancelada correctamente:", resultado);
  return resultado;
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

//Obtener todos los turnos de un usuario (por su ID normal)
async function obtenerTurnosPorUsuarioService(idUsuario){
    console.log(`[obtenerTurnosPorUsuarioService] Buscando turnos del usuario ${idUsuario}`);

    //Buscar el record ID interno de Airtable
    const idAirtableUsuario = await obtenerIdAirtablePorIdUsuario(idUsuario);
    if(!idAirtableUsuario){
        throw new Error (`NO se encontro el usuario de ID ${idUsuario}`);
    }
    //Obtener los turnos asociados a ese usuario 
    const turnos = await obtenerTurnosPorUsuarioAirtable(idAirtableUsuario);

    const resultado = turnos.map(turno =>({
        idTurno: t.fields.idTurno,
        fecha:t.fields.fecha,
        hora: t.fields.hora,
        tipoServicio : t.fields.tipoServicio,
        notas: t.fields.notas,
    }));

    console.log(`Usuario ${idUsuario} tiene ${resultado.length} turnos reservados`);
    return resultado;
}


module.exports = {
    getTurnosService,
    getTurnoByIdService,
    crearTurnoService,
    reservarTurnoService,
    cancelarReservaService,
    limpiarTurnosPasadosService,
    eliminarTurnoByAdminService,
    obtenerTurnosPorUsuarioService
};
