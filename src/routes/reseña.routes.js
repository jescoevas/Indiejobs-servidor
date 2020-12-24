const { Router } =  require('express')
const Reseña = require('../models/reseña.model')
const Usuario = require('../models/usuario.model')
const verificarToken = require('../tools/verificarToken')

const router = Router()

router.post('/usuario/resenas', async (req, resp) => {
    const {id} = req.body
    const receptor = await Usuario.findById(id)
    const reseñas = await Reseña.find({receptor})
    return resp.json({reseñas})
})

router.post('/resena/create',verificarToken, async (req, resp) => {
    const idAutor = req.usuario._id
    const { idReceptor, cuerpo} = req.body
    const autor = await Usuario.findById(idAutor)
    const receptor = await Usuario.findById(idReceptor)
    const reseñaDB = await Reseña.create({autor, receptor, cuerpo})
    resp.json({reseñaDB})
})

module.exports = router