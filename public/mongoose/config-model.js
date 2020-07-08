const mongoose = require('mongoose')

const { Schema } = mongoose

const ConfigSchema = new Schema({
  nombre: String,
  decripcion: String, 
  tipo: String,
  valstring: String,
  valnumbre: Number,
  valdate: Date,
  valbol: Boolean,
})

const Config = mongoose.model('Config', ConfigSchema)

module.exports = Config
