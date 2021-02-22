const { Router } =  require('express')
const Trabajo = require('../models/trabajo.model')
const Usuario = require('../models/usuario.model')
const Valoracion = require('../models/valoracion.model')
const verificarToken = require('../tools/verificarToken')

const router = Router()

router.post('/trabajo/valoracion', verificarToken, async (req, resp) => {
    const {trabajoId} = req.body
    const autor = await Usuario.findById(req.usuario._id)
    const trabajo = await Trabajo.findById(trabajoId)
    const valoracion = await Valoracion.find({autor, trabajo})
    return resp.json({encontrado:valoracion.length > 0})
})

router.post('/trabajo/valorar/sumar',verificarToken, async (req, resp) => {
    const {trabajoId} = req.body
    const autor = await Usuario.findById(req.usuario._id)
    const trabajo = await Trabajo.findById(trabajoId)
    const valoracion = await Valoracion.find({autor, trabajo})
    if(valoracion.length > 0){
        return resp.json({msg:'Ya existe la valoracion'})
    }else{
        await Valoracion.create({autor, trabajo})
        const newEstrellas = trabajo.estrellas + 1
        const newTrabajo = await Trabajo.findByIdAndUpdate(trabajo._id, {$set:{estrellas:newEstrellas}}, {new:true})
        resp.json({newTrabajo})
    }
})

router.post('/trabajo/valorar/restar',verificarToken, async (req, resp) => {
    const {trabajoId} = req.body
    const autor = await Usuario.findById(req.usuario._id)
    const trabajo = await Trabajo.findById(trabajoId)
    const valoracion = await Valoracion.find({autor, trabajo})
    if(valoracion.length == 0){
        return resp.json({msg:'No existe la valoracion'})
    }else{
        await Valoracion.findOneAndRemove({_id:valoracion[0]._id})
        const newEstrellas = trabajo.estrellas - 1
        const newTrabajo = await Trabajo.findByIdAndUpdate(trabajo._id, {$set:{estrellas:newEstrellas}}, {new:true})
        resp.json({newTrabajo})
    }
})

module.exports = router