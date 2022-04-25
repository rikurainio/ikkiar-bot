// THIS SCHEMA REPRESENTS THE MATCHMAKING OBJECTS
// ONE ikkiarmatch document holds information about one MATCHMADE

// THIS MIGHT NOT BE NEEDED YET...

const { type } = require('express/lib/response')
const mongoose = require('mongoose')

const schema = mongoose.Schema({
        blue1: { type: String },
        blue2: { type: String },
        blue3: { type: String },
        blue4: { type: String },
        blue5: { type: String },
        
        red1: { type: String },
        red2: { type: String },
        red3: { type: String },
        red4: { type: String },
        red5: { type: String }
})

schema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Ikkiarmatch', schema)