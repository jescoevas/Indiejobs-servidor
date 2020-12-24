const {Schema, model } = require('mongoose')

const reseñaSchema = new Schema({
    autor:{
        type:Schema.Types.ObjectId,
        ref:'Usuario'
    },
    receptor:{
        type:Schema.Types.ObjectId,
        ref:'Usuario'
    },
    cuerpo:{
        type:String,
        required:[true, 'Cuerpo necesario']
    }
})

module.exports = model('Reseña', reseñaSchema)