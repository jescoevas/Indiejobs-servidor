const { Router } =  require('express')
const Usuario = require('../models/usuario.model')
const Token = require('../tools/token')
const verificarToken = require('../tools/verificarToken')
const FileSystem = require('../tools/file-system')

const router = Router()
const fileSystem = new FileSystem()

router.get('/usuario/:usuarioId', async (req, res) => {
    const {usuarioId} = req.params
    const usuario = await Usuario.findById(usuarioId)
    return res.json({usuario})
})

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
            usuarioDB,
            token:Token.getJwtToken(usuarioDB)
        })
    }

})

router.put('/editar', async (req, res) => {

    const { email, telefono, id, emailUsuario, telefonoUsuario } = req.body
    const emailEncontrado = await Usuario.find({email})
    const telefonoEncontrado = await Usuario.find({telefono})

    if(emailEncontrado.length > 0 && email !== emailUsuario){
        return res.json({
            msg:'Email existe',
        })
    }else if(telefonoEncontrado.length > 0 && telefono !== telefonoUsuario){
        return res.json({
            msg:'Telefono existe',
        })
    }else{
        delete req.body.id
        delete req.body.emailUsuario
        delete req.body.telefonoUsuario
        await Usuario.findByIdAndUpdate(id, req.body, {new:true})
        res.json({
            msg:'Edicion realizada con exito',
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
        usuarioId:usuario._id,
        foto:usuario.foto,
        token:Token.getJwtToken(usuario)
    })
})

router.get('/:usuarioId/foto', (req, res) => {
    const {usuarioId} = req.params
    const path = fileSystem.getCarpetaFoto(usuarioId)
    const foto = fileSystem.getFoto(usuarioId)
    const pathCompleto = `${path}/${foto}`
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

router.get('/trabajadores/cercanos',verificarToken , async (req,resp) => {
    const usuario = req.usuario
    const trabajadores = await Usuario.find({trabajador:true, ciudad:usuario.ciudad})
    console.log(usuario)
    console.log(trabajadores)
    const cercanos = trabajadores.filter(trabajador => trabajador._id != usuario._id)
    return resp.json({cercanos})
})

module.exports = router