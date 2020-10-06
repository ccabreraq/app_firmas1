const mongoose = require('mongoose')

const { Schema } = mongoose

const DocSchema = new Schema({
  name: String
})

const Firma_doc = mongoose.model('templates', DocSchema)

module.exports = Firma_doc