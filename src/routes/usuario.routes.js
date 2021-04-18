const { Router } = require('express')
const Usuario = require('../models/usuario.model')
const Token = require('../tools/token')
const verificarToken = require('../tools/verificarToken')
const UsuarioFotos = require('../tools/usuario-fotos')
const Trabajo = require('../models/trabajo.model')
const Seguimiento = require('../models/seguimiento.model')

const router = Router()
const usuarioFotos = new UsuarioFotos()

router.get('/usuario/:usuarioId', async(req, res) => {
    const { usuarioId } = req.params
    const usuario = await Usuario.findById(usuarioId)
    return res.json({ usuario })
})

router.post('/registro', async(req, res) => {

    const { email, telefono } = req.body
    const emailEncontrado = await Usuario.find({ email })
    const telefonoEncontrado = await Usuario.find({ telefono })

    if (emailEncontrado.length > 0) {
        return res.json({
            msg: 'Email existe',
            usuarioDB: {}
        })
    } else if (telefonoEncontrado.length > 0) {
        return res.json({
            msg: 'Telefono existe',
            usuarioDB: {}
        })
    } else {
        const usuarioDB = await Usuario.create({...req.body })
        res.json({
            msg: 'Registro realizado con exito',
            usuarioDB,
            token: Token.getJwtToken(usuarioDB)
        })
    }

})

router.put('/editar', async(req, res) => {

    const { email, telefono, id, emailUsuario, telefonoUsuario } = req.body
    const emailEncontrado = await Usuario.find({ email })
    const telefonoEncontrado = await Usuario.find({ telefono })

    if (emailEncontrado.length > 0 && email !== emailUsuario) {
        return res.json({
            msg: 'Email existe',
        })
    } else if (telefonoEncontrado.length > 0 && telefono !== telefonoUsuario) {
        return res.json({
            msg: 'Telefono existe',
        })
    } else {
        delete req.body.id
        delete req.body.emailUsuario
        delete req.body.telefonoUsuario
        await Usuario.findByIdAndUpdate(id, req.body, { new: true })
        res.json({
            msg: 'Edicion realizada con exito',
        })
    }

})

router.post('/login', async(req, res) => {
    const { email, password } = req.body
    const usuario = await Usuario.findOne({ email })
    if (!usuario)
        return res.json({ msg: "No se ha encontrado el usuario" })
    const coincide = await usuario.compararPassword(password)
    if (!coincide)
        return res.json({ msg: "Password incorrecta" })
    res.json({
        msg: "Login realizado con exito",
        usuarioId: usuario._id,
        foto: usuario.foto,
        token: Token.getJwtToken(usuario)
    })
})

router.get('/:usuarioId/foto', (req, res) => {
    const { usuarioId } = req.params
    const path = usuarioFotos.getCarpetaFoto(usuarioId)
    const foto = usuarioFotos.getFoto(usuarioId)
    const pathCompleto = `${path}/${foto}`
    res.sendFile(pathCompleto)
})

router.post('/asignarFoto', verificarToken, async(req, res) => {
    if (!req.files)
        return res.json({ msg: "No se han enviado archivos" })
    const { foto } = req.files
    if (!foto.mimetype.includes('image'))
        return res.json({ msg: "No se ha subido ninguna foto" })
    let usuario = req.usuario
    await usuarioFotos.asignarFoto(foto, usuario._id)
    const fotoUsuario = usuarioFotos.getFoto(usuario._id)
    usuario.foto = fotoUsuario
    await Usuario.findByIdAndUpdate(usuario._id, usuario, { new: true })
    res.json({
        msg: "Foto asignada",
        foto: fotoUsuario
    })
})

router.post('/checkEmail', async(req, resp) => {
    const { email } = req.body
    const encontrado = await Usuario.find({ email })
    return resp.json({ num: encontrado.length })
})

router.post('/checkTelefono', async(req, resp) => {
    const { telefono } = req.body
    const encontrado = await Usuario.find({ telefono })
    return resp.json({ num: encontrado.length })
})

router.get('/trabajadores', async(req, resp) => {
    const trabajadores = await Usuario.find({ trabajador: true })
    return resp.json({ trabajadores })
})

router.get('/trabajadores/cercanos', verificarToken, async(req, resp) => {
    const usuario = req.usuario
    const trabajadores = await Usuario.find({ trabajador: true, ciudad: usuario.ciudad })
    const cercanos = trabajadores.filter(trabajador => trabajador._id != usuario._id)
    return resp.json({ cercanos })
})

router.post('/buscador', verificarToken, async(req, resp) => {
    const { empleo, ciudad } = req.body
    const usuario = req.usuario
    let todos = []
    if (empleo != '' && ciudad != '') todos = await Usuario.find({ trabajador: true, empleo, ciudad }).collation({ locale: 'es', strength: 2 })
    else if (empleo != '') todos = await Usuario.find({ trabajador: true, empleo }).collation({ locale: 'es', strength: 2 })
    else if (ciudad != '') todos = await Usuario.find({ trabajador: true, ciudad }).collation({ locale: 'es', strength: 2 })
    else todos = await Usuario.find({ trabajador: true })
    const trabajadores = todos.filter(trabajador => trabajador._id != usuario._id)
    return resp.json({ trabajadores })
})

router.post('/trabajadores/top', verificarToken, async(req, resp) => {
    const { tipo, orden } = req.body
    let col = null
    if (tipo == 'Local') {
        const usuario = req.usuario
        col = await Usuario.find({ trabajador: true, ciudad: usuario.ciudad })
    } else {
        col = await Usuario.find({ trabajador: true })
    }

    let trabajadores = []
    if (orden == 'Estrellas') {
        trabajadores = await ordenarPorEstrellas(col)
    } else if (orden == 'Seguidores') {
        trabajadores = await ordenarPorSeguidores(col)
    } else {
        trabajadores = await ordenarPorTrabajos(col)
    }

    return resp.json({ trabajadores })
})

ordenarPorEstrellas = async(col) => {
    let listo = false;
    while (!listo) {
        listo = true;
        for (let i = 1; i < col.length; i += 1) {
            let estrellasA = 0
            let estrellasB = 0
            const trabajosA = await Trabajo.find({ autor: col[i - 1] })
            const trabajosB = await Trabajo.find({ autor: col[i] })
            for (let index = 0; index < trabajosA.length; index++) {
                const trabajo = trabajosA[index];
                estrellasA += trabajo.estrellas
            }
            for (let index = 0; index < trabajosB.length; index++) {
                const trabajo = trabajosB[index];
                estrellasB += trabajo.estrellas
            }
            if (estrellasA < estrellasB) {
                listo = false;
                let tmp = col[i - 1];
                col[i - 1] = col[i];
                col[i] = tmp;
            }
        }
    }
    return col;
}

ordenarPorSeguidores = async(col) => {
    let listo = false;
    while (!listo) {
        listo = true;
        for (let i = 1; i < col.length; i += 1) {
            const seguidoresA = await Seguimiento.find({ seguido: col[i - 1] })
            const seguidoresB = await Seguimiento.find({ seguido: col[i] })
            if (seguidoresA < seguidoresB) {
                listo = false;
                let tmp = col[i - 1];
                col[i - 1] = col[i];
                col[i] = tmp;
            }
        }
    }
    return col;
}

ordenarPorTrabajos = async(col) => {
    let listo = false;
    while (!listo) {
        listo = true;
        for (let i = 1; i < col.length; i += 1) {
            const trabajosA = await Trabajo.find({ autor: col[i - 1] })
            const trabajosB = await Trabajo.find({ autor: col[i] })
            if (trabajosA.length < trabajosB.length) {
                listo = false;
                let tmp = col[i - 1];
                col[i - 1] = col[i];
                col[i] = tmp;
            }
        }
    }
    return col;
}

module.exports = router