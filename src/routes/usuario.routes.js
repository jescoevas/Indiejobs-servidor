const { Router } =  require('express')
const Usuario = require('../models/usuario.model')
const Token = require('../tools/token')
const verificarToken = require('../tools/verificarToken')
const FileSystem = require('../tools/file-system')

const router = Router()
const fileSystem = new FileSystem()

router.post('/registro', async (req, res) => {

    const { email, telefono } = req.body
    const emailEncontrado = await Usuario.find({email})
    const telefonoEncontrado = await Usuario.find({telefono})

    if(emailEncontrado.length > 0){
        return res.json({
            msg:'Email existe',
            usuarioDB:{}
        })
    }else if(telefonoEncontrado.length > 0){
        return res.json({
            msg:'Telefono existe',
            usuarioDB:{}
        })
    }else{
        const usuarioDB = await Usuario.create({...req.body})
        res.json({
            msg:'Registro realizado con exito',
            usuarioDB
        })
    }

})

router.post('/login', async (req, res) => {
    const {email, password} = req.body
    const usuario = await Usuario.findOne({email})
    if(!usuario) 
        return res.json({msg:"No se ha encontrado el usuario"})
    const coincide = await usuario.compararPassword(password)
    if(!coincide) 
        return res.json({msg:"Password incorrecta"})
    res.json({
        msg:"Login realizado con exito",
        token:Token.getJwtToken(usuario)
    })
})

router.get('/avatar', verificarToken, (req, res) => {
    const id = req.usuario._id
    const path = fileSystem.getCarpetaAvatar(id)
    const avatar = fileSystem.getAvatar(id)
    const pathCompleto = `${path}/${avatar}`
    res.sendFile(pathCompleto)
})

router.post('/asignarFoto', verificarToken, async (req, res) => {
    if(!req.files) 
        return res.json({msg:"No se han enviado archivos"})
    const {foto} = req.files
    if(!foto.mimetype.includes('image')) 
        return res.json({msg:"No se ha subido ninguna foto"})
    let usuario = req.usuario
    await fileSystem.asignarFoto(foto, usuario._id)
    const fotoUsuario = fileSystem.getFoto(usuario._id)
    usuario.foto = fotoUsuario
    await Usuario.findByIdAndUpdate(usuario._id, usuario, {new:true})
    res.json({
        msg:"Foto asignada"
    })
})

router.post('/checkEmail', async (req, resp) => {
    const { email } = req.body
    const encontrado = await Usuario.find({ email })
    return resp.json({num: encontrado.length})
})

router.post('/checkTelefono', async (req, resp) => {
    const { telefono } = req.body
    const encontrado = await Usuario.find({ telefono })
    return resp.json({num: encontrado.length})
})

router.get('/trabajadores', async (req,resp) => {
    const trabajadores = await Usuario.find({trabajador:true})
    return resp.json({trabajadores})
})

module.exports = router