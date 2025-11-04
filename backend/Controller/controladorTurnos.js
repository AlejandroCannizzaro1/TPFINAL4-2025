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
  crearTurnoService
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
        if (cleanUrl === '/turnos' || !idTurno || idTurno === 'turnos') {
          const turnos = await obtenerTurnos();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(turnos));
          break;
        }

        const turno = await obtenerTurnoById(idTurno);
        if (!turno) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Turno con ID ${idTurno} no encontrado` }));
          break;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(turno));
        break;
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
          const { usuario } = body;
          const resultado = await reservarTurnoService(idTurno, usuario);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(resultado));
          break;
        }

        if (cleanUrl.includes('/cancelar')) {
          const { usuario } = body;
          const resultado = await cancelarReservaService(idTurno, usuario);
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
        const idAirtablePUT = await obtenerIdAirtablePorIdTurno(idTurno);
        if (!idAirtablePUT) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Turno ${idTurno} no encontrado (PUT)` }));
          break;
        }
        const nuevoTurno = await getRequestBody(req);
        const resultado = await actualizarTurno(idAirtablePUT, nuevoTurno);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(resultado));
        break;
      }

      // ==================== PATCH ====================
      case 'PATCH': {
        const idAirtablePATCH = await obtenerIdAirtablePorIdTurno(idTurno);
        if (!idAirtablePATCH) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Turno ${idTurno} no encontrado (PATCH)` }));
          break;
        }
        const cambios = await getRequestBody(req);
        const resultado = await editarTurno(idAirtablePATCH, cambios);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(resultado));
        break;
      }

      // ==================== DELETE ====================
      case 'DELETE': {
        const idAirtableDELETE = await obtenerIdAirtablePorIdTurno(idTurno);
        if (!idAirtableDELETE) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Turno ${idTurno} no encontrado (DELETE)` }));
          break;
        }
        const resultado = await eliminarTurno(idAirtableDELETE);
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
    console.error('❌ Error en manejarSolicitudesTurnos:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Error interno del servidor', detalle: err.message }));
  }
}

module.exports = { manejarSolicitudesTurnos };
