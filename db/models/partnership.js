const mongoose = require("mongoose")

const partnershipSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  phone: String,
  type: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Partnership = mongoose.model('Partnership', partnershipSchema)

module.exports = Partnership