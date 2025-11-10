const {
    obtenerNotificacionesPorIdUsuarioService,
    obtenerNotificacionesPorIdTurnoService
} = require("../MODEL/Service-LogicaDeNegocios/notificacionService");

// ==================== MAIN CONTROLLER ====================
async function manejarSolicitudesNotificaciones(req, res) {
    const { method } = req;
    const cleanUrl = req.url.split("?")[0].replace(/\/$/, "");

    // --- CORS ---
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        switch (method) {

            // ==================== GET ====================
            case "GET": {

                // GET /notificaciones/usuario?idUsuario=X
                if (cleanUrl.startsWith("/notificaciones/usuario")) {
                    const urlParams = new URL(req.url, `http://${req.headers.host}`);
                    const idUsuario = urlParams.searchParams.get("idUsuario");

                    if (!idUsuario) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "Falta idUsuario en la URL" }));
                        return;
                    }

                    const resultado = await obtenerNotificacionesPorIdUsuarioService(idUsuario);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(resultado));
                    return;
                }

                // GET /notificaciones/turno?idTurno=X
                if (cleanUrl.startsWith("/notificaciones/turno")) {
                    const urlParams = new URL(req.url, `http://${req.headers.host}`);
                    const idTurno = urlParams.searchParams.get("idTurno");

                    if (!idTurno) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "Falta idTurno en la URL" }));
                        return;
                    }

                    const resultado = await obtenerNotificacionesPorIdTurnoService(idTurno);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(resultado));
                    return;
                }

                break;
            }

            default:
                res.writeHead(405, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Método no permitido" }));
        }

    } catch (err) {
        console.error("ERROR en manejarSolicitudesNotificaciones:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Error del servidor", detalle: err.message }));
    }
}

module.exports = { manejarSolicitudesNotificaciones };
