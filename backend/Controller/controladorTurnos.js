//Controlador de turnos 
const {
    obtenerTurnos,
    crearTurno,
    actualizarTurno,
    editarTurno,
    eliminarTurno
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

function getIdFromUrl(url) {
    const urlParts = url.split('/');
    const id = urlParts[urlParts.length - 1];
    return id;
}

async function manejarSolicitudesTurnos(req, res) {
    const { method, url } = req;

    //CORS, ya lo tengo en el server, pero por las dudas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST, PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(200, { 'Content-Type':'application/json' });
        res.end(JSON.stringify({ message: 'Metodos permitidos: GET, POST, PUT, PATCH, DELETE' }));
        return;
    }

    try {
        switch (method) {
            case 'GET':
                {
                    const turnos = await obtenerTurnos();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(turnos));
                    break;
                }
            case 'POST':
                {
                    const nuevoTurno = await getRequestBody(req);
                    const resultado = await crearTurno(nuevoTurno);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }
            case 'PUT':
                {
                    const idPUT = getIdFromUrl(url);
                    const nuevoTurno = await getRequestBody(req);
                    const resultado = await actualizarTurno(idPUT, nuevoTurno);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }
            case 'PATCH':
                {
                    const idPATCH = getIdFromUrl(url);
                    const cambios = await getRequestBody(req);
                    const resultado = await editarTurno(idPATCH, cambios);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }
            case 'DELETE':
                {
                    const idDELETE = getIdFromUrl(url);
                    const resultado = await eliminarTurno(idDELETE);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }
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