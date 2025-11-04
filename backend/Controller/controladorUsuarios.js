// ==================== IMPORTS ====================
const {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    editarUsuario,
    eliminarUsuario,
    obtenerUsuarioById,
    obtenerIdAirtablePorIdUsuario
} = require('../MODEL/DAO-Repository/airtableRepositoryUsuarios');

const {
    setUsuarioAdmin,
    setUsuarioPremium,
    validarAdmin,
    eliminarUsuarioService,
    actualizarUsuarioService,
    editarUsuarioService,
    obtenerUsuarioService,
    buscarUsuarioPorEmail,
    buscarUsuarioPorNombreUsuario
} = require('../MODEL/Service-LogicaDeNegocios/usuarioService');

// ==================== AUXILIARES ====================
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
        });
        req.on('error', reject);
    });
}

function getIdFromUrl(url) {
    try {
        const decoded = decodeURIComponent(url).trim();
        const parts = decoded.split('/').filter(Boolean);

        // Tomar último fragmento
        const id = parts[parts.length - 1];

        // Si termina en "usuarios", no hay ID
        if (!id || id.toLowerCase().startsWith('usuarios')) return null;

        // Eliminar posibles saltos de línea o espacios
        return id.replace(/\s+/g, '').replace(/\n/g, '');
    } catch {
        return null;
    }
}

// ==================== MAIN CONTROLLER ====================
async function manejarSolicitudesUsuarios(req, res) {
    const { method } = req;
    console.log('--- manejarSolicitudesUsuarios START ---');
    console.log('Request method:', method);
    console.log('Raw url:', req.url);
    const cleanUrl = req.url.split('?')[0].replace(/\/$/, '');
    console.log('cleanUrl:', cleanUrl);

    const idUsuario = getIdFromUrl(cleanUrl);
    console.log('parsed idUsuario:', idUsuario);


    // --- CORS ---
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Métodos permitidos: GET, POST, PUT, PATCH, DELETE' }));
        return;
    }
    try {
        switch (method) {
            // ==================== GET ====================
            case 'GET': {
                if (cleanUrl === '/usuarios' || !idUsuario || idUsuario === 'usuarios') {
                    const usuarios = await obtenerUsuarios();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(usuarios));
                    break;
                }

                const usuario = await obtenerUsuarioService(idUsuario);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(usuario));
                break;
            }

            // ==================== POST ====================
            case 'POST': {
                const body = await getRequestBody(req);

                // --- Subrutas de creación/acción ---
                if (cleanUrl.includes('/admin')) {
                    const { datosUsuario, idAdmin } = body;
                    const resultado = await crearUsuarioService(datosUsuario, idAdmin);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                if (cleanUrl.includes('/ascender')) {
                    const { idUsuarioAdmin } = body;
                    const resultado = await setUsuarioAdmin(idUsuario, idUsuarioAdmin);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                if (cleanUrl.includes('/premium')) {
                    const { idUsuarioAdmin } = body;
                    const resultado = await asignarPremiumService(idUsuario, booleano);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                if (cleanUrl.includes('/limpiar')) {
                    const { idUsuarioAdmin } = body;
                    const resultado = await limpiarUsuariosInactivosService(idUsuarioAdmin);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                // Crear usuario normal
                const resultado = await crearUsuarioService(body);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== PUT ====================
            case 'PUT': {
                console.log("ID RECIBIDO : " + idUsuario);

                const nuevosDatos = await getRequestBody(req);
                const resultado = await actualizarUsuarioService(idUsuario, nuevosDatos);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== PATCH ====================
            case 'PATCH': {

                const cambios = await getRequestBody(req);
                const resultado = await editarUsuarioService(idUsuario, cambios);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== DELETE ====================
            case 'DELETE': {
                const idAirtableDELETE = await obtenerIdAirtablePorIdUsuario(idUsuario);

                const body = await getRequestBody(req);
                const { idUsuarioAdmin } = body;

                const resultado = await eliminarUsuarioService(idUsuario, idUsuarioAdmin);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== DEFAULT ====================
            default: {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Método no permitido' }));
                break;
            }
        }
    } catch (err) {
        console.error('Error en manejarSolicitudesUsuarios:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error interno del servidor', detalle: err.message }));
    }
}

module.exports = { manejarSolicitudesUsuarios };
