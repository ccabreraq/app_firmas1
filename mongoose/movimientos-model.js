const mongoose = require('mongoose')

const { Schema } = mongoose

const MovimientosSchema = new Schema({
  nombreReferencia2: String,
  referencia1: String,
  referencia2: String,
  fecha: Date,
  valor: String,
  status: { type: String, enum: ['cotizado', 'pagado'], required: true }
})

const Movimientos = mongoose.model('Movimientos', MovimientosSchema)

module.exports = Movimientos
