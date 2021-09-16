const mongoose = require('mongoose')

const { Schema } = mongoose

const LinkpagoSchema = new Schema({
	usuario: String,
	tipodoc: String,
    numdoc: String,
    nombre:  String,
    correo: String,
    celular: String,  
    subtotal: Number,
    iva: Number,
    total: Number,
    numref: String,
    numrefori: String,
    fecha_creacion:Date,
	status: String,
})

const Linkpagos = mongoose.model('linkpagos',LinkpagoSchema)

module.exports = Linkpagos


