const { Router } =  require('express')
const Trabajo = require('../models/trabajo.model')
const Usuario = require('../models/usuario.model')
const TrabajoFotos = require('../tools/trabajo-fotos')
const verificarToken = require('../tools/verificarToken')

const router = Router()
const trabajoFotos = new TrabajoFotos()

router.post('/usuario/trabajos', async (req, resp) => {
    const { id } = req.body
    const autor = await Usuario.findById(id)
    const trabajos = await Trabajo.find({autor})
    return resp.json({trabajos})
})

router.post('/trabajo/create',verificarToken, async (req, resp) => {
    const idAutor = req.usuario._id
    const { cuerpo } = req.body
    const autor = await Usuario.findById(idAutor)
    const trabajoDB = await Trabajo.create({autor, cuerpo})
    resp.json({trabajoDB})
})

router.post('/trabajo/asignarFoto', verificarToken, async (req, res) => {
    if(!req.files) 
        return res.json({msg:"No se han enviado archivos"})
    const {foto} = req.files
    if(!foto.mimetype.includes('image')) 
        return res.json({msg:"No se ha subido ninguna imagen"})
    const usuario = req.usuario
    const {trabajoId} = req.body
    await trabajoFotos.asignarFoto(foto, usuario._id, trabajoId)
    const fotoTrabajo = trabajoFotos.getFoto(usuario._id, trabajoId)
    const trabajo = await Trabajo.findById(trabajoId)
    trabajo.foto = fotoTrabajo
    await Trabajo.findByIdAndUpdate(trabajo._id, trabajo, {new:true})
    res.json({
        msg:"Foto asignada"
    })
})

router.get('/:usuarioId/:trabajoId/foto', (req, res) => {
    const { usuarioId, trabajoId } = req.params
    const path = trabajoFotos.getCarpetaTrabajos(usuarioId)
    const foto = trabajoFotos.getFoto(usuarioId, trabajoId)
    const pathCompleto = `${path}/${foto}`
    res.sendFile(pathCompleto)
})


module.exports = router