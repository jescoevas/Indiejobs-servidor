const path = require('path')
const fs = require('fs')

class TrabajoFotos{

    constructor(){}

    asignarFoto(imagen, usuarioId, trabajoId){
        return new Promise((resolve,reject) => {
            const pathFoto = this.getCarpetaTrabajos(usuarioId)
            const nombreFoto = this.generarNombreUnico(trabajoId,imagen.mimetype)
            imagen.mv(`${pathFoto}/${nombreFoto}`, (err) => {
                if(err) reject(err)
                else resolve()
            })
        })
    }

    getCarpetaTrabajos(usuarioId){
        const pathUsuario = this.getCarpetaUsuario(usuarioId)
        const pathFoto = `${pathUsuario}/trabajos`
        const existeFoto = fs.existsSync(pathFoto)
        if(!existeFoto){
            fs.mkdirSync(pathFoto)
        }
        return pathFoto
    }

    getCarpetaUsuario(usuarioId){
        const pathUsuario = path.resolve(__dirname,'../uploads/', usuarioId)
        const existe = fs.existsSync(pathUsuario)
        if(!existe){
            fs.mkdirSync(pathUsuario)
        }
        return pathUsuario
    }

    generarNombreUnico(trabajoId,tipo){
        const arr = tipo.split('/')
        const ext = arr[arr.length-1]
        return `${trabajoId}.${ext}`
    }

    getFoto(usuarioId, trabajoId){
        const pathTrabajos = this.getCarpetaTrabajos(usuarioId)
        const col = fs.readdirSync(pathTrabajos)
        const foto = col.filter(f => f.includes(trabajoId))
        return foto[0]
    }

}

module.exports = TrabajoFotos