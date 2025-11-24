Sistema de Gestión de Turnos - Proyecto Final

---

Descripción General

Este proyecto es una aplicación web para la gestión de turnos o reservas de servicios. Permite a usuarios registrados consultar, reservar y cancelar turnos, mientras que los administradores pueden crear, modificar y eliminar turnos disponibles. Incluye un calendario visual para facilitar la gestión de fechas y horarios.

El backend está desarrollado en Node.js y se conecta a Airtable como base de datos en la nube mediante su API. El frontend está construido en Angular, utilizando Angular Material para la interfaz y FullCalendar para la visualización del calendario.

---

Tecnologías Utilizadas

Frontend
- Angular: Framework para construir la interfaz de usuario.
- Angular Material: Biblioteca UI para componentes visuales siguiendo Material Design.
- FullCalendar (Angular): Para mostrar y manejar visualmente el calendario de turnos.
- HTML5 & CSS3: Maquetación y estilos.
- JavaScript / TypeScript: Lógica y control del frontend.

Backend
- Node.js: Servidor y lógica del negocio.
- Airtable API: Base de datos en la nube para almacenamiento de usuarios, turnos y reservas.
- Axios: Cliente HTTP para realizar solicitudes a la API de Airtable.
- dotenv: Gestión de variables de entorno (token de Airtable, URLs, etc).

---

Instalación y Configuración

Prerrequisitos
- Node.js instalado.
- Angular CLI instalado (para desarrollo frontend).
- Cuenta y Base de Airtable configurada.
- Token de acceso API de Airtable (con permisos adecuados).
- Nota: El backend corre en el puerto 3001 (http://localhost:3001) y el frontend en el puerto 4200 (http://localhost:4200). Asegúrate de que ambos estén levantados para que la aplicación funcione correctamente.

---

Configuración de Airtable y Variables de Entorno

Para que el sistema funcione correctamente, es necesario que cada administrador configure su base de datos en Airtable y genere las credenciales correspondientes.

Pasos para configurar Airtable:

1. Crear una base en Airtable  
   El administrador debe crear una base con las tablas necesarias para usuarios, turnos y notificaciones.  
   Ejemplo de tablas:  
   - Usuarios  
   - Turnos  
   - Notificaciones

2. Obtener el Base ID  
   El identificador único de la base de Airtable, que puede encontrarse en la documentación API o en la URL de la base.

3. Generar un API Token  
   Desde la cuenta de Airtable, el administrador debe crear un token con permisos para leer y escribir en la base.

4. Configurar el archivo `.env`  
   En el backend, crear un archivo llamado `.env` en la raíz del proyecto y agregar las siguientes variables con los valores correspondientes:

   Variables de Entorno (.env)

Para que la aplicación funcione correctamente, necesitas crear un archivo llamado .env en la raíz del backend con las siguientes variables. NO debes subir este archivo a ningún repositorio público ni compartirlo, porque contiene información sensible.

Variables que debes configurar:

AIRTABLE_TOKEN
  Este es el token secreto que obtienes cuando creas tu API Key personal en Airtable.
  Permite que el backend pueda conectarse y manipular tu base de datos en Airtable.
  Ejemplo:
  AIRTABLE_TOKEN=tu_token_secreto_aqui

AIRTABLE_BASE_ID
  Es el identificador único de tu base (base de datos) en Airtable.
  Lo encuentras en la URL cuando abres tu base en Airtable.
  Ejemplo:
  AIRTABLE_BASE_ID=appaxTWSbc4hFk0F9

AIRTABLE_TABLE_USUARIOS
  ID o nombre de la tabla dentro de tu base Airtable donde se guardan los usuarios.
  Ejemplo:
  AIRTABLE_TABLE_USUARIOS=tblYd6jWjVHp6GMo8

AIRTABLE_TABLE_TURNOS
  ID o nombre de la tabla donde se almacenan los turnos o reservas.
  Ejemplo:
  AIRTABLE_TABLE_TURNOS=tblcGlrQyEnjUBLmp

AIRTABLE_TABLE_NOTIFICACIONES
  Tabla para las notificaciones (si se usa).
  Ejemplo:
  AIRTABLE_TABLE_NOTIFICACIONES=tblZl6Y7CZ1GVCwC6

PORT
  Puerto donde corre el backend Node.js.
  Por defecto usamos:
  PORT=3001

Notas importantes:
- Nunca compartas el archivo .env con valores reales en repositorios públicos.
- Cada desarrollador o usuario debe crear su propio archivo .env con sus propios tokens e IDs.
- Si el token se expone, regenera uno nuevo en Airtable para mantener la seguridad.


Importante:  
- El token debe tener permisos para lectura y escritura.  
- No compartir el token públicamente ni subir el archivo `.env` a repositorios públicos.  
- Estas variables permiten que la aplicación acceda correctamente a la base de Airtable sin modificar el código.

---

Backend

1. Clonar el repositorio.  
2. Crear el archivo `.env` con las variables mencionadas arriba.  
3. Instalar dependencias:  

   npm install

4. Ejecutar el servidor:  

   npm start

---

Frontend

1. Navegar a la carpeta frontend.  
2. Instalar dependencias:  

   npm install

3. Ejecutar la aplicación Angular:  

   ng serve

4. Acceder a la aplicación en el navegador:  

   http://localhost:4200

---

Uso General

- Usuarios normales pueden registrarse, iniciar sesión, ver su lista de turnos, reservar nuevos turnos y cancelar reservas existentes.  
- Administradores tienen permisos especiales para crear, editar y eliminar turnos, así como para ver y filtrar todas las reservas.  
- La comunicación entre frontend y backend se realiza mediante servicios REST.  
- Airtable almacena toda la información persistente de usuarios y turnos.

---

Estructura del Proyecto

/backend  
  /MODEL  
  /DAO-Repository  
  /Service-LogicaDeNegocios  
  /Controller  
  server.js  
/frontend  
  /src  
    /app  
      /components  
      /services  
      /guards  
  angular.json  
README.md  
.env

---

Consideraciones Técnicas

- El backend se conecta a Airtable usando Axios y gestiona la lógica de negocio incluyendo validaciones, autorizaciones y notificaciones.  
- La gestión de turnos incluye reglas para evitar solapamientos y conflictos horarios.  
- Angular Material y FullCalendar se usan para mejorar la experiencia de usuario en frontend.  
- Las variables sensibles, como el token de Airtable, se almacenan en `.env` y no se suben al repositorio.  
- Backend y frontend corren en puertos distintos (3001 y 4200 respectivamente).

---

Bibliografía (Normas APA)

- Galbato, S. (2025). Metodología de Sistemas. Universidad Tecnológica Nacional, Facultad Regional Mar del Plata. Recuperado de https://campus.mdp.utn.edu.ar/course/view.php?id=648  
- Angular. (2025). Angular - The modern web developer’s platform. Recuperado de https://angular.io/  
- Airtable. (2025). Airtable API Documentation. Recuperado de https://airtable.com/api  
- Angular Material. (2025). Angular Material - UI Component Library. Recuperado de https://material.angular.io/  
- FullCalendar. (2025). FullCalendar - JavaScript event calendar. Recuperado de https://fullcalendar.io/  
- dotenv. (2025). Dotenv - Load environment variables. Recuperado de https://github.com/motdotla/dotenv  
- Axios. (2025). Axios - Promise based HTTP client. Recuperado de https://axios-http.com/

---

Autor y Colaboradores

- Alejandro Cannizzaro  
  Email: alejandrocannizzaro@gmail.com  
- Manuel Gelpi  
  Email: manuelgelpi88@gmail.com  
- Joaquin Taborda  
  Email: joaquinstaborda@gmail.com

---

Gracias por revisar el proyecto.
