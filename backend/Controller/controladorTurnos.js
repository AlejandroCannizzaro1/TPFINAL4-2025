const {
    obtenerTurnos,
    crearTurno,
    actualizarTurno,
    editarTurno,
    eliminarTurno,
    obtenerTurnoByIdNormal,
    obtenerIdAirtablePorIdTurno
} = require('../MODEL/DAO-Repository/airtableRepositoryTurnos');

const {
    reservarTurnoService,
    cancelarReservaService,
    limpiarTurnosPasadosService,
    eliminarTurnoByAdminService,
    crearTurnoService,
    obtenerTurnosPorUsuarioService,
    getTurnoByIdService
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

                // GET /turnos/usuario?idUsuario=IDUSUARIO
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
                        const status = resultado?.error ? 404 : 200;
                        res.writeHead(status, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(resultado));
                    } catch (error) {
                        console.error('Error al obtener turnos por usuario:', error.message);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error interno del servidor', detalle: error.message }));
                    }
                    break;
                }

                //  GET /turnos/:idTurno (traer un turno por ID normal)
                if (cleanUrl.match(/^\/turnos\/\d+$/)) {
                    const idTurno = getIdFromUrl(cleanUrl);

                    try {
                        const resultado = await getTurnoByIdService(idTurno);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(resultado));
                    } catch (error) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: error.message }));
                    }
                    break;
                }

                // GET /turnos (todos los turnos)
                const turnos = await obtenerTurnos();
                if (!turnos || turnos.error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: turnos?.error || 'Error al obtener turnos' }));
                    break;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(turnos));
                break;
            }


            // ==================== POST ====================
            case 'POST': {
                const body = await getRequestBody(req);

                if (cleanUrl.includes('/admin')) {
                    const { datosTurno, idAdmin } = body;
                    const resultado = await crearTurnoService(idAdmin, datosTurno);
                    const status = resultado?.error ? 400 : 201;
                    res.writeHead(status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                if (cleanUrl.includes('/reservar')) {
                    const { idUsuario } = body;
                    const resultado = await reservarTurnoService(idTurno, idUsuario);
                    const status = resultado?.error ? 400 : 200;
                    res.writeHead(status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                if (cleanUrl.includes('/cancelar')) {
                    const { idUsuario } = body;
                    const resultado = await cancelarReservaService(idTurno, idUsuario);
                    const status = resultado?.error ? 400 : 200;
                    res.writeHead(status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                if (cleanUrl.includes('/limpiar')) {
                    const { idUsuarioAdmin } = body;
                    const resultado = await limpiarTurnosPasadosService(new Date(), idUsuarioAdmin);
                    const status = resultado?.error ? 400 : 200;
                    res.writeHead(status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                if (cleanUrl.includes('/eliminar')) {
                    const { idUsuarioAdmin } = body;
                    const resultado = await eliminarTurnoByAdminService(idTurno, idUsuarioAdmin);
                    const status = resultado?.error ? 400 : 200;
                    res.writeHead(status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    break;
                }

                // Crear turno normal
                const resultado = await crearTurnoService(body);
                const status = resultado?.error ? 400 : 201;
                res.writeHead(status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== PUT ====================
            //Esto esta hecho, pero la realidad es que el PUT NO SE USA, porque modificar un turno entero no es eficiente en nuestra App, tiene datos vinculados de otras entidades, es mas practico el PATCH en este caso
            case 'PUT': {
                const nuevoTurno = await getRequestBody(req);
                const resultado = await actualizarTurno(idTurno, nuevoTurno);
                const status = resultado?.error ? 400 : 200;
                res.writeHead(status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== PATCH ====================
            //Esto solo lo hace el admin, ya que valida, si es ADMIN, Y solo puede modificar el turno si este no esta reservado aun, es decir, estadoDisponible === true
            case 'PATCH': {
                const { idUsuarioAdmin, ...cambios } = await getRequestBody(req);

                if (!idUsuarioAdmin) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Falta el idUsuarioAdmin en el cuerpo de la solicitud" }));
                    break;
                }

                const resultado = await editarTurnoByAdminService(idTurno, idUsuarioAdmin, cambios);

                const status = resultado?.error ? 400 : 200;
                res.writeHead(status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(resultado));
                break;
            }

            // ==================== DELETE ====================
            //Esto esta hecho, pero la realidad es que el DELETE se hace con solicitud POST, para  validar parametros como ID y demas. 
            case 'DELETE': {
                const resultado = await eliminarTurno(idTurno);
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
        console.error(' Error en manejarSolicitudesTurnos:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Error interno del servidor',
            detalle: err.message
        }));
    }
}

module.exports = { manejarSolicitudesTurnos };


/*
Endpoints para cada peticion y ejemplos de como debe de ser el body, si es que la misma lleva body, en la request

GET /turnos

Devuelve todos los turnos.
No lleva body.

GET /turnos/usuario?idUsuario=ID

Devuelve los turnos reservados por un usuario específico.
No lleva body.
Ejemplo:

GET /turnos/usuario?idUsuario=3

POST /turnos/admin

Crear un turno como administrador.
Body:

{
  "idAdmin": 1,
  "datosTurno": {
    "fecha": "2025-11-12",
    "hora": "10:30",
    "tipoServicio": "Corte",
    "notas": "Cliente nuevo"
  }
}

POST /turnos/{idTurno}/reservar

Un usuario reserva un turno.
Ejemplo:

POST /turnos/15/reservar


Body:

{
  "idUsuario": 7
}

POST /turnos/{idTurno}/cancelar

Un usuario cancela su reserva.
Ejemplo:

POST /turnos/15/cancelar


Body:

{
  "idUsuario": 7
}

POST /turnos/limpiar

Limpia los turnos pasados (solo admin).
Body:

{
  "idUsuarioAdmin": 1
}

POST /turnos/{idTurno}/eliminar

Elimina un turno como administrador.
Ejemplo:

POST /turnos/10/eliminar


Body:

{
  "idUsuarioAdmin": 1
}

POST /turnos

Crear un turno sin necesidad de ser admin.
Body:

{
  "fecha": "2025-11-15",
  "hora": "18:00",
  "tipoServicio": "Barba"
}

PUT /turnos/{idTurno}

Sobrescribe todo el turno completo (no valida permisos).
Ejemplo:

PUT /turnos/8


Body:

{
  "fecha": "2025-12-01",
  "hora": "14:00",
  "tipoServicio": "Corte y Barba",
  "notas": "Cambió horario"
}

PATCH /turnos/{idTurno}

Modifica solo algunos campos, pero solo si el turno no está reservado y el usuario es admin.
Ejemplo:

PATCH /turnos/8


Body:

{
  "idUsuarioAdmin": 1,
  "fecha": "2025-12-10",
  "hora": "16:30"
}

DELETE /turnos/{idTurno}

Elimina el turno directamente (sin validar admin).
Ejemplo:

DELETE /turnos/9


No lleva body.
*/