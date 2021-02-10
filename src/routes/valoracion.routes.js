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
    console.log(`${autor.nombre} ha hecho ${valoracion.length} valoraciones a ${trabajo.cuerpo}`)
    console.log(valoracion)
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
        console.log(`El autor ${autor.nombre} suma valoracion a ${trabajo.cuerpo}`)
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
    console.log(`El trabajo es: ${trabajo.cuerpo}`)
    console.log(`El autor es: ${autor.nombre}`)
    const valoracion = await Valoracion.find({autor, trabajo})
    console.log(`La valoracion es: ${valoracion}, con ID: ${valoracion[0]._id}`)
    if(valoracion.length == 0){
        return resp.json({msg:'No existe la valoracion'})
    }else{
        console.log(`El autor ${autor.nombre} resta valoracion a ${trabajo.cuerpo}`)
        await Valoracion.findOneAndRemove({_id:valoracion[0]._id})
        const newEstrellas = trabajo.estrellas - 1
        const newTrabajo = await Trabajo.findByIdAndUpdate(trabajo._id, {$set:{estrellas:newEstrellas}}, {new:true})
        resp.json({newTrabajo})
    }
})

module.exports = router