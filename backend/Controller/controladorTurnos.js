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

                // GET /turnos (Trae todos los turnos)
                if (cleanUrl === '/turnos') {
                    const turnos = await obtenerTurnos(); // <- ESTA función ya la importaste
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(turnos));
                    return;
                }

                // GET /turnos/:idTurno (Trae un turno específico)
                if (cleanUrl.startsWith('/turnos/') && idTurno && !cleanUrl.includes('/usuario')) {
                    const turno = await obtenerTurnoByIdNormal(idTurno);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(turno));
                    return;
                }

                // GET /turnos/usuario?idUsuario=...
                if (cleanUrl.startsWith('/turnos/usuario')) {
                    const urlParams = new URL(req.url, `http://${req.headers.host}`);
                    const idUsuario = urlParams.searchParams.get('idUsuario');

                    if (!idUsuario) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Falta el parámetro idUsuario en la URL' }));
                        return;
                    }

                    const resultado = await obtenerTurnosPorUsuarioService(idUsuario);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(resultado));
                    return;
                }

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

GET/turnos/idTurno

Devuelve el turno con el id especifico que se vinculo a la URL 
No lleva body 
Ejemplo: 

/turnos/1

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

POST /turnos/reservar/idTurno

Un usuario reserva un turno.
Ejemplo:

POST /turnos/reservar/2  -> El ID del turno a reservar 


Body:

{
  "idUsuario": 7 -> El ID del turno con que se desea vincular el turno 
}


POST /turnos/cancelar/idTurno

Un usuario cancela su reserva.
Ejemplo:

POST /turnos/cancelar/3 -> ID del turno a cancelar 


Body:

{
  "idUsuario": 7 -> El ID del usuario con el que esta vinculado ese usuario 
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


/*
BASE URL
http://localhost:3001/turnos

GET
Acción	Método	Endpoint	Body	Respuesta
Obtener todos los turnos	GET	http://localhost:3001/turnos	No	Lista completa de turnos
Obtener un turno por ID	GET	http://localhost:3001/turnos/idTurno	No	Turno específico
Obtener turnos de un usuario	GET	http://localhost:3001/turnos/usuario?idUsuario=ID	No	Turnos reservados por ese usuario
POST
Acción	Método	Endpoint	Body
Crear turno como usuario común	POST	http://localhost:3001/turnos	{ fecha, hora, tipoServicio?, notas? }
Crear turno como admin	POST	http://localhost:3001/turnos/admin	{ idAdmin, datosTurno: { fecha, hora, tipoServicio, notas } }
Reservar un turno	POST	http://localhost:3001/turnos/reservar/idTurno	{ idUsuario }
Cancelar reserva	POST	http://localhost:3001/turnos/cancelar/idTurno	{ idUsuario }
Limpiar turnos pasados (Admin)	POST	http://localhost:3001/turnos/limpiar	{ idUsuarioAdmin }
Eliminar turno (Admin)	POST	http://localhost:3001/turnos/idTurno/eliminar	{ idUsuarioAdmin }
PUT (no lo vas a usar pero existe)
Acción	Método	Endpoint	Body
Sobrescribir turno completo	PUT	http://localhost:3001/turnos/idTurno	turno entero completo
PATCH
Acción	Método	Endpoint	Body
Editar turno (solo si no está reservado y sos Admin)	PATCH	http://localhost:3001/turnos/idTurno	{ idUsuarioAdmin, camposQueQuierasModificar }
DELETE
Acción	Método	Endpoint
Eliminar turno sin validar admin (no recomendado)	DELETE	http://localhost:3001/turnos/idTurno
*/
