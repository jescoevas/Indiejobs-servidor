//Servidor
const puerto = process.env.PORT || 3000

//Base de datos
const desarrollo = 'mongodb://localhost:27017/indiejobs'
const produccion = 'mongodb+srv://jescoevas:1h5bjrwnsZYIKNFF@cluster0.hru6d.mongodb.net/indiejobs'

const baseDeDatos = process.env.PORT ? produccion :  desarrollo

module.exports = {
    puerto, baseDeDatos
}