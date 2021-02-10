const {Schema, model } = require('mongoose')

const valoracionSchema = new Schema({
    autor:{
        type:Schema.Types.ObjectId,
        ref:'Usuario'
    },
    trabajo:{
        type:Schema.Types.ObjectId,
        ref:'Trabajo'
    }
})

module.exports = model('Valoracion', valoracionSchema)