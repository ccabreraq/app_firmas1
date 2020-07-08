const mongoose = require('mongoose')

const { Schema } = mongoose

const ModelosvehiculosSchema = new Schema({
    BrandId: String,
    BrandCode: String,
    Description: String,
    BrandLineId: String,
    BrandLineCode: String,
    LineName: String,
    Disabled: String

})

const Modelosvehiculos = mongoose.model('Modelosvehiculos', ModelosvehiculosSchema)

module.exports = Modelosvehiculos
