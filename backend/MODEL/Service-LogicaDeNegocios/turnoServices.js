//  turnosService.js
const {
    obtenerTurnos,
    crearTurno,
    actualizarTurno,
    editarTurno,
    eliminarTurno,
    obtenerTurnoByIdNormal,
    obtenerTurnoByIdAirtable,
    obtenerIdAirtablePorIdTurno,
    obtenerTurnosPorUsuarioAirtable,
    
} = require('../DAO-Repository/airtableRepositoryTurnos');

const { obtenerUsuarioByIdAirtable, obtenerIdAirtablePorIdUsuario } = require('../DAO-Repository/airtableRepositoryUsuarios');
const { validarAdminService } = require('../Service-LogicaDeNegocios/usuarioService');
const { Turno } = require('../Entitites/FullEntities/turno');
const { notificarReservaService, notificarCancelacionService } = require('./notificacionService');
const { mapearTurno } = require('../Mappers/turnoMapper');





let ultimoIdTurno = 0; // Variable en memoria para el último ID usado

async function obtenerProximoIdTurnoService() {
    if (ultimoIdTurno === 0) {
        const turnos = await obtenerTurnos();
        const ids = turnos
            .map(t => parseInt(t.fields.idTurno))
            .filter(id => !isNaN(id));

        ultimoIdTurno = ids.length > 0 ? Math.max(...ids) : 0;
    }
    ultimoIdTurno++;
    return ultimoIdTurno;
}
//  Obtener todos los turnos
async function getTurnosService() {
    const turnos = await obtenerTurnos();
    return turnos.map(mapearTurno);
}

//  Obtener un turno por su ID normal
async function getTurnoByIdService(idTurno) {
    const turno = await obtenerTurnoByIdNormal(idTurno);
    if (!turno) throw new Error(`No se encontró el turno con ID ${idTurno}`);
    return mapearTurno(turno);
}


//  Crear un nuevo turno by el admin 
async function crearTurnoService(idUsuarioAdmin, datosTurno) {
    // 1️ Validar que sea admin
    const adminValido = await validarAdminService(idUsuarioAdmin);
    if (!adminValido) {
        throw new Error('No tenés permisos para crear turnos (solo admin)');
    }

    const { fecha, hora, tipoServicio = '', notas = '' } = datosTurno;

    // 2️ Validar campos obligatorios
    if (!fecha || !hora) {
        throw new Error('Faltan datos obligatorios: fecha y hora');
    }

    // 3️ Validar formato de hora
    if (!validarHoraService(hora)) {
        throw new Error('Formato de hora inválido. Usa HH:MM (00:00 a 23:59)');
    }

    // 4️ Validar fecha
    if (!validarFechaService(fecha)) {
        throw new Error('Fecha inválida');
    }

    // 5️-a Evitar duplicados
    const existeTurno = await esTurnoDuplicado(fecha, hora);
    if (existeTurno) {
        throw new Error(`Ya existe un turno en la fecha ${fecha} a la hora ${hora}`);
    }

    // 6 Nueva validación para evitar turnos con menos de 1 hora de diferencia
    //compara contra todos los turnos del día, y determina si cualquiera está a menos de 59 minutos
    const conflicto = await hayConflictoDeHorario(fecha, hora);
    if (conflicto) {
        throw new Error(`No se puede crear el turno. Debe haber al menos 1 hora entre turnos en la misma fecha.`);
    }

    // 7 Generar ID
    const nuevoId = await obtenerProximoIdTurnoService();

    // 7 Crear objeto del turno
    const fechaTurno = new Date(fecha);
    const nuevoTurno = {
        idTurno: nuevoId,
        fecha: fechaTurno.toISOString().split('T')[0],
        hora,
        tipoServicio,
        notas,
        turnoDisponible: true,
        idUsuarioVinculado: []
    };

    // 9 Guardar en Airtable
    const resultado = await crearTurno(nuevoTurno);

    if (resultado.error) {
        throw new Error(`Error creando turno: ${resultado.error.message}`);
    }

    return {
        message: `Turno creado correctamente (ID ${nuevoId})`,
        data: resultado
    };
}

// Modificar un turno (solo admin), si es que el turno no esta reservado, es decir, estadoDisponible === true
async function editarTurnoByAdminService(idTurno, idUsuarioAdmin, cambios) {

    // 1) Validar admin
    const adminValido = await validarAdminService(idUsuarioAdmin);
    if (!adminValido) {
        throw new Error('No tenés permisos para modificar turnos (solo admin)');
    }

    // 2) Buscar el turno para saber si está reservado
    const turno = await obtenerTurnoByIdNormal(idTurno);
    if (!turno) {
        throw new Error(`No se encontró el turno con ID ${idTurno}`);
    }

    // Si tiene un usuario vinculado, está reservado
    const turnoReservado = Array.isArray(turno.fields.idUsuarioVinculado)
        && turno.fields.idUsuarioVinculado.length > 0;

    if (turnoReservado) {
        if (cambios.fecha !== undefined || cambios.hora !== undefined) {
            throw new Error("No podés modificar fecha u hora de un turno ya reservado. Debés cancelarlo o reprogramarlo.");
        }
    }

    // 4) Obtener ID interno de Airtable
    const idAirtableTurno = await obtenerIdAirtablePorIdTurno(idTurno);
    if (!idAirtableTurno) {
        throw new Error(`No se encontró ID interno de Airtable para turno ${idTurno}`);
    }

    // 5) Filtrar campos permitidos
    const camposPermitidos = ["fecha", "hora", "tipoServicio", "notas"];

    const datosFiltrados = {};
    for (const campo of camposPermitidos) {
        if (cambios[campo] !== undefined && cambios[campo] !== null) {
            datosFiltrados[campo] = cambios[campo];
        }
    }

    if (Object.keys(datosFiltrados).length === 0) {
        throw new Error("No se proporcionaron campos válidos para modificar.");
    }

    // 6) Ejecutar PATCH en Airtable
    const resultado = await editarTurno(idAirtableTurno, datosFiltrados);

    if (resultado.error) {
        throw new Error(`Error editando turno: ${resultado.error.message}`);
    }

    return {
        message: `Turno ${idTurno} modificado correctamente`,
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

    // luego de editarTurno()
    const turnoActualizado = await obtenerTurnoByIdAirtable(idAirtableTurno);
    console.log('Turno después de reservar:', JSON.stringify(turnoActualizado.fields.idUsuarioVinculado));


    // 6️ Manejar error de Airtable
    if (resultado.error) {
        console.error(" Error en Airtable:", resultado.error);
        throw new Error(`Error editando turno ${idAirtableTurno}: ${resultado.error.message}`);
    }

    // 7) Notificar a usuario y admins
    await notificarReservaService(idAirtableTurno, idAirtableUsuario);

    console.log(" Turno reservado correctamente:", resultado);
    return {
        message: `Turno ${idTurno} reservado correctamente`,
        data: resultado
    };
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

    //  ACA es donde corregimos: Se notifica al usuario y al Admin 
    await notificarCancelacionService(idAirtableTurno, idAirtableUsuario);

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
    // Primero, obtenemos el ID interno Airtable del usuario admin
    const idAirtableAdmin = await obtenerIdAirtablePorIdUsuario(idUsuarioAdmin);
    if (!idAirtableAdmin) throw new Error(`No se encontró ID interno Airtable para usuario admin ${idUsuarioAdmin}`);

    // Luego, obtenemos los datos del usuario admin con ese ID Airtable
    const usuarioAdmin = await obtenerUsuarioByIdAirtable(idAirtableAdmin);

    if (!usuarioAdmin) throw new Error(`No se encontró el usuario admin con ID interno ${idAirtableAdmin}`);
    if (!usuarioAdmin.fields) throw new Error(`El usuario admin con ID interno ${idAirtableAdmin} no tiene campos 'fields'`);

    if (!usuarioAdmin.fields.estadoAdmin) {
        throw new Error('No tienes permisos de administrador para eliminar turnos');
    }

    const idAirtableTurno = await obtenerIdAirtablePorIdTurno(idTurno);
    if (!idAirtableTurno) throw new Error(`No se encontró el turno ${idTurno}`);

    return await eliminarTurno(idAirtableTurno);
}

//Obtener todos los turnos de un usuario (por su ID normal)
async function obtenerTurnosPorUsuarioService(idUsuario) {
    console.log(`[obtenerTurnosPorUsuarioService] Buscando turnos del usuario ${idUsuario}`);

    //  Obtener ID interno Airtable del usuario
    const idAirtableUsuario = await obtenerIdAirtablePorIdUsuario(idUsuario);

    if (!idAirtableUsuario) {
        return {
            error: `No existe un usuario con el ID ${idUsuario}`
        };
    }

    //  Buscar turnos que tengan ese idUsuarioVinculado (usando el ID interno)
    const turnos = await obtenerTurnosPorUsuarioAirtable(idAirtableUsuario);
    console.log("ID interno Airtable usuario:", idAirtableUsuario);

    if (!turnos || turnos.length === 0) {
        return {
            idUsuario,
            turnos: [],
            mensaje: `El usuario con ID ${idUsuario} no tiene turnos asignados.`
        };
    }

    //  Mapear y devolver
    const resultado = turnos.map(t => ({
        idTurno: t.fields.idTurno,
        fecha: t.fields.fecha,
        hora: t.fields.hora,
        tipoServicio: t.fields.tipoServicio,
        notas: t.fields.notas,
    }));

    return {
        idUsuario,
        cantidad: resultado.length,
        turnos: resultado
    };
}





//Funciones Auxiliares
//Validar fecha 
function validarFechaService(fecha) {
    const fechaTurno = new Date(fecha);
    return !isNaN(fechaTurno.getTime());
}

//Validar hora 
function validarHoraService(hora) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora);
}

//Checkear si el turno esta duplicado 
async function esTurnoDuplicado(fecha, hora) {
    const turnos = await obtenerTurnos();
    return turnos.some(t => {
        const f = new Date(t.fields.fecha).toISOString().split('T')[0];
        const h = t.fields.hora;
        return f === fecha && h === hora;
    });
}

// Verificar que no haya otro turno dentro de 1 hora
async function hayConflictoDeHorario(fecha, hora) {
    const turnos = await obtenerTurnos();

    const nuevaHora = convertirHoraAMinutos(hora);

    return turnos.some(t => {
        const mismaFecha = new Date(t.fields.fecha).toISOString().split('T')[0] === fecha;
        if (!mismaFecha) return false;

        const horaExistente = convertirHoraAMinutos(t.fields.hora);
        const diferencia = Math.abs(nuevaHora - horaExistente);

        return diferencia < 60; // menos de 59 min → conflicto
    });
}

// Convierte HH:MM → minutos totales
function convertirHoraAMinutos(hora) {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

module.exports = {
    getTurnosService,
    getTurnoByIdService,
    crearTurnoService,
    reservarTurnoService,
    cancelarReservaService,
    limpiarTurnosPasadosService,
    eliminarTurnoByAdminService,
    obtenerTurnosPorUsuarioService,
    editarTurnoByAdminService
};

//Formato body para mandar a crearTurno :
//POST http://localhost:3001/turnos/admin
/* {
  "idAdmin": 1,
  "datosTurno": {
    "fecha": "2025-11-10",
    "hora": "15:30",
    "tipoServicio": "Corte de cabello",
    "notas": "Cliente nuevo"
  }
}*/
