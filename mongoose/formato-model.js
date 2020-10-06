const mongoose = require('mongoose')

const { Schema } = mongoose

const TemplateSchema = new Schema({
	usuario: String,
   nombre: String,
  descripcion:  String,
  fecha_creacion:Date,
  url: String,
  nom_template: String
})

const Template = mongoose.model('formatos',TemplateSchema)

module.exports = Template


