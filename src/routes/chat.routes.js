const { Router } = require('express')
const Usuario = require('../models/usuario.model')
const Chat = require('../models/chat.model')
const Mensaje = require('../models/mensaje.model')
const verificarToken = require('../tools/verificarToken')

const router = Router()

router.post('/chat/mios', verificarToken, async(req, resp) => {
    const usuario = req.usuario
    const chats = await Chat.find({ $or: [{ 'usuario1': usuario }, { 'usuario2': usuario }] })
    resp.json({ chats })
})

router.get('/chat/:chatId', async(req, resp) => {
    const { chatId } = req.params
    const chat = await Chat.findById(chatId)
    const mensajes = await Mensaje.find({ chat })
    resp.json({ mensajes })
})

router.post('/chat/create', verificarToken, async(req, resp) => {
    const usuario1 = req.usuario
    const { usuario2ID } = req.body
    const usuario2 = await Usuario.findById(usuario2ID)
    const chat = await Chat.create({ usuario1, usuario2 })
    resp.json({ chat })
})

router.post('/mensaje/create', verificarToken, async(req, resp) => {
    const autor = req.usuario
    const { chatId, cuerpo } = req.body
    const chat = await Chat.findById(chatId)
    const mensaje = await Mensaje.create({ chat, autor, cuerpo })
    resp.json({ mensaje })
})

router.post('/chat/existe', verificarToken, async(req, resp) => {
    const usuario1 = req.usuario
    const { usuario2ID } = req.body
    const usuario2 = await Usuario.findById(usuario2ID)
    const chats1 = await Chat.find({ usuario1, usuario2 })
    const chats2 = await Chat.find({ usuario1: usuario2, usuario2: usuario1 })
    resp.json({ encontrado: chats1.length > 0 || chats2.length > 0 })
})

module.exports = router