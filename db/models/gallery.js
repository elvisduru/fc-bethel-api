const mongoose = require('mongoose')

const gallerySchema = new mongoose.Schema({
  src: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Gallery', gallerySchema)