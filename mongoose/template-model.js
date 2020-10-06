const mongoose = require('mongoose')

const { Schema } = mongoose

const TemplateSchema = new Schema({
	usuario: String,
   nom_template: String,
  descripcion:  String,
  fecha_creacion:Date,
  template:String,
  url: String,
 modelo: Array
})

const Templates = mongoose.model('templates',TemplateSchema)

module.exports = Templates


