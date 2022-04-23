const { type } = require('express/lib/response')
const mongoose = require('mongoose')

const schema = mongoose.Schema({
        any: { type: mongoose.Schema.Types.Mixed }
})

schema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Match', schema)