require('dotenv').config();
const { mapearTurno } = require('../Mappers/turnoMapper');

const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_TURNOS}`;
const HEADERS = {
    'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
};

//  Obtener todos los turnos
async function obtenerTurnos() {
    const res = await fetch(AIRTABLE_BASE_URL, { headers: HEADERS });
    const data = await res.json();
    return data.records || [];
}

//Obtener los turnos disponibles 
async function obtenerTurnosDisponibles() {
    const turnosRaw = await obtenerTurnos();

    const turnosMapeados = await Promise.all(
        turnosRaw.map(t => mapearTurno(t))
    );
    return turnosMapeados.filter(t => t.turnoDisponible === true);
}
//  Obtener turno por ID NORMAL
async function obtenerTurnoByIdNormal(idTurno) {
    const formula = `filterByFormula=${encodeURIComponent(`{idTurno}=${idTurno}`)}`;
    const res = await fetch(`${AIRTABLE_BASE_URL}?${formula}`, { headers: HEADERS });
    const data = await res.json();
    return data.records.length > 0 ? data.records[0] : null; //  devuelve null si no se encuentra
}

//  Obtener ID interno de Airtable a partir del idTurno NORMAL
async function obtenerIdAirtablePorIdTurno(idTurno) {
    // Si es numérico, usa comparación directa; si es string, comillas
    const condicion =
        typeof idTurno === "number"
            ? `{idTurno}=${idTurno}`
            : `{idTurno}='${idTurno}'`;

    const formula = `filterByFormula=${encodeURIComponent(condicion)}`;
    const res = await fetch(`${AIRTABLE_BASE_URL}?${formula}`, { headers: HEADERS });

    const data = await res.json();
    return data.records.length > 0 ? data.records[0].id : null;
}

//  Obtener turno por ID INTERNO (Airtable)
async function obtenerTurnoByIdAirtable(idAirtableTurno) {
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idAirtableTurno}`, { headers: HEADERS });
    return res.json();
}

//  Crear turno
async function crearTurno(nuevoTurno) {
    const res = await fetch(AIRTABLE_BASE_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ fields: nuevoTurno })
    });
    return res.json();
}

//  Actualizar turno (PUT)
async function actualizarTurno(idPUT, nuevosDatos) {
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idPUT}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify({ fields: nuevosDatos })
    });
    return res.json();
}

//  Editar turno parcialmente (PATCH)
async function editarTurno(idPATCH, datosParciales) {
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idPATCH}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ fields: datosParciales })
    });
    return res.json();
}

//  Eliminar turno
async function eliminarTurno(idDELETE) {
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idDELETE}`, {
        method: 'DELETE',
        headers: HEADERS
    });
    return res.json();
}

//Obtener todos los turnos de un usuario especifico
async function obtenerTurnosPorUsuarioAirtable(idAirtableUsuario) {
  // Traemos todos los turnos
  const turnos = await obtenerTurnos();

  // Filtramos manualmente los que tengan el usuario vinculado
  const turnosFiltrados = turnos.filter(t =>
    Array.isArray(t.fields.idUsuarioVinculado) &&
    t.fields.idUsuarioVinculado.includes(idAirtableUsuario)
  );

  return turnosFiltrados;
}






/*El parámetro filterByFormula te permite filtrar registros según una fórmula de Airtable.
Por ejemplo:
filterByFormula=FIND('123', {idUsuarioVinculado})*/


//  Exportar funciones del repositorio
module.exports = {
    obtenerTurnos,
    crearTurno,
    actualizarTurno,
    editarTurno,
    eliminarTurno,
    obtenerTurnoByIdNormal,
    obtenerTurnoByIdAirtable,
    obtenerIdAirtablePorIdTurno,
    obtenerTurnosPorUsuarioAirtable,
    obtenerTurnosDisponibles
};
