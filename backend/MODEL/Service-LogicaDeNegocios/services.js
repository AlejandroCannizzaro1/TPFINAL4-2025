/*
1. Métodos auxiliares de parsing o request → Se quedan en el controller

Estos son funciones que trabajan directamente con req, res o la URL, por lo tanto no deberían moverse al Service.

✅ Ejemplos:

function getRequestBody(req) { ... }   // Lee el body
function getIdFromUrl(url) { ... }     // Extrae el ID de la URL


📍 Por qué en el controller:

Son parte del manejo HTTP, no de la lógica de negocio.

En la capa Service o DAO no se usa req ni res.


/2. Métodos de lógica de negocio o validación → van en el Service

Si más adelante necesitás cosas como:

Validar que un turno no se superponga con otro.

Verificar que un usuario tenga permisos antes de modificar.

Calcular algo (fechas, precios, etc.)

// turnosService.js
async function validarTurno(turno) { ... }
async function procesarTurno(turno) { ... }


Tipo de función	                             Dónde va	         Ejemplo
Parseo de req, res, URLs, body	           | Controller	        | getRequestBody, getIdFromUrl
Lógica de negocio / validaciones / reglas  | Service	        | validarTurno, calcularDuracionTurno
Acceso a datos (DB, Airtable, API externa) | DAO / Repository   | obtenerTurnos, crearUsuario
 */