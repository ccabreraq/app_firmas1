const mongoose = require('mongoose')

const { Schema } = mongoose

const EntregasSchema = new Schema({
	_id: Number,
  ping_carrito: String,
  first_name: String,
  last_name: String,
  line_1: String,
  email: String,
  city: String,
  county: String,
  country: String,
  postcode: String
})

const Entregas = mongoose.model('Entregas', EntregasSchema)

module.exports = Entregas

