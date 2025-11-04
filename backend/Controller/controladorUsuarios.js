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
  crearUsuarioService,
  actualizarUsuarioService,
  editarUsuarioService,
  eliminarUsuarioService,
  ascenderAdminService,
  asignarPremiumService,
  limpiarUsuariosInactivosService
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
  // Limpia caracteres raros como %0A y espacios
  const clean = decodeURIComponent(url).trim().toLowerCase();
  const parts = clean.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last || last === 'usuarios') return null;
  return last;
}

// ==================== MAIN CONTROLLER ====================
async function manejarSolicitudesUsuarios(req, res) {
  const { method } = req;
  const cleanUrl = req.url.split('?')[0].replace(/\/$/, '');
  const idUsuario = getIdFromUrl(cleanUrl);

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

        const usuario = await obtenerUsuarioById(idUsuario);
        if (!usuario) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Usuario con ID ${idUsuario} no encontrado` }));
          break;
        }

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
          const resultado = await ascenderAdminService(idUsuario, idUsuarioAdmin);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(resultado));
          break;
        }

        if (cleanUrl.includes('/premium')) {
          const { idUsuarioAdmin } = body;
          const resultado = await asignarPremiumService(idUsuario, idUsuarioAdmin);
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
        const idAirtablePUT = await obtenerIdAirtablePorIdUsuario(idUsuario);
        if (!idAirtablePUT) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Usuario con ID ${idUsuario} no encontrado` }));
          break;
        }

        const nuevosDatos = await getRequestBody(req);
        const resultado = await actualizarUsuarioService(idAirtablePUT, nuevosDatos);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(resultado));
        break;
      }

      // ==================== PATCH ====================
      case 'PATCH': {
        const idAirtablePATCH = await obtenerIdAirtablePorIdUsuario(idUsuario);
        if (!idAirtablePATCH) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Usuario con ID ${idUsuario} no encontrado` }));
          break;
        }

        const cambios = await getRequestBody(req);
        const resultado = await editarUsuarioService(idAirtablePATCH, cambios);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(resultado));
        break;
      }

      // ==================== DELETE ====================
      case 'DELETE': {
        const idAirtableDELETE = await obtenerIdAirtablePorIdUsuario(idUsuario);
        if (!idAirtableDELETE) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Usuario con ID ${idUsuario} no encontrado` }));
          break;
        }

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
