const { Schema, model } = require('mongoose')

const seguimientoSchema = new Schema({
    seguido: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    seguidor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
})

module.exports = model('Seguimiento', seguimientoSchema)