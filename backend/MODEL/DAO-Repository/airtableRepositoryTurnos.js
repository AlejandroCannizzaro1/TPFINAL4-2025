require('dotenv').config();

const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_TURNOS}`;
const HEADERS = {
  'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
  'Content-Type': 'application/json'
};

//  Obtener todos los turnos
async function obtenerTurnos() {
  const res = await fetch(AIRTABLE_BASE_URL, { headers: HEADERS });
  if (!res.ok) throw new Error(`Error al obtener turnos: ${res.status}`);
  const data = await res.json();
  return data.records || [];
}

//  Obtener turno por ID NORMAL
async function obtenerTurnoByIdNormal(idTurno) {
  const formula = `filterByFormula=${encodeURIComponent(`{idTurno}=${idTurno}`)}`;
  const res = await fetch(`${AIRTABLE_BASE_URL}?${formula}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Error buscando turno ${idTurno}: ${res.status}`);
  const data = await res.json();
  return data.records.length > 0 ? data.records[0] : null; // 🔁 devuelve null si no se encuentra
}

//  Obtener ID interno de Airtable a partir del idTurno NORMAL
async function obtenerIdAirtablePorIdTurno(idTurno) {
  const formula = `filterByFormula=${encodeURIComponent(`{idTurno}=${idTurno}`)}`;
  const res = await fetch(`${AIRTABLE_BASE_URL}?${formula}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Error buscando ID interno para turno ${idTurno}: ${res.status}`);
  const data = await res.json();
  return data.records.length > 0 ? data.records[0].id : null;
}

//  Obtener turno por ID INTERNO (Airtable)
async function obtenerTurnoByIdAirtable(idAirtableTurno) {
  const res = await fetch(`${AIRTABLE_BASE_URL}/${idAirtableTurno}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Error buscando turno (ID interno) ${idAirtableTurno}: ${res.status}`);
  return res.json();
}

//  Crear turno
async function crearTurno(nuevoTurno) {
  const res = await fetch(AIRTABLE_BASE_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ fields: nuevoTurno })
  });
  if (!res.ok) throw new Error(`Error creando turno: ${res.status}`);
  return res.json();
}

//  Actualizar turno (PUT)
async function actualizarTurno(idPUT, nuevosDatos) {
  const res = await fetch(`${AIRTABLE_BASE_URL}/${idPUT}`, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ fields: nuevosDatos })
  });
  if (!res.ok) throw new Error(`Error actualizando turno ${idPUT}: ${res.status}`);
  return res.json();
}

//  Editar turno parcialmente (PATCH)
async function editarTurno(idPATCH, datosParciales) {
  const res = await fetch(`${AIRTABLE_BASE_URL}/${idPATCH}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ fields: datosParciales })
  });
  if (!res.ok) throw new Error(`Error editando turno ${idPATCH}: ${res.status}`);
  return res.json();
}

//  Eliminar turno
async function eliminarTurno(idDELETE) {
  const res = await fetch(`${AIRTABLE_BASE_URL}/${idDELETE}`, {
    method: 'DELETE',
    headers: HEADERS
  });
  if (!res.ok) throw new Error(`Error eliminando turno ${idDELETE}: ${res.status}`);
  return res.json();
}

//  Exportar funciones del repositorio
module.exports = {
  obtenerTurnos,
  crearTurno,
  actualizarTurno,
  editarTurno,
  eliminarTurno,
  obtenerTurnoById: obtenerTurnoByIdNormal,
  obtenerTurnoByIdAirtable,
  obtenerIdAirtablePorIdTurno
};