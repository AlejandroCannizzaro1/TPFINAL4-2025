// ==================== IMPORTS ====================
const {
    obtenerUsuarios,
} = require('../MODEL/DAO-Repository/airtableRepositoryUsuarios');

const {
    setUsuarioAdminService,
    setUsuarioPremiumService,
    validarAdminService,
    eliminarUsuarioService,
    actualizarUsuarioService,
    editarUsuarioService,
    obtenerUsuarioService,
    buscarUsuarioPorEmailService,
    buscarUsuarioPorNombreUsuarioService,
    crearUsuarioService
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
        const id = parts[parts.length - 1];
        if (!id || id.toLowerCase().startsWith('usuarios')) return null;
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
                // Buscar todos los usuarios
                if (cleanUrl === '/usuarios' || !idUsuario || idUsuario === 'usuarios') {
                    const usuarios = await obtenerUsuarios();
                    if (!usuarios || usuarios.error) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: usuarios?.error || 'Error al obtener usuarios' }));
                        break;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(usuarios));
                    break;
                }

                // Buscar usuario por email: /usuarios/email?value=xxx
                // Ejemplo Endpoint:  http://localhost:3001/usuarios/email?value=ale@gmail.com
                if (cleanUrl.includes('/usuarios/email')) {
                    const urlParams = new URLSearchParams(req.url.split('?')[1]); //req.url es la URL completa que llega al servidor, por ejemplo: /usuarios/email?value=ale@gmail.com
                    // req.url.split('?') divide la URL en dos partes: ['/usuarios/email', 'value=ale@gmail.com']
                    const email = urlParams.get('value'); //Obtiene el value asociado a value, en este caso: "ale@gmail.com"
                    const usuario = await buscarUsuarioPorEmailService(email);

                    if (!usuario || usuario.error) {
                        const msg = usuario?.error || `No se encontró ningún usuario con email: ${email}`;
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: msg }));
                        break;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(usuario));
                    break;
                }

                // Buscar usuario por nombreUsuario: /usuarios/nombreUsuario?value=xxx
                // Ejemplo Endpoint:  http://localhost:3001/usuarios/nombreUsuario?value=Sauron
                if (cleanUrl.includes('/usuarios/nombreUsuario')) {
                    const urlParams = new URLSearchParams(req.url.split('?')[1]);
                    const nombreUsuario = urlParams.get('value'); //Esto lo seteo yo, el campo value en realidad. En este caso obtiene su value, pero lo hace parte de 
                    const usuario = await buscarUsuarioPorNombreUsuarioService(nombreUsuario);

                    if (!usuario || usuario.error) {
                        const msg = usuario?.error || `No se encontró ningún usuario con nombreUsuario: ${nombreUsuario}`;
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: msg }));
                        break;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(usuario));
                    break;
                }

                // Buscar usuario por ID
                const usuario = await obtenerUsuarioService(idUsuario);
                if (!usuario || usuario.error) {
                    const msg = usuario?.error || `Usuario con ID ${idUsuario} no encontrado`;
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: msg }));
                    break;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(usuario));
                break;
            }

            // ==================== POST ====================
            case 'POST': {
                const body = await getRequestBody(req);

                const resultado = await crearUsuarioService(body);
                const status = resultado?.error ? 400 : 201;

                res.writeHead(status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== PUT ====================
            case 'PUT': {
                const nuevosDatos = await getRequestBody(req);
                const resultado = await actualizarUsuarioService(idUsuario, nuevosDatos);
                const status = resultado?.error ? 400 : 200;
                res.writeHead(status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== PATCH ====================
            case 'PATCH': {
                // Primero detectamos si es un toggle de admin
                if (cleanUrl.includes('/estadoAdmin')) {
                    const resultado = await setUsuarioAdminService(idUsuario);
                    const status = resultado?.error ? 400 : 200;
                    res.writeHead(status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                // Luego, toggle de premium
                if (cleanUrl.includes('/estadoPremium')) {
                    const resultado = await setUsuarioPremium(idUsuario);
                    const status = resultado?.error ? 400 : 200;
                    res.writeHead(status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                // Si no es ninguno de los toggles, entonces es PATCH general
                const cambios = await getRequestBody(req);
                const resultado = await editarUsuarioService(idUsuario, cambios);
                const status = resultado?.error ? 400 : 200;
                res.writeHead(status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;

            }

            // ==================== DELETE ====================
            case 'DELETE': {
                const body = await getRequestBody(req);
                const { idUsuarioAdmin } = body;
                const resultado = await eliminarUsuarioService(idUsuario, idUsuarioAdmin);
                const status = resultado?.error ? 400 : 200;
                res.writeHead(status, { 'Content-Type': 'application/json' });
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
        console.error(' Error en manejarSolicitudesUsuarios:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Error interno del servidor',
            detalle: err.message
        }));
    }
}

module.exports = { manejarSolicitudesUsuarios };


/*
==================== ENDPOINTS DISPONIBLES ====================

GET (Obtener Usuarios)
--------------------------------------------------------------
1) Obtener todos los usuarios:
   GET http://localhost:3001/usuarios

2) Obtener usuario por ID:
   GET http://localhost:3001/usuarios/:idUsuario

3) Buscar usuario por email (query param ?value=):
   GET http://localhost:3001/usuarios/email?value=example@gmail.com

4) Buscar usuario por nombreUsuario:
   GET http://localhost:3001/usuarios/nombreUsuario?value=NombreEjemplo


POST (Crear Usuario)
--------------------------------------------------------------
5) Crear nuevo usuario (con body JSON):
   POST http://localhost:3001/usuarios
   Body ejemplo:
   {
     "nombreUsuario": "Sauron",
     "email": "sauron@mordor.com",
     "estadoAdmin": false
   }


PUT (Reemplazo total)
--------------------------------------------------------------
6) Actualizar completamente un usuario (sobrescribe campos):
   PUT http://localhost:3001/usuarios/:idUsuario
   Body: objeto completo a reemplazar


PATCH (Modificaciones parciales y toggles)
--------------------------------------------------------------
7) Editar parcialmente un usuario:
   PATCH http://localhost:3001/usuarios/:idUsuario
   Body ejemplo:
   {
     "nombreUsuario": "NuevoNombre"
   }

8) Alternar estadoAdmin (true <-> false):
   PATCH http://localhost:3001/usuarios/:idUsuario/estadoAdmin

9) Alternar estadoPremium (true <-> false):
   PATCH http://localhost:3001/usuarios/:idUsuario/estadoPremium


DELETE (Eliminar Usuario)
--------------------------------------------------------------
10) Eliminar un usuario:
    DELETE http://localhost:3001/usuarios/:idUsuario
    Body requerido:
    {
      "idUsuarioAdmin": "ID_del_admin_que_elimina"
    }

================================================================
*/