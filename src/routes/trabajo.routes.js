const { Router } = require('express')
const Trabajo = require('../models/trabajo.model')
const Usuario = require('../models/usuario.model')
const TrabajoFotos = require('../tools/trabajo-fotos')
const verificarToken = require('../tools/verificarToken')

const router = Router()
const trabajoFotos = new TrabajoFotos()

router.post('/usuario/trabajos', async(req, resp) => {
    const { id } = req.body
    const autor = await Usuario.findById(id)
    const trabajos = await Trabajo.find({ autor })
    return resp.json({ trabajos })
})

router.post('/trabajo/create', verificarToken, async(req, resp) => {
    const idAutor = req.usuario._id
    const { cuerpo, estrellas, fecha } = req.body
    const autor = await Usuario.findById(idAutor)
    const trabajoDB = await Trabajo.create({ autor, cuerpo, estrellas, fecha })
    resp.json({
        msg: 'Exito',
        trabajoDB
    })
})

router.post('/trabajo/asignarFoto', verificarToken, async(req, res) => {
    if (!req.files)
        return res.json({ msg: "No se han enviado archivos" })
    const { foto } = req.files
    if (!foto.mimetype.includes('image'))
        return res.json({ msg: "No se ha subido ninguna imagen" })
    const usuario = req.usuario
    const { trabajoId } = req.body
    await trabajoFotos.asignarFoto(foto, usuario._id, trabajoId)
    const fotoTrabajo = trabajoFotos.getFoto(usuario._id, trabajoId)
    const trabajo = await Trabajo.findById(trabajoId)
    trabajo.foto = fotoTrabajo
    await Trabajo.findByIdAndUpdate(trabajo._id, trabajo, { new: true })
    res.json({
        msg: "Foto asignada"
    })
})

router.get('/:usuarioId/:trabajoId/foto', (req, res) => {
    const { usuarioId, trabajoId } = req.params
    const path = trabajoFotos.getCarpetaTrabajos(usuarioId)
    const foto = trabajoFotos.getFoto(usuarioId, trabajoId)
    const pathCompleto = `${path}/${foto}`
    res.sendFile(pathCompleto)
})

router.get('/trabajo/:trabajoId', async(req, res) => {
    const { trabajoId } = req.params
    const trabajo = await Trabajo.findById(trabajoId)
    return res.json({ trabajo })
})

router.post('/trabajos/top', verificarToken, async(req, res) => {
    const { tipo } = req.body
    let trabajos = await Trabajo.find({}).sort([
        ['estrellas', -1]
    ])
    if (tipo == 'local') {
        const ciudad = req.usuario.ciudad
        let res = []
        for (let i = 0; i < trabajos.length; i++) {
            const trabajo = trabajos[i];
            const trabajador = await Usuario.findById(trabajo.autor)
            if (trabajador.ciudad == ciudad) res.push(trabajo)
        }
    }
    return res.json({ trabajos })
})


module.exports = router