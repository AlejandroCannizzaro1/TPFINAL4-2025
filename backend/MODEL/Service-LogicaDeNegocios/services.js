/*
Esto refiere a que el service es aquel que tambien tiene una lista local con los datos de la BDD para acelerar la rpta y ahorrar recursos
El repo se comunica solo con la BDD, no accede a una lista o archivo local, tipo json, lista o lo que fuere si hay una BDD vinculada al Back-End
La cache va en el Service.
El Repository NO debe tener cache.
El Repository solo habla con la base.

🧱 Por qué
Capa	Responsabilidad	¿Debe tener cache?
Entity	Estructura de los datos (clase / tipo)	❌ No
Repository	Lee y escribe en la base	❌ No
Service (o Domain Service)	Reglas de negocio, coordina repos + cache	✅ Sí
Controller	Recibe request y llama al Service	❌ No
🎯 Regla de arquitectura (muy importante)

El Repository representa la base real.
El Service maneja la lógica del dominio (incluyendo cache).

El Repository no puede tener cache, porque entonces ya no representa el estado real de la base.

📦 Estructura correcta
/src
  /domain
    /entities
      Turno.js
    /repositories
      TurnoRepository.js     ← SOLO queries
    /services
      TurnoService.js        ← ACÁ VA LA CACHE
  /controllers
    turnoController.js

📝 Ejemplo concreto
Repository (habla con la base)
// domain/repositories/TurnoRepository.js
import db from "../../database/connection.js";

export async function obtenerTodos() {
  const [rows] = await db.query("SELECT * FROM turnos");
  return rows;
}

Service (acá va la cache)
// domain/services/TurnoService.js
import { obtenerTodos } from "../repositories/TurnoRepository.js";

let cacheTurnos = [];   //  La cache vive acá (en memoria RAM)

export async function inicializarCache() {
  cacheTurnos = await obtenerTodos(); // carga desde la base
}

export function obtenerDesdeCache() {
  return cacheTurnos; // no toca la base
}

export async function reservar(idTurno) {
  // actualizar DB
  await db.query("UPDATE turnos SET disponible = 0 WHERE id = ?", [idTurno]);
  // refrescar cache
  await inicializarCache();
}

Controller
// controllers/turnoController.js
import { obtenerDesdeCache } from "../domain/services/TurnoService.js";

export function listarTurnos(req, res) {
  res.json(obtenerDesdeCache());
}

🔥 Resumen 
Capa	Qué hace	Ejemplo
Repository	Habla con la BD	SELECT * FROM turnos
Service	Maneja lógica + cache	guarda lista en memoria
Controller	Devuelve la respuesta	res.json(serviceResult)
*/