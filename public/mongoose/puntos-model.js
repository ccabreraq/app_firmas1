const mongoose = require('mongoose')

const { Schema } = mongoose

const PuntosSchema = new Schema({
    codigo: {
      type: String,
      required: true,
    },
	nombre: {
      type: String,
      required: true,
    },
    authorization : {
      type: String,
      required: true,
    },
    client : String,
    descuento : Number,
    descuento_motos : Number,
    estado : String,
    mail_derivacion : String,  // mail donde se envia cuando se vende un producto
    mail_general : String,
    ciudad : String,
    nombre : String,
    sucursal : Number,  // codigo de punto de venta de soat  
})


const Puntos = mongoose.model('Puntos', PuntosSchema)

module.exports = Puntos