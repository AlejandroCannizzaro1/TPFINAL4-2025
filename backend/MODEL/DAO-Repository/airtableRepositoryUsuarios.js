//Repositorio para la tabla Turnos

require('dotenv').config(); //Importo libreria dotenv y y config lee el archivo

//URL base de Airtable (uso variables de entorno del .env)
const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_USUARIOS}`;
const HEADERS = {
    'Authorization':`Bearer ${process.env.AIRTABLE_TOKEN}`,
    'Content-Type':'application/json'
};

//Obtener todos los usuarios 
async function obtenerUsuarios(){
    const res = await fetch(AIRTABLE_BASE_URL, {headers: HEADERS});
   
   if(!res.ok){
    throw new Error(`Error al obtener usuarios. Status:${res.status}`);
   }

    const data = await res.json();
    return data.records || [];
}
//Obtener un Usuario By ID
async function obtenerUsuarioById(idUsuario){
    const res = await fetch(`${AIRTABLE_BASE_URL}/?${idUsuario}`,{
        method:'GET',
        headers:HEADERS
    });
    if(!res.ok) throw new Error(`Error al obtener usuario mediante ID:${idUsuario}:${res.status}`);
    const data = await res.json();
    return data;
}


//Crear un usuario 
async function crearUsuario(usuario){
    const res = await fetch(AIRTABLE_BASE_URL, {
        method:'POST',
        headers:HEADERS,
        body: JSON.stringify({ fields:usuario })
    });

 if(!res.ok){
    throw new Error(`Error al crear usuario. Status:${res.status}`);
   }

    const data = await res.json();
    return data;
}

//Actualizar usuario (PUT)
async function actualizarUsuario(idPUT, nuevosDatos){
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idPUT}`,{
        method:'PUT',
        headers:HEADERS, 
        body : JSON.stringify({ fields:nuevosDatos })
    });

     if(!res.ok){
    throw new Error(`Error al ACTUALIZAR,con metodo PUT, usuario de ID:${idPUT}. Status:${res.status}`);
   }

    return res.json();
}

//Actualizar o editar usuario parcialmente (PATCH)
async function editarUsuario(idPATCH, cambiosParciales){
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idPATCH}`, 
        {
            method:'PATCH',
            headers: HEADERS,
            body: JSON.stringify({fields: cambiosParciales})
        });

if(!res.ok){
    throw new Error(`Error al EDITAR usuario, con metodo PATCH, de ID:${idPATCH} con metodo PATCH. Status:${res.status}`);
   }

        return res.json();
}

//Eliminar un usuario 
async function eliminarUsuario(idDELETE){
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idDELETE}`, 
        {
            method:'DELETE',
            headers:HEADERS,
        });
        if(!res.ok){
    throw new Error(`Error al ELIMINAR usuario de ID:${idDELETE} con metodo DELETE. Status:${res.status}`);
   }
        return res.json();
}

//Nuevas Funciones 

async function obtenerIdAirtablePorIdUsuario(idUsuario){
  const formula = `filterByFormula=${encodeURIComponent(`{idUsuario}=${idUsuario}`)}`;

  const res = await fetch(`${AIRTABLE_BASE_URL}?${formula}`, {
    method:'GET',
    headers:HEADERS,
  })
  if(!res.ok) throw new Error(`Error al obtener el id Interno de airtable mediante el id de usuario:${idUsuario}: ${res.status}`);

  const data = await res.json();
  return data.records.length > 0 ? data.records[0].id : null;
}


//Exportar funciones del repositorio

module.exports = {
    obtenerUsuarios, 
    crearUsuario,
    actualizarUsuario,
    editarUsuario,
    eliminarUsuario,
    obtenerUsuarioById,
    obtenerIdAirtablePorIdUsuario,
    
}