const mongoose = require('mongoose')

const schema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 16
  },
  
  roles: {
    main: { type: String },
    second: { type: String },
  },

  discordId: {
    type: String, 
  },

  points: {
    type: Number,
    required: true,
    default: 1000
  },

  wins: {
    type: Number,
    required: true
  },

  losses: {
    type: Number,
    required: true
  },

  elo: {
    type: Number,
    default: 0
  },

  puuid: {
    type: String,
    required: true
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