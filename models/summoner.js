const mongoose = require('mongoose')

const schema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 16
  },
  roles: {
    main: { type: String, required: true },
    second: { type: String, required: true },
  },
  bio: {
      type: String
  },
  discordId: { type: String },
  points: {
      type: Number,
      required: true,
      default: 0
  },
  elo: {
      type: Number,
      default: 0
  }
  
})

schema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Summoner', schema)