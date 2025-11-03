 require ('dotenv').config(); //Importo libreria dotenv para y llamo a config para que lea las varianbles de entorno en .env 

const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_TURNOS}`;
 const HEADERS = {
    'Authorization':`Bearer ${process.env.AIRTABLE_TOKEN}`,
    'Content-Type':'application/json'
 };

 //Obtener todos los turnos 
 async function obtenerTurnos(){
    const res = await fetch(`${AIRTABLE_BASE_URL}`,{
        method:'GET',
        headers:HEADERS
    });

    if(!res.ok){
        throw new Error(`Error al obtener turnos${res.status}`);
    }

    const data = await res.json(); //ESTO DESCEREALIZA DE JSON A JAVASCRIPT OBJECT
    return data.records || [];
}
//Obtener un turno especifico 
//Obtener un trno completo por su ID de Airtable
async function obtenerTurnoById(idTurno){
const res = await fetch(`${AIRTABLE_BASE_URL}/${idTurno}`,
    {
        method:'GET',
        headers:HEADERS
    });
    if(!res.ok) throw new Error(`Error buscando turno con ID de DEVELOPER:${idTurno}:${res.status} `);
    const data = await res.json();
    return data;
}
//Crear un turno 
async function crearTurno(nuevoTurno){
    const res = await fetch(`${AIRTABLE_BASE_URL}`,{
        method:'POST',
        headers: HEADERS,
        body: JSON.stringify({fields: nuevoTurno})
    });

    if(!res.ok){
        throw new Error(`Error al crear turno:${res.status}`);
    }
    const data = await res.json(); //Esto contiene la rpta del servidor, la descerealiza de JSON a JS
    return data; //Aca se devuelve la info del servidor en formato JS
}

//Actualizar un turno (PUT)
async function actualizarTurno(idPUT, nuevosDatos){
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idPUT}`,{
        method:'PUT',
        headers:HEADERS,
        body: JSON.stringify({ fields: nuevosDatos})
    });

    if(!res.ok){
        throw new Error(`Error al actualizar turno de ID:${idPUT}, status error:${res.status}`);
    }

    const data = await res.json(); //Decerializa la rpta , de JSON  a JS
    return data;
}

//Actualizar parcialmente (PATCH)
async function editarTurno(idPATCH, datosParciales){
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idPATCH}`, {
        method:'PATCH',
        headers:HEADERS, 
        body: JSON.stringify({fields: datosParciales})
    });

    if(!res.ok){
        throw new Error(`Error al editar con metodo PATCH turno de ID:${idPATCH}, status:${res.status}`);
    }

    const data = await res.json();
    return data;
}

//Borrar turno 
async function eliminarTurno(idDELETE){
    const res = await fetch(`${AIRTABLE_BASE_URL}/${idDELETE}`,{
        method:'DELETE',
        headers:HEADERS,
    });

    if(!res.ok){
        throw new Error(`Error al eliminar turno de ID:${idDELETE}, status:${res.status}`);
    }

    const data = await res.json();
    return data;
}

//Nuevas funciones 

//Obtener el ID interno que genera airtable a partir de idTurno
async function obtenerIdAirtablePorIdTurno(idTurno) {
  const formula = `filterByFormula=${encodeURIComponent(`{idTurno}=${idTurno}`)}`;
    const res = await fetch(`${AIRTABLE_BASE_URL}?${formula}`,
    {
            method:'GET',
            headers:HEADERS
        });
        if(!res.ok){
            throw new Error(`Error buscando turno con ID NORMAL${idTurno}: ${res.status}`);
        };
        const data = await res.json(); //Decerealiza de JSON a JS
        return data.records.length > 0 ? data.records[0].id : null; //Si airtable devuelve al menos un registro, que devuelva el primer elemento de ese registro que es el ID interno de airtable
}



//Exportar funciones del repositorio  
module.exports = {
    obtenerTurnos,
    crearTurno,
    actualizarTurno,
    editarTurno,
    eliminarTurno,
     obtenerTurnoById,
    obtenerIdAirtablePorIdTurno,
    
}