const { Router } = require('express')
const Usuario = require('../models/usuario.model')
const Seguimiento = require('../models/seguimiento.model')
const verificarToken = require('../tools/verificarToken')

const router = Router()

router.post("/follow", verificarToken, async(req, resp) => {
    const { _id } = req.body
    const seguido = await Usuario.findById(_id)
    const seguidor = req.usuario
    const seguimientos = await Seguimiento.find({ seguido, seguidor })
    if (seguimientos.length > 0) {
        return resp.json({ msg: "Ya sigue a este usuario" })
    }
    await Seguimiento.create({ seguido, seguidor })
    return resp.json({
        msg: "Acaba de seguir a este usuario"
    })
})

router.post("/unfollow", verificarToken, async(req, resp) => {
    const { _id } = req.body
    const seguido = await Usuario.findById(_id)
    const seguidor = req.usuario
    const seguimientos = await Seguimiento.find({ seguido, seguidor })
    if (seguimientos.length == 0) {
        return resp.json({ msg: "No sigue a este usuario" })
    }
    await Seguimiento.findOneAndRemove({ _id: seguimientos[0]._id })
    return resp.json({
        msg: "Ha dejado de seguir a este usuario"
    })
})

router.post("/seguido", verificarToken, async(req, resp) => {
    const { _id } = req.body
    const seguidor = req.usuario
    const seguido = await Usuario.findById(_id)
    const seguimientos = await Seguimiento.find({ seguido, seguidor })
    return resp.json({ seguido: seguimientos.length > 0 })
})

router.post("/seguidores", async(req, resp) => {
    const { _id } = req.body
    const seguido = await Usuario.findById(_id)
    const seguimientos = await Seguimiento.find({ seguido })

    let seguidores = [];
    for (let i = 0; i < seguimientos.length; i++) {
        const seguimiento = seguimientos[i];
        const seguidor = await Usuario.findById(seguimiento.seguidor)
        seguidores.push(seguidor);
    }

    return resp.json({ seguidores, num: seguidores.length })
})

router.post("/siguiendo", async(req, resp) => {
    const { _id } = req.body
    const seguidor = await Usuario.findById(_id)
    const seguimientos = await Seguimiento.find({ seguidor })

    let siguiendo = [];
    for (let i = 0; i < seguimientos.length; i++) {
        const seguimiento = seguimientos[i];
        const seguido = await Usuario.findById(seguimiento.seguido)
        siguiendo.push(seguido);
    }

    return resp.json({ siguiendo, num: siguiendo.length })
})



module.exports = router