require('dotenv').config();

const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_USUARIOS}`;
const HEADERS = {
    'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
};

//  Obtener todos los usuarios
async function obtenerUsuarios() {
    const res = await fetch(AIRTABLE_BASE_URL, { headers: HEADERS });
    const data = await res.json();
    return data.records || [];
}

// Obtener ID interno de Airtable a partir del idUsuario NORMAL
async function obtenerIdAirtablePorIdUsuario(idUsuario) {
    console.log("ID RECIBIDO EN LA FUNCION obtenerIdAirtablePorIdUsuario " + idUsuario);

    if (!idUsuario) {
        throw new Error('El idUsuario recibido es null o undefined');
    }

    // Si es numérico, igual buscamos como texto también (por si Airtable lo almacena así)
    const formula = `filterByFormula=OR({idUsuario}='${idUsuario}', {idUsuario}=${idUsuario})`;

    const res = await fetch(`${AIRTABLE_BASE_URL}?${encodeURI(formula)}`, { headers: HEADERS });

    if (!res.ok) {
        throw new Error(`Error buscando ID interno para usuario ${idUsuario}: ${res.status}`);
    }

    const data = await res.json();

    if (!data.records || data.records.length === 0) {
        throw new Error(`No se encontró ningún registro con idUsuario = ${idUsuario}`);
    }

    return data.records[0].id; // ID interno tipo recXXXX
}

// Obtener usuario por ID NORMAL
async function obtenerUsuarioByIdNormal(idUsuario) {
    const formula = `filterByFormula=${encodeURIComponent(`{idUsuario}=${idUsuario}`)}`;
    const res = await fetch(`${AIRTABLE_BASE_URL}?${formula}`, { headers: HEADERS });
    const data = await res.json();
    return data.records.length > 0 ? data.records[0] : null; // 🔁 devuelve null si no hay resultados
}

// Obtener usuario por ID INTERNO de Airtable
async function obtenerUsuarioByIdAirtable(idAirtableUsuario) {
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idAirtableUsuario}`, { headers: HEADERS });
    return res.json();
}

// Crear usuario
async function crearUsuario(usuario) {
    const res = await fetch(AIRTABLE_BASE_URL, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({ fields: usuario })
    });
    return res.json();
}

// Actualizar usuario (PUT)
async function actualizarUsuario(idPUT, nuevosDatos) {
    console.log(" [Airtable PUT] id:", idPUT);
    console.log(" [Airtable PUT] Body enviado:", JSON.stringify({ fields: nuevosDatos }));

    const res = await fetch(`${AIRTABLE_BASE_URL}/${idPUT}`, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify({ fields: nuevosDatos })
    });
    return res.json();
}

//  Editar usuario parcialmente (PATCH)
async function editarUsuario(idPATCH, cambiosParciales) {
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idPATCH}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ fields: cambiosParciales })
    });
    return res.json();
}

//  Eliminar usuario
async function eliminarUsuario(idDELETE) {
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idDELETE}`, {
        method: 'DELETE',
        headers: HEADERS
    });
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