const {Schema, model } = require('mongoose')
const bcryptjs = require('bcryptjs')

const usuarioSchema = new Schema({
    foto:{
        type:String
    },
    nombre:{
        type:String,
        required:[true, 'Nombre necesario']
    },
    email:{
        type:String,
        unique:true,
        required:[true, 'Email necesario']
    },
    password:{
        type:String,
        required:[true, 'Password necesaria']
    },
    fechaNacimiento:{
        type:Date,
        required:[true, "Fecha de nacimiento necesaria"]
    },
    telefono:{
        type:Number,
        required:[true, "Telefono necesario"]
    },
    ciudad:{
        type:String,
        required:[true, "Ciudad necesaria"]
    },
    direccion:{
        type:String,
        required:[true, "Direccion necesaria"]
    },
    codigoPostal:{
        type:Number,
        required:[true, "Codigo postal necesario"]
    },
    trabajador:{
        type:Boolean,
        required:[true, "Se debe especificar si es trabajador"]
    },
    empleo:{
        type:String,
        required:false
    },
    descripcion:{
        type:String,
        required:false
    },
    fechaRegistro:{
        type:Date,
        default:new Date()
    }
})

usuarioSchema.pre('save', function(next){
    this.password = bcryptjs.hashSync(this.password, 10)
    next()
})

usuarioSchema.method('compararPassword', async function(password){
    return await bcryptjs.compareSync(password, this.password)
})

module.exports = model('Usuario', usuarioSchema)