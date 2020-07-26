const mongoose = require('mongoose')

const { Schema } = mongoose

const DocSchema = new Schema({
  usuario: String,	
  nombre: String,
  descripcion:  String ,
  otro: String,
  url:  String ,
  fecha_creacion:Date,
  status: String,
  hrml: String,
  rect: [],
  firmantes: [],
  num_firmantes: Number,
  num_firmados: Number,
})

const Firma_doc = mongoose.model('Firma_doc', DocSchema)

module.exports = Firma_doc