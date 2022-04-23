const mongoose = require('mongoose')

const schema = mongoose.Schema({
    ///leagueIGN: { type: String, required: true},
    discordName: { type: String, required: true },
    discordId: { type: String, required: true, unique: true},
    role: { type: String, required: true }
})

schema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Queuer', schema)