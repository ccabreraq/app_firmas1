const mongoose = require('mongoose')

const { Schema } = mongoose

const UserSchema = new Schema({
  email: { type: String, required: true },
  encryptedPassword: { type: String, required: true },
  role: { type: String, enum: ['admin', 'restricted'], required: true },
})

const User = mongoose.model('User', UserSchema)

module.exports = User
