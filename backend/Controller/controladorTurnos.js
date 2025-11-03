//Controlador de turnos 
const {
    obtenerTurnos,
    crearTurno,
    actualizarTurno,
    editarTurno,
    eliminarTurno,
    obtenerTurnoById,
    obtenerIdAirtablePorIdTurno,
} = require('../MODEL/DAO-Repository/airtableRepositoryTurnos');


function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        })
        req.on('error', reject);
    });
}

//Desestructuro el ID de el endpoint de la peticion para los metodos 
function getIdFromUrl(url) {
    const urlParts = url.split('/');
    const id = urlParts[urlParts.length - 1];
    return id;
}

async function manejarSolicitudesTurnos(req, res) {
    const { method, url } = req; //Desestructuro method y la url de la request del front-end, o sea, el endpoint y el verbo HTTP

    //CORS, ya lo tengo en el server, pero por las dudas. Habilita a entidades de dominio diferente al del backend a usar la API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST, PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    //OPTIONS DEVUELVE LOS METODOS HTTP QUE LE ESTAN PERMITIDOS AL FRONT-END
    if (method === 'OPTIONS') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Metodos permitidos: GET, POST, PUT, PATCH, DELETE' }));
        return;
    }

    try {
        switch (method) {
            //METODO GET
            case 'GET':
                {

                    const cleanUrl = req.url.split('?')[0].replace(/\/$/, '');
                    const idTurnoEspecifico = getIdFromUrl(cleanUrl);
                    //Si no hay ID o la URL termina en /turnos, devuelvo todos
                    if (cleanUrl === '/turnos' || !idTurnoEspecifico || idTurnoEspecifico === 'turnos') {
                        const turnos = await obtenerTurnos();
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(turnos));
                        return;
                    }
                    //Si hay ID, busco ese turno 
                    const resultado = await obtenerTurnoById(idTurnoEspecifico);
                    if (!resultado) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: `Turno con ID ${idTurnoEspecifico} NO ENCONTRADO` }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }
            //METODO POST 
            case 'POST':
                {
                    const nuevoTurno = await getRequestBody(req);
                    const resultado = await crearTurno(nuevoTurno);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    console.log(`Turno creado!!${JSON.stringify(resultado)}`);
                    break;
                }
            //METODO PUT 
            case 'PUT':
                {
                    const idPUT = getIdFromUrl(url);
                    const idAirtablePUT = await obtenerIdAirtablePorIdTurno(idPUT);
                    if (!idAirtablePUT) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: `PUT METHOD. Turno con ID ${idPUT} NO ENCOTRADO` }))
                        return;
                    }
                    const nuevoTurno = await getRequestBody(req);
                    const resultado = await actualizarTurno(idAirtablePUT, nuevoTurno);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    console.log(`Turno ${idPUT} actualizado`);
                    break;
                }
            //METODO PATCH
            case 'PATCH':
                {
                    const idPATCH = getIdFromUrl(url);
                    const idAirtablePATCH = await obtenerIdAirtablePorIdTurno(idPATCH)
                    if (!idAirtablePATCH) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: `PATCH METHOD.Turno con ID ${idPATCH} NO ENCOTRADO` }))
                        return;
                    }
                    const cambios = await getRequestBody(req);
                    const resultado = await editarTurno(idAirtablePATCH, cambios);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    console.log(`Turno ${idPATCH} editado parcialmente`);

                    break;
                }
            //METODO DELETE
            case 'DELETE':
                {
                    const idDELETE = getIdFromUrl(url);
                    const idAirtableDELETE = await obtenerIdAirtablePorIdTurno(idDELETE);
                    if (!idAirtableDELETE) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: `DELETE METHOD.Turno con ID ${idDELETE} NO ENCOTRADO` }))
                        return;
                    }
                    const resultado = await eliminarTurno(idAirtableDELETE);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    console.log(`Turno ${idDELETE} eliminado`);

                    break;
                }
            //METODO POR DEFAULT DEVUELVE CODIGO 405
            default:
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Metodo no permitido' }));
        }
    } catch (err) {
        console.error("Error en manejarSolicituesTurnos method" + err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error interno del servidor', detalle: err.message }));
    }
}

module.exports = { manejarSolicitudesTurnos };