const mongoose = require('mongoose')

const { Schema } = mongoose

const UserSchema = new Schema({
  cedula: { type: String, required: true, unique: true },
   nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  celular: { type: String, required: true  },
 email: { type: String, required: true },
  encryptedPassword: { type: String},
  role: { type: String, enum: ['admin', 'restricted'], required: true },
})

const User = mongoose.model('User', UserSchema)

module.exports = User

