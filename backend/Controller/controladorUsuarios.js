
//Controlador de usuarios 
const {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    editarUsuario,
    eliminarUsuario
} = require('../MODEL/DAO-Repository/airtableRepositoryUsuarios');

//Manejar todas las solicitudes relacionadas con los usuarios 

//Funcion auxiliar para leer el body y convertirlo a objeto 
function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {})
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

//Funcion auxiliar para obtener ID 
function getIdFromUrl(url) {
    const urlParts = url.split('/');
    const id = urlParts[urlParts.length - 1];
    return id;
}

async function manejarSolicitudesUsuarios(req, res) {
    const { method, url } = req; //Desestructuro request 

    //CORS, ya los tengo en el server pero por las dudas
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Metodos permitidos: GET, POST, PUT, PATCH, DELETE' }));
        return;
    }
    try {
        switch (method) {
            case 'GET':
                {
                    const usuarios = await obtenerUsuarios();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(usuarios));
                    break;
                }
            case 'POST':
                {
                    const nuevoUsuario = await getRequestBody(req);
                    const resultado = await crearUsuario(nuevoUsuario);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    console.log("Usuario creado!!!");
                    break;
                }
            case 'PUT': {
                const idPUT = getIdFromUrl(url);
                const nuevosDatos = await getRequestBody(req);
                const resultado = await actualizarUsuario(idPUT, nuevosDatos);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado)); //Respuesta al FRONT-END
                break;
            }
            case 'PATCH': {
                const idPATCH = getIdFromUrl(url);
                const cambios = await getRequestBody(req);
                const resultado = await editarUsuario(idPATCH, cambios);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }
            case 'DELETE':
                {
                    const idDELETE = getIdFromUrl(url);
                    const resultado = await eliminarUsuario(idDELETE);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }
            default: {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Metodo no permitido' }));
            }

        }
    } catch (err) {
        console.error("Error en manejarSolicitudesUsuarios method", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error interno del servidor', detalle: err.message }));
    }
}

module.exports = { manejarSolicitudesUsuarios };