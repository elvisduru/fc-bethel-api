const mongoose = require("mongoose")

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Subscribe = mongoose.model('Subscribe', subscriberSchema)

module.exports = Subscribe