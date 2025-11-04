const {
    obtenerTurnos,
    crearTurno,
    actualizarTurno,
    editarTurno,
    eliminarTurno,
    obtenerTurnoById,
    obtenerIdAirtablePorIdTurno
} = require('../MODEL/DAO-Repository/airtableRepositoryTurnos');

const {
    reservarTurnoService,
    cancelarReservaService,
    limpiarTurnosPasadosService,
    eliminarTurnoByAdminService,
    crearTurnoService,
    obtenerTurnosPorUsuarioService
} = require('../MODEL/Service-LogicaDeNegocios/turnoServices');

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
    const parts = url.split('/');
    return parts[parts.length - 1];
}

// ==================== MAIN CONTROLLER ====================
async function manejarSolicitudesTurnos(req, res) {
    const { method } = req;
    const cleanUrl = req.url.split('?')[0].replace(/\/$/, '');
    const idTurno = getIdFromUrl(cleanUrl);

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
                // 1️ Nuevo endpoint: obtener turnos por usuario (ej: /turnos/usuario?idUsuario=5)
                if (cleanUrl.startsWith('/turnos/usuario')) {
                    const urlParams = new URL(req.url, `http://${req.headers.host}`);
                    const idUsuario = urlParams.searchParams.get('idUsuario');

                    if (!idUsuario) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Falta el parámetro idUsuario en la URL' }));
                        break;
                    }

                    try {
                        const resultado = await obtenerTurnosPorUsuarioService(idUsuario);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(resultado));
                    } catch (error) {
                        console.error('Error al obtener turnos por usuario:', error.message);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error interno del servidor', detalle: error.message }));
                    }
                    break;
                }
            }

            // ==================== POST ====================
            case 'POST': {
                const body = await getRequestBody(req);

                if (cleanUrl.includes('/admin')) {
                    const { datosTurno, idAdmin } = body;
                    const resultado = await crearTurnoService(datosTurno, idAdmin);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                if (cleanUrl.includes('/reservar')) {
                    const { idUsuario } = body; // recibo solo el idUsuario, no el objeto entero
                    const resultado = await reservarTurnoService(idTurno, idUsuario);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                if (cleanUrl.includes('/cancelar')) {
                    const { idUsuario } = body;
                    const resultado = await cancelarReservaService(idTurno, idUsuario);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                if (cleanUrl.includes('/limpiar')) {
                    const { idUsuarioAdmin } = body;
                    const resultado = await limpiarTurnosPasadosService(new Date(), idUsuarioAdmin);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                if (cleanUrl.includes('/eliminar')) {
                    const { idUsuarioAdmin } = body;
                    const resultado = await eliminarTurnoByAdminService(idTurno, idUsuarioAdmin);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                // Crear turno normal
                const resultado = await crearTurnoService(body);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== PUT ====================
            case 'PUT': {

                const nuevoTurno = await getRequestBody(req);
                const resultado = await actualizarTurno(idTurno, nuevoTurno);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== PATCH ====================
            case 'PATCH': {

                const cambios = await getRequestBody(req);
                const resultado = await editarTurno(idTurno, cambios);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== DELETE ====================
            case 'DELETE': {

                const resultado = await eliminarTurno(idTurno);
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
        console.error(' Error en manejarSolicitudesTurnos:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error interno del servidor', detalle: err.message }));
    }
}

module.exports = { manejarSolicitudesTurnos };
