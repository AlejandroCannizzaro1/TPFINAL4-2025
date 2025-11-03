
//Controlador de usuarios 
const {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    editarUsuario,
    eliminarUsuario,
    obtenerUsuarioById,
    obtenerIdAirtablePorIdUsuario,
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
                    const cleanUrl = req.url.split('?')[0].replace(/\/$/, ''); //Limpia la url de barras demas en turnos/ por ejemplo, capaz viene http://localhost:3001/turnos/ y me caga esa ultima barrita
                   /* "/turnos/5/".replace(/\/$/, '') -> "/turnos/5"(sin la barrita al final)          |         "/turnos/".replace(/\/$/, '') -> "/turnos" */
                    const idUsuarioEspecifico = getIdFromUrl(cleanUrl);
                    //Compruebo si la url venia con ID
                    if (cleanUrl === '/usuarios' || !idUsuarioEspecifico || idUsuarioEspecifico === 'usuarios') {
                        const usuarios = await obtenerUsuarios();
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(usuarios));
                        return;
                    }
                    const resultado = await obtenerUsuarioById(idUsuarioEspecifico);
                    if (!resultado) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: `obtenerUsuarioById METHOD ERROR.Usuario con ID ${idUsuarioEspecifico}` }))
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }
            case 'POST':
                {
                    const nuevoUsuario = await getRequestBody(req);
                    const resultado = await crearUsuario(nuevoUsuario);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    console.log(`Usuario creado!!${JSON.stringify(resultado)}`);
                    break;
                }
            case 'PUT': {
                const idPUT = getIdFromUrl(url);
                const idAirtablePUT = await obtenerIdAirtablePorIdUsuario(idPUT);
                if (!idAirtablePUT) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: `PUT METHOD.Usuario con ID ${idPUT} NO ENCOTRADO` }))
                    return;
                }
                const nuevosDatos = await getRequestBody(req);
                const resultado = await actualizarUsuario(idAirtablePUT, nuevosDatos);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado)); //Respuesta al FRONT-END
                console.log(`Usuario ${idPUT} actualizado`);
                break;
            }
            case 'PATCH': {
                const idPATCH = getIdFromUrl(url);
                const idAirtablePATCH = await obtenerIdAirtablePorIdUsuario(idPATCH);
                if (!idAirtablePATCH) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: `PATCH METHOD.Usuario con ID ${idPATCH} NO ENCOTRADO` }))
                    return;
                }
                const cambios = await getRequestBody(req);
                const resultado = await editarUsuario(idAirtablePATCH, cambios);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                console.log(`Usuario ${idPATCH} editado parcialmente`);
                break;
            }
            case 'DELETE':
                {
                    const idDELETE = getIdFromUrl(url);
                    const idAirtableDELETE = await obtenerIdAirtablePorIdUsuario(idDELETE);
                    if (!idAirtableDELETE) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: `DELETE METHOD.Usuario con ID ${idDELETE} NO ENCOTRADO` }))
                        return;
                    }
                    const resultado = await eliminarUsuario(idAirtableDELETE);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    console.log(`Usuario ${idDELETE} eliminado`);
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