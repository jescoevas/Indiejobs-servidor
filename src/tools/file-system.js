const path = require('path')
const fs = require('fs')
const uniqid = require('uniqid')

class FileSystem{

    constructor(){}

    asignarFoto(imagen, usuarioId){
        return new Promise((resolve,reject) => {
            const pathFoto = this.getCarpetaFoto(usuarioId)
            const foto = this.getFoto(usuarioId)
            if(foto.length > 0) this.eliminaFoto(pathFoto, foto)
            const nombreImagen = this.generarNombreUnico(imagen.name)
            imagen.mv(`${pathFoto}/${nombreImagen}`, (err) => {
                if(err) reject(err)
                else resolve()
            })
        })
    }

    eliminaFoto(path, foto){
        const pathCompleto = path + `/${foto}`
        try {
            fs.unlinkSync(pathCompleto)
        }catch(err) {
            console.error(err)
        }
    }

    getFoto(usuarioId){
        const pathFoto = this.getCarpetaFoto(usuarioId)
        const col = fs.readdirSync(pathFoto)
        return col[0] || []
    }

    getCarpetaFoto(usuarioId){
        const pathUsuario = this.getCarpetaUsuario(usuarioId)
        const pathFoto = pathUsuario + '/foto'
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

    generarNombreUnico(nombre){
        const arr = nombre.split('.')
        const ext = arr[arr.length-1]
        const idUnico = uniqid()
        return `${idUnico}.${ext}`
    }

}

module.exports = FileSystem