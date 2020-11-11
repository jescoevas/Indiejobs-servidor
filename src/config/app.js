const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')

const { puerto } = require('./env')

const app = express()

//Configuracion
app.set('port', puerto)

//Middlewares
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors({ origin: '*' }));

//Archivos
app.use(fileUpload())

//Rutas
app.use('/indiejobs/api/', require('../routes/usuario.routes'))

//Inicio
function iniciarServidor() {
    app.listen(app.get('port'), () => console.log(`Servidor activo en puerto ${app.get('port')}`))
}

module.exports = {
    iniciarServidor
}