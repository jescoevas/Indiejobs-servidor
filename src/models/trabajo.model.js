const {Schema, model } = require('mongoose')

const trabajoSchema = new Schema({
    autor:{
        type:Schema.Types.ObjectId,
        ref:'Usuario'
    },
    cuerpo:{
        type:String,
        required:[true, 'Cuerpo necesario']
    },
    foto:{
        type:String
    },
    fecha:{
        type:Date,
        default:new Date()
    },
    estrellas:{
        type:Number,
        //default:0
    },
})

module.exports = model('Trabajo', trabajoSchema)