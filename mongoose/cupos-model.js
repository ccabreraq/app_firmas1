const mongoose = require('mongoose')

const { Schema } = mongoose

const CuposSchema = new Schema({
  id_usuario: { type: String, required: true },
  cupo_prepago: { type: Number },
  cupo_total: { type: Number },
  cupo_prueba: { type: Number },
  cupo_postpago: { type: Number },
  tipo: { type: Array},
})

const Cupos = mongoose.model('Cupos', CuposSchema)

module.exports = Cupos

