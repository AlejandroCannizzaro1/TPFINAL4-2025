require('dotenv').config();

const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_USUARIOS}`;
const HEADERS = {
  'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
  'Content-Type': 'application/json'
};

//  Obtener todos los usuarios
async function obtenerUsuarios() {
  const res = await fetch(AIRTABLE_BASE_URL, { headers: HEADERS });
  if (!res.ok) throw new Error(`Error al obtener usuarios: ${res.status}`);
  const data = await res.json();
  return data.records || [];
}

// Obtener ID interno de Airtable a partir del idUsuario NORMAL
async function obtenerIdAirtablePorIdUsuario(idUsuario) {
  const formula = `filterByFormula=${encodeURIComponent(`{idUsuario}=${idUsuario}`)}`;
  const res = await fetch(`${AIRTABLE_BASE_URL}?${formula}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Error buscando ID interno para usuario ${idUsuario}: ${res.status}`);
  const data = await res.json();
  return data.records.length > 0 ? data.records[0].id : null;
}

// Obtener usuario por ID NORMAL
async function obtenerUsuarioByIdNormal(idUsuario) {
  const formula = `filterByFormula=${encodeURIComponent(`{idUsuario}=${idUsuario}`)}`;
  const res = await fetch(`${AIRTABLE_BASE_URL}?${formula}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Error buscando usuario ${idUsuario}: ${res.status}`);
  const data = await res.json();
  return data.records.length > 0 ? data.records[0] : null; // 🔁 devuelve null si no hay resultados
}

// Obtener usuario por ID INTERNO de Airtable
async function obtenerUsuarioByIdAirtable(idAirtableUsuario) {
  const res = await fetch(`${AIRTABLE_BASE_URL}/${idAirtableUsuario}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Error buscando usuario (ID interno) ${idAirtableUsuario}: ${res.status}`);
  return res.json();
}

// Crear usuario
async function crearUsuario(usuario) {
  const res = await fetch(AIRTABLE_BASE_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ fields: usuario })
  });
  if (!res.ok) throw new Error(`Error creando usuario: ${res.status}`);
  return res.json();
}

// Actualizar usuario (PUT)
async function actualizarUsuario(idPUT, nuevosDatos) {
  const res = await fetch(`${AIRTABLE_BASE_URL}/${idPUT}`, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ fields: nuevosDatos })
  });
  if (!res.ok) throw new Error(`Error actualizando usuario ${idPUT}: ${res.status}`);
  return res.json();
}

//  Editar usuario parcialmente (PATCH)
async function editarUsuario(idPATCH, cambiosParciales) {
  const res = await fetch(`${AIRTABLE_BASE_URL}/${idPATCH}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ fields: cambiosParciales })
  });
  if (!res.ok) throw new Error(`Error editando usuario ${idPATCH}: ${res.status}`);
  return res.json();
}

//  Eliminar usuario
async function eliminarUsuario(idDELETE) {
  const res = await fetch(`${AIRTABLE_BASE_URL}/${idDELETE}`, {
    method: 'DELETE',
    headers: HEADERS
  });
  if (!res.ok) throw new Error(`Error eliminando usuario ${idDELETE}: ${res.status}`);
  return res.json();
}

//  Exportar funciones del repositorio
module.exports = {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  editarUsuario,
  eliminarUsuario,
  obtenerUsuarioById: obtenerUsuarioByIdNormal,
  obtenerUsuarioByIdAirtable,
  obtenerIdAirtablePorIdUsuario
};