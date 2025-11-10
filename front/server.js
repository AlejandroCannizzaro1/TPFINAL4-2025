//Cargo variables de entorno (.env)
require('dotenv').config(); //Carga la libreria dotenv y config lee el archivo .env

//Importar modulos nativos y controladores
const http = require('http');
const url = require('url');
const { manejarSolicitudesTurnos } = require('./Controller/controladorTurnos');
const { manejarSolicitudesUsuarios } = require('./Controller/controladorUsuarios');

//Configuracion basica del servidor
const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
    //Habilitar CORS para que Angular pueda conectarse desde otro puerto, 3000 en este caso
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    //Manejar solicitudes OPTIONS(preflight) El metodo OPTIONS es una solicitud especial que un navegador o client http puede enviar a un servidor para preguntar que metodos y cabeceras estan permitidios antes de hacer la solicitud real: get, post, patch,put,delete
    //Sirve para consultar las reglas del servidor antes de enviar datos reales
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*', //En este caso permite cualquier dominio y si no se especifica el dominio permitido
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,PUT,PATCH', //Los metodos HTTP permitidos para otras apps
            'Access-Control-Allow-Headers': 'Content-Type, Authorization', //Esto le permite al FRONT mandar ciertos encabezados 
            //Aurthorization Se usa para tokens/JWT/API keys en headers
            //Content-Type indica el  tipo de datos enviados (application/json, etc.)
        });
        res.end();
        return;
    } //Esto envia info de los verbos http que se pueden usar, y los puertos o dominios permitidos que se pueden comunicar con el BACKEND

    //Parsear la URL para saber que ruta se esta pidiendo
    const parsedUrl = url.parse(req.url, true); //true convierte a la query en objeto, es decir, a lo que viene luego del ?, si viene id=1 y curso='java', lo convierte en objeto literal 
    const path = parsedUrl.pathname; //Aca extrae la ruta sin parametros, es decir, usuarios o turnos para aplicarlo a un case o un if o lo que fuere

    if (path.startsWith('/turnos')) { //Si la request inicia con turnos los redirige al controller de turnos 
        manejarSolicitudesTurnos(req, res);
    } else if (path.startsWith('/usuarios')) {  //Si la request inicia con turnos los redirige al controller de usuarios 
        manejarSolicitudesUsuarios(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' }); //Si el path esta mal tira error. 
        res.end(JSON.stringify({ message: "Path not founded..." })); 
    }
});

//Iniciar el servidor : ESCUCHA EN EL PUERTO 3001 SETEADO MAS ARRIBA
server.listen(PORT, "localhost", () => {
    console.log(`Server listening at "http://localhost:${PORT}"`);
});