require('dotenv').config(); //Carga las variables de entorno desde un archivo .env a process.env.
const express = require('express'); //Importa Express, un framework de Node.js para crear servidores web
const bodyParser = require('body-parser');  //Importa body-parser, que permite leer datos enviados en las peticiones HTTP (por ejemplo, POST) y convertirlos en objetos JSON o texto para usar en el
const cors = require('cors'); //Importa cors, un middleware que permite controlar qué dominios pueden hacer peticiones a tu servidor.


const app = express();
app.use(bodyParser.json());
app.use(cors()); //Permite que Angular/JS frontend haga peticiones

//Mock database simplona
const turnos = []; //Aca guardamos los turnos, habria que hacer un json para manejar persistencia

//Configurar oAuth2 con credenciales del admin 






app.listen(3001, () => console.log('http://localhost:3001 listo wachin'));